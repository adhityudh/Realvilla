import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { removeInvisibleChars } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const formData = await request.formData();

    const propertyId = formData.get('propertyId') as string;
    const propertyCode = formData.get('propertyCode') as string;
    const propertyTitle = formData.get('propertyTitle') as string;
    const locale = formData.get('locale') as string;
    const depositAmount = formData.get('depositAmount') as string;
    const personalStr = formData.get('personal') as string;
    const offerStr = formData.get('offer') as string;
    const receiptFile = formData.get('receipt') as File;

    if (!propertyId || !personalStr || !offerStr || !receiptFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const personal = JSON.parse(personalStr);
    const offer = JSON.parse(offerStr);
    const isEs = locale === 'es';

    // ── Generate PDF via internal API ────────────────────────────────────
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let pdfBase64 = null;

    try {
      const pdfResponse = await fetch(`${origin}/api/offer/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          propertyId,
          personal,
          offer
        }),
      });

      if (pdfResponse.ok) {
        const pdfData = await pdfResponse.json();
        if (pdfData.pdfBase64) {
          pdfBase64 = pdfData.pdfBase64;
          console.log('[Offer/Submit] PDF generated successfully');
        }
      } else {
        const pdfErr = await pdfResponse.text();
        console.error('[Offer/Submit] PDF request failed:', pdfErr);
      }
    } catch (pdfErr) {
      console.error('[Offer/Submit] PDF request error:', pdfErr);
    }

    // ── Format values for emails ───────────────────────────────────────────
    const formattedOfferPrice = offer.offerPrice
      ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(offer.offerPrice))
      : '—';
    const formattedDeposit = depositAmount
      ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(depositAmount))
      : '—';

    const submittedAt = new Date().toISOString();
    const formattedDate = new Date(submittedAt)
      .toLocaleString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' }) + ' (Madrid)';

    const validUntilDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'long' });
    const sessionId = `BT-${Date.now()}`; // Fake session ID for Bank Transfer

    // Dynamically fetch admin recipients from Sanity settings
    let adminEmails: string[] = [];
    try {
      const { client } = await import('@/sanity/lib/client');
      const { sanitizeSanityData } = await import('@/lib/sanitize');
      const rawSettings = await client.fetch(`*[_type == "settings"][0]{ contactRecipientEmails }`);
      const settings = sanitizeSanityData(rawSettings);
      if (settings?.contactRecipientEmails && Array.isArray(settings.contactRecipientEmails) && settings.contactRecipientEmails.length > 0) {
        adminEmails = settings.contactRecipientEmails
          .map((e: string) => e.trim())
          .filter(Boolean);
      }
    } catch (fetchErr) {
      console.warn('[Offer/Submit] Dynamic settings fetch from Sanity failed:', fetchErr);
    }

    if (adminEmails.length === 0) {
      const fallbackEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'hello@realvilla.es';
      adminEmails = fallbackEmail.split(',').map(e => e.trim()).filter(Boolean);
    }

    // ── Read receipt file ────────────────────────────────────────────────
    const receiptBuffer = Buffer.from(await receiptFile.arrayBuffer());

    // ── Send Admin Email (with PDF and receipt attached) ─────────────────
    const adminEmailPayload: any = {
      from: 'REALVILLA <hello@realvilla.es>',
      to: adminEmails,
      subject: `[REALVILLA] New Offer: ${propertyCode ? `[${propertyCode}] ` : ''}${propertyTitle || ''} — ${personal.fullName}`,
      html: buildAdminEmail({
        sessionId,
        propertyTitle,
        propertyCode: propertyCode || undefined,
        propertyId,
        fullName: personal.fullName,
        idNumber: personal.idNumber,
        email: personal.email,
        phone: personal.phone,
        address: personal.address,
        offerPrice: formattedOfferPrice,
        additionalConditions: offer.additionalConditions || '',
        depositAmount: formattedDeposit,
        submittedAt: formattedDate,
        validUntil: validUntilDate,
        device: 'Bank Transfer',
        os: 'N/A',
        browser: 'N/A',
        country: '',
        city: '',
        ip: '',
        submissionTime: formattedDate,
      }),
      replyTo: personal.email,
      attachments: [
        {
          filename: `Receipt-${receiptFile.name}`,
          content: receiptBuffer,
          contentType: receiptFile.type,
        }
      ],
    };

    if (pdfBase64) {
      const propCode = propertyCode || (propertyId || 'property').substring(0, 8);
      const buyerRef = (personal.fullName || 'buyer').replace(/\s+/g, '-').substring(0, 20);
      adminEmailPayload.attachments.push({
        filename: `RealVilla-Offer-${propCode}-${buyerRef}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      });
    }

    const adminRes = await resend.emails.send(adminEmailPayload);
    if (adminRes.error) {
      console.error('[Offer/Submit] Admin email error:', adminRes.error);
    } else {
      console.log('[Offer/Submit] Admin email sent:', adminRes.data);
    }

    // ── Send Buyer Confirmation Email (with PDF attached) ──────────────────
    const buyerEmailPayload: any = {
      from: 'REALVILLA <hello@realvilla.es>',
      to: [personal.email],
      subject: isEs
        ? `REALVILLA — Confirmación de Propuesta: ${propertyCode ? `[${propertyCode}] ` : ''}${propertyTitle || ''}`
        : `REALVILLA — Proposal Confirmation: ${propertyCode ? `[${propertyCode}] ` : ''}${propertyTitle || ''}`,
      html: buildBuyerEmail({
        isEs,
        propertyTitle,
        propertyCode: propertyCode || undefined,
        fullName: personal.fullName,
        offerPrice: formattedOfferPrice,
        depositAmount: formattedDeposit,
        sessionId,
        validUntil: validUntilDate,
        submittedAt: formattedDate,
      }),
      attachments: [],
    };

    if (pdfBase64) {
      const propCode = propertyCode || (propertyId || 'property').substring(0, 8);
      const buyerRef = (personal.fullName || 'buyer').replace(/\s+/g, '-').substring(0, 20);
      buyerEmailPayload.attachments.push({
        filename: `RealVilla-Offer-${propCode}-${buyerRef}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      });
    }

    const buyerRes = await resend.emails.send(buyerEmailPayload);
    if (buyerRes.error) {
      console.error('[Offer/Submit] Buyer email error:', buyerRes.error);
    } else {
      console.log('[Offer/Submit] Buyer email sent:', buyerRes.data);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Offer/Submit] Error processing offer:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────
// EMAIL BUILDERS
// ─────────────────────────────────────────────────────────────────────

function buildAdminEmail(data: any) {
  const cleanPropertyTitle = removeInvisibleChars(data.propertyTitle);
  const formattedPropertyTitle = data.propertyCode ? `[${removeInvisibleChars(data.propertyCode)}] ${cleanPropertyTitle}` : cleanPropertyTitle;
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
            New Offer: ${formattedPropertyTitle}
          </h2>
          <table width="100%" cellspacing="0" cellpadding="0">
            ${buildRow('BUYER', `<strong>${data.fullName}</strong>`)}
            ${buildRow('ID / PASSPORT', data.idNumber)}
            ${buildRow('EMAIL', `<a href="mailto:${data.email}" style="color:#D4AF37;">${data.email}</a>`)}
            ${buildRow('PHONE', `<a href="tel:${data.phone}" style="color:#111;">${data.phone}</a>`)}
            ${buildRow('ADDRESS', data.address)}
            ${buildRow('OFFERED PRICE', `<strong>${data.offerPrice}</strong>`)}
            ${data.additionalConditions ? buildRow('CONDITIONS', `${data.additionalConditions}`) : ''}
            ${buildRow('DEPOSIT RECEIPT', `<strong>Attached</strong> ✅`)}
            ${buildRow('SESSION', `<code style="font-size:11px;">${data.sessionId}</code>`)}
            ${buildRow('SUBMITTED', data.submittedAt)}
            ${buildRow('VALID UNTIL', data.validUntil)}
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

function buildBuyerEmail(data: any) {
  const { isEs } = data;
  const cleanPropertyTitle = removeInvisibleChars(data.propertyTitle);
  const formattedPropertyTitle = data.propertyCode ? `[${removeInvisibleChars(data.propertyCode)}] ${cleanPropertyTitle}` : cleanPropertyTitle;
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
    ? `Estimado/a <strong>${data.fullName}</strong>, su propuesta de compra para <strong>${formattedPropertyTitle}</strong> ha sido recibida y el pago del depósito confirmado correctamente.`
    : `Dear <strong>${data.fullName}</strong>, your purchase proposal for <strong>${formattedPropertyTitle}</strong> has been received and the deposit payment has been confirmed.`
  }
          </p>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAF8;border-left:3px solid #D4AF37;margin-bottom:30px;">
            <tr><td style="padding:25px 30px;">
              <div style="font-size:10px;color:#A0A098;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
                ${isEs ? 'RESUMEN DE LA PROPUESTA' : 'PROPOSAL SUMMARY'}
              </div>
              <div style="font-size:13px;color:#555;line-height:1.8;">
                <strong>${formattedPropertyTitle}</strong><br/>
                ${data.propertyCode ? `${isEs ? 'Código de propiedad' : 'Property code'}: <strong>${data.propertyCode}</strong><br/>` : ''}
                ${isEs ? 'Precio ofertado' : 'Offered price'}: <strong>${data.offerPrice}</strong><br/>
                ${isEs ? 'Depósito a transferir' : 'Deposit transferred'}: <strong>${data.depositAmount}</strong><br/>
                ${isEs ? 'Válida hasta' : 'Valid until'}: <strong>${data.validUntil}</strong>
              </div>
            </td></tr>
          </table>
          <p style="font-size:13px;color:#666;line-height:1.7;margin:0 0 30px;">
            ${isEs
    ? 'Nuestro equipo procesará su propuesta (pendiente de verificar la recepción de la transferencia) y se pondrá en contacto con usted en los próximos días hábiles. El documento PDF de su propuesta se adjunta a este correo.'
    : 'Our team will process your proposal (pending receipt of the transfer) and get back to you within the next business days. Your proposal PDF document is attached to this email.'
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
