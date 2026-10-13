import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildAdminEmail, buildBuyerEmail } from '@/lib/offer-email';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const formData = await request.formData();

    const propertyId = formData.get('propertyId') as string;
    const propertyCode = formData.get('propertyCode') as string;
    const propertyTitle = formData.get('propertyTitle') as string;
    const propertySlug = formData.get('propertySlug') as string;
    const propertyPrice = formData.get('propertyPrice') as string;
    const pageUrl = formData.get('pageUrl') as string;
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

    const submittedAt = new Date().toISOString();
    const formattedDate = new Date(submittedAt)
      .toLocaleString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' }) + ' (Madrid)';
    const validUntilISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const validUntilDate = new Date(validUntilISO).toLocaleDateString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'long' });
    const sessionId = `BT-${Date.now()}`; // Reference ID for Bank Transfer

    // ── Offer settings (recipients + PDF template config) ───────────────────
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let adminEmails: string[] = [];
    let pdfTemplateUrl: string | undefined;
    let pdfFieldMap: any = undefined;
    try {
      const { client } = await import('@/sanity/lib/client');
      const { sanitizeSanityData } = await import('@/lib/sanitize');
      const rawSettings = await client.fetch(
        `*[_type == "settings"][0]{ contactRecipientEmails, propertyOfferPdfTemplate { asset->{ url } }, propertyOfferPdfFieldMap }`
      );
      const settings = sanitizeSanityData(rawSettings);
      if (settings?.contactRecipientEmails && Array.isArray(settings.contactRecipientEmails) && settings.contactRecipientEmails.length > 0) {
        adminEmails = settings.contactRecipientEmails
          .map((e: string) => e.trim())
          .filter(Boolean);
      }
      pdfTemplateUrl = settings?.propertyOfferPdfTemplate?.asset?.url;
      pdfFieldMap = settings?.propertyOfferPdfFieldMap;
    } catch (fetchErr) {
      console.warn('[Offer/Submit] Dynamic settings fetch from Sanity failed:', fetchErr);
    }

    if (adminEmails.length === 0) {
      const fallbackEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'hello@realvilla.es';
      adminEmails = fallbackEmail.split(',').map(e => e.trim()).filter(Boolean);
    }

    // ── Generate PDF via internal API ────────────────────────────────────
    let pdfBase64 = null;

    try {
      const pdfResponse = await fetch(`${origin}/api/offer/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          sessionId,
          propertyId,
          propertyCode,
          propertyTitle,
          propertyPrice,
          depositAmount,
          personal,
          offer,
          submittedAt,
          validUntil: validUntilISO,
          pdfTemplateUrl,
          pdfFieldMap,
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

    // Canonical property URL for the emails (prefer the page it was sent from)
    const routeSegment = locale === 'es' ? 'propiedades' : 'properties';
    const propertyUrl = pageUrl
      || `${origin}/${locale}/${routeSegment}/${propertySlug || propertyCode || ''}`;
    const preferredLanguageLabel = (personal.preferredLanguage || locale) === 'es' ? 'Español' : 'English';

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
        propertyUrl,
        fullName: personal.fullName,
        idNumber: personal.idNumber,
        email: personal.email,
        phone: personal.phone,
        address: personal.address,
        preferredLanguage: preferredLanguageLabel,
        offerPrice: formattedOfferPrice,
        additionalConditions: offer.additionalConditions || '',
        depositAmount: formattedDeposit,
        submittedAt: formattedDate,
        validUntil: validUntilDate,
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
        propertyUrl,
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

