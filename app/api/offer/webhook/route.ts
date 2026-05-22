import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { sanitizeSanityData } from '@/lib/sanitize';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Offer/Webhook] Missing Stripe configuration');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    console.error('[Offer/Webhook] Missing stripe signature');
    return NextResponse.json({ error: 'Invalid webhook configuration' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Offer/Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    console.log('[Offer/Webhook] Checkout completed:', session.id);

    try {
      const isEs = meta.locale === 'es';

      // ── Fetch Sanity settings for admin emails + PDF template URL ──────────
      let adminEmails: string[] = [];
      let pdfTemplateUrl: string | null = null;
      let pdfFieldMap: Record<string, string> | null = null;

      try {
        const { client } = await import('@/sanity/lib/client');
        const rawSettings = await client.fetch(
          `*[_type == "settings"][0]{
            contactRecipientEmails,
            "pdfTemplateUrl": propertyOfferPdfTemplate.asset->url,
            "pdfFieldMap": propertyOfferPdfFieldMap
          }`
        );

        // Sanitize settings to remove invisible Unicode characters
        const settings = sanitizeSanityData(rawSettings);

        if (settings?.contactRecipientEmails?.length) {
          adminEmails = settings.contactRecipientEmails
            .map((e: string) => e.replace(/[^\x20-\x7E]/g, '').trim())
            .filter(Boolean);
        }

        if (settings?.pdfTemplateUrl) {
          pdfTemplateUrl = settings.pdfTemplateUrl;
        }

        if (settings?.pdfFieldMap) {
          pdfFieldMap = settings.pdfFieldMap;
        }
      } catch (err) {
        console.warn('[Offer/Webhook] Failed to fetch Sanity settings:', err);
      }

      if (adminEmails.length === 0) {
        const fallback = process.env.CONTACT_RECIPIENT_EMAIL || 'delivered@resend.dev';
        adminEmails = fallback.split(',').map((e) => e.trim()).filter(Boolean);
      }

      // ── Trigger PDF Generation (using template from Sanity) ────────────────
      let pdfBase64: string | null = null;

      if (pdfTemplateUrl) {
        try {
          const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://realvilla.es'}/api/offer/generate-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              propertyId: meta.propertyId,
              propertyTitle: meta.propertyTitle,
              propertyPrice: meta.propertyPrice,
              depositAmount: meta.depositAmount,
              locale: meta.locale || 'en',
              personal: {
                fullName: meta.fullName,
                idNumber: meta.idNumber,
                email: meta.email,
                phone: meta.phone,
                address: meta.address,
              },
              offer: {
                offerPrice: meta.offerPrice,
                additionalConditions: meta.additionalConditions,
              },
              submittedAt: meta.submittedAt,
              validUntil: meta.validUntil,
              pdfTemplateUrl,
              pdfFieldMap: pdfFieldMap || undefined,
            }),
          });

          if (pdfResponse.ok) {
            const pdfData = await pdfResponse.json();
            pdfBase64 = pdfData.pdfBase64 || null;
            console.log('[Offer/Webhook] PDF generated successfully.');
          } else {
            console.error('[Offer/Webhook] PDF generation failed:', await pdfResponse.text());
          }
        } catch (pdfErr) {
          console.error('[Offer/Webhook] PDF request error:', pdfErr);
        }
      } else {
        console.warn('[Offer/Webhook] No PDF template configured in Sanity — skipping PDF generation.');
      }

      // ── Format values for emails ───────────────────────────────────────────
      const formattedOfferPrice = meta.offerPrice
        ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(meta.offerPrice))
        : '—';
      const formattedDeposit = meta.depositAmount
        ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(meta.depositAmount))
        : '—';

      const formattedDate = new Date(meta.submittedAt || new Date().toISOString())
        .toLocaleString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' }) + ' (Madrid)';

      const validUntilDate = meta.validUntil
        ? new Date(meta.validUntil).toLocaleDateString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'long' })
        : '7 days from submission';

      // ── Send Admin Email (with PDF attached) ───────────────────────────────
      const adminEmailPayload: any = {
        from: 'REALVILLA <hello@realvilla.es>',
        to: adminEmails,
        subject: `[REALVILLA] New Offer: ${meta.propertyTitle} — ${meta.fullName}`,
        html: buildAdminEmail({
          sessionId: session.id,
          propertyTitle: meta.propertyTitle,
          propertyId: meta.propertyId,
          fullName: meta.fullName,
          idNumber: meta.idNumber,
          email: meta.email,
          phone: meta.phone,
          address: meta.address,
          offerPrice: formattedOfferPrice,
          additionalConditions: meta.additionalConditions || '',
          depositAmount: formattedDeposit,
          submittedAt: formattedDate,
          validUntil: validUntilDate,
          // Telemetry
          device: meta.device || 'Unknown',
          os: meta.os || 'Unknown',
          browser: meta.browser || 'Unknown',
          country: meta.country || '',
          city: meta.city || '',
          ip: meta.ip || '',
          submissionTime: meta.submissionTime || formattedDate,
        }),
        replyTo: meta.email,
      };

      // Attach PDF to admin email
      if (pdfBase64) {
        const propertyRef = (meta.propertyId || 'property').substring(0, 8);
        const buyerRef = (meta.fullName || 'buyer').replace(/\s+/g, '-').substring(0, 20);
        adminEmailPayload.attachments = [
          {
            filename: `RealVilla-Offer-${propertyRef}-${buyerRef}.pdf`,
            content: Buffer.from(pdfBase64, 'base64'),
            contentType: 'application/pdf',
          },
        ];
      }

      await resend.emails.send(adminEmailPayload);

      // ── Send Buyer Confirmation Email (with PDF attached) ──────────────────
      const buyerEmailPayload: any = {
        from: 'REALVILLA <hello@realvilla.es>',
        to: [meta.email],
        subject: isEs
          ? `REALVILLA — Confirmación de Propuesta: ${meta.propertyTitle}`
          : `REALVILLA — Proposal Confirmation: ${meta.propertyTitle}`,
        html: buildBuyerEmail({
          isEs,
          propertyTitle: meta.propertyTitle,
          fullName: meta.fullName,
          offerPrice: formattedOfferPrice,
          depositAmount: formattedDeposit,
          sessionId: session.id,
          validUntil: validUntilDate,
          submittedAt: formattedDate,
        }),
      };

      // Attach PDF to buyer email (same as admin)
      if (pdfBase64) {
        const propertyRef = (meta.propertyId || 'property').substring(0, 8);
        const buyerRef = (meta.fullName || 'buyer').replace(/\s+/g, '-').substring(0, 20);
        buyerEmailPayload.attachments = [
          {
            filename: `RealVilla-Offer-${propertyRef}-${buyerRef}.pdf`,
            content: Buffer.from(pdfBase64, 'base64'),
            contentType: 'application/pdf',
          },
        ];
      }

      await resend.emails.send(buyerEmailPayload);

      console.log('[Offer/Webhook] All emails dispatched for session:', session.id);
    } catch (err: any) {
      console.error('[Offer/Webhook] Post-payment processing failed:', err);
      // Return 200 to prevent Stripe retrying — email/PDF failures are non-critical
    }
  }

  if (event.type === 'checkout.session.expired') {
    console.log('[Offer/Webhook] Checkout session expired:', event.data.object.id);
  }

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────────────────────────────
// EMAIL BUILDERS
// ─────────────────────────────────────────────────────────────────────

function buildAdminEmail(data: {
  sessionId: string;
  propertyTitle: string;
  propertyId: string;
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  address: string;
  offerPrice: string;
  additionalConditions: string;
  depositAmount: string;
  submittedAt: string;
  validUntil: string;
  device: string;
  os: string;
  browser: string;
  country: string;
  city: string;
  ip: string;
  submissionTime: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Manrope:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F8F8F5;font-family:'Manrope',sans-serif;color:#1A1A1A;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#F8F8F5;padding:50px 20px;">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#FFF;border:1px solid #EBEBE5;">
        <tr><td height="5" style="background:#D4AF37;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:40px 45px 30px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td><img src="https://realvilla.es/images/logo-mark-raster.png" alt="Realvilla" width="48" style="display:block;" /></td>
              <td align="right"><div style="font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#111;">PROPERTY OFFER RECEIVED</div></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 45px 45px;">
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;color:#111;margin:0 0 30px;text-transform:uppercase;">
            New Offer: ${data.propertyTitle}
          </h2>
          <table width="100%" cellspacing="0" cellpadding="0">
            ${buildRow('BUYER', `<strong>${data.fullName}</strong>`)}
            ${buildRow('ID / PASSPORT', data.idNumber)}
            ${buildRow('EMAIL', `<a href="mailto:${data.email}" style="color:#D4AF37;">${data.email}</a>`)}
            ${buildRow('PHONE', `<a href="tel:${data.phone}" style="color:#111;">${data.phone}</a>`)}
            ${buildRow('ADDRESS', data.address)}
            ${buildRow('OFFERED PRICE', `<strong>${data.offerPrice}</strong>`)}
            ${data.additionalConditions ? buildRow('CONDITIONS', `${data.additionalConditions}`) : ''}
            ${buildRow('DEPOSIT PAID', `<strong>${data.depositAmount}</strong> ✅`)}
            ${buildRow('STRIPE SESSION', `<code style="font-size:11px;">${data.sessionId}</code>`)}
            ${buildRow('SUBMITTED', data.submittedAt)}
            ${buildRow('VALID UNTIL', data.validUntil)}
          </table>

          <!-- Touchpoint Metadata Section -->
          <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:45px;border-top:1px solid #F4F4F0;padding-top:35px;">
            <tr><td>
              <div style="font-size:10px;font-weight:400;color:#111;letter-spacing:2px;text-transform:uppercase;margin-bottom:18px;">TOUCHPOINT METADATA</div>
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" valign="top" style="padding-bottom:15px;padding-right:15px;">
                    <div style="font-size:9px;font-weight:600;color:#A0A098;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">DEVICE & OPERATING SOFTWARE</div>
                    <div style="font-size:12px;color:#333;font-weight:500;">${data.device} • ${data.os}</div>
                    <div style="font-size:11px;color:#888;margin-top:3px;">${data.browser}</div>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom:15px;">
                    <div style="font-size:9px;font-weight:600;color:#A0A098;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">SUBMISSION TIMESTAMPS</div>
                    <div style="font-size:12px;color:#333;font-weight:500;">${data.submissionTime}</div>
                    <div style="font-size:11px;color:#888;margin-top:3px;">Network Address: ${data.ip}</div>
                  </td>
                </tr>
                ${(data.city || data.country) ? `
                <tr>
                  <td colspan="2" valign="top" style="padding-top:8px;">
                    <div style="font-size:9px;font-weight:600;color:#A0A098;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">ESTIMATED GEOGRAPHIC LOCATOR</div>
                    <div style="font-size:12px;color:#D4AF37;font-weight:600;">
                      📍 ${data.city ? data.city + ', ' : ''}${data.country}
                    </div>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td></tr>
          </table>

          <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:40px;">
            <tr><td align="center">
              <a href="mailto:${data.email}" style="display:inline-block;background:#111;color:#FFF;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;margin:0 5px 8px;">
                REPLY VIA EMAIL
              </a>
              ${data.phone ? `
              <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" target="_blank" style="display:inline-block;background:#25D366;color:#FFF;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;margin:0 5px 8px;">
                RESPOND VIA WHATSAPP
              </a>
              ` : ''}
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="background:#FAF9F6;padding:30px 40px;border-top:1px solid #EBEBE5;">
          <p style="font-size:10px;color:#111;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">REALVILLA</p>
          <p style="font-size:10px;color:#B8B8B0;margin:0;">Secure notification from <a href="https://realvilla.es" style="color:#9B9B95;">realvilla.es</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildRow(label: string, value: string) {
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #F4F4F0;">
      <div style="font-size:9px;font-weight:600;color:#A0A098;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">${label}</div>
      <div style="font-size:14px;color:#111;">${value}</div>
    </td>
  </tr>`;
}

function buildBuyerEmail(data: {
  isEs: boolean;
  propertyTitle: string;
  fullName: string;
  offerPrice: string;
  depositAmount: string;
  sessionId: string;
  validUntil: string;
  submittedAt: string;
}) {
  const { isEs } = data;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Manrope:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F8F8F5;font-family:'Manrope',sans-serif;color:#1A1A1A;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#F8F8F5;padding:50px 20px;">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#FFF;border:1px solid #EBEBE5;">
        <tr><td height="5" style="background:#D4AF37;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:50px 45px 35px;">
          <img src="https://realvilla.es/images/logo-mark-raster.png" alt="Realvilla" width="48" style="display:block;margin-bottom:30px;" />
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:400;color:#111;margin:0 0 20px;text-transform:uppercase;">
            ${isEs ? '¡Propuesta Recibida!' : 'Proposal Received!'}
          </h2>
          <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 30px;">
            ${isEs
    ? `Estimado/a <strong>${data.fullName}</strong>, su propuesta de compra para <strong>${data.propertyTitle}</strong> ha sido recibida y el pago del depósito confirmado correctamente.`
    : `Dear <strong>${data.fullName}</strong>, your purchase proposal for <strong>${data.propertyTitle}</strong> has been received and the deposit payment has been confirmed.`
  }
          </p>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAF8;border-left:3px solid #D4AF37;margin-bottom:30px;">
            <tr><td style="padding:25px 30px;">
              <div style="font-size:10px;color:#A0A098;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
                ${isEs ? 'RESUMEN DE LA PROPUESTA' : 'PROPOSAL SUMMARY'}
              </div>
              <div style="font-size:13px;color:#555;line-height:1.8;">
                <strong>${data.propertyTitle}</strong><br/>
                ${isEs ? 'Precio ofertado' : 'Offered price'}: <strong>${data.offerPrice}</strong><br/>
                ${isEs ? 'Depósito pagado' : 'Deposit paid'}: <strong>${data.depositAmount}</strong><br/>
                ${isEs ? 'Válida hasta' : 'Valid until'}: <strong>${data.validUntil}</strong>
              </div>
            </td></tr>
          </table>
          <p style="font-size:13px;color:#666;line-height:1.7;margin:0 0 30px;">
            ${isEs
    ? 'Nuestro equipo procesará su propuesta y se pondrá en contacto con usted en los próximos días hábiles. El documento PDF de su propuesta se adjunta a este correo.'
    : 'Our team will process your proposal and get back to you within the next business days. Your proposal PDF document is attached to this email.'
  }
          </p>
          <p style="font-size:11px;color:#B8B8B0;line-height:1.6;margin:0;">
            ${isEs
    ? `Referencia de pago: ${data.sessionId}`
    : `Payment reference: ${data.sessionId}`
  }
          </p>
        </td></tr>
        <tr><td align="center" style="background:#FAF9F6;padding:30px 40px;border-top:1px solid #EBEBE5;">
          <p style="font-size:10px;color:#111;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">REALVILLA</p>
          <p style="font-size:10px;color:#B8B8B0;margin:0;"><a href="https://realvilla.es" style="color:#9B9B95;">realvilla.es</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
