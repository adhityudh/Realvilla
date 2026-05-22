import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalData {
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  address: string;
}

interface OfferData {
  offerPrice: string;
  additionalConditions?: string;
}

// Sanity-configurable PDF field name map (camelCase keys → PDF field name values)
interface PdfFieldMap {
  propertyTitle?: string;
  propertyReference?: string;
  buyerFullName?: string;
  buyerIdNumber?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  offerPrice?: string;
  offerPriceWords?: string;
  additionalConditions?: string;
  depositAmount?: string;
  stripePaymentId?: string;
  submissionDate?: string;
  validityDate?: string;
}

interface GeneratePDFPayload {
  sessionId: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: string;
  depositAmount: string;
  locale: string;
  personal: PersonalData;
  offer: OfferData;
  submittedAt?: string;
  validUntil?: string;
  pdfTemplateUrl?: string;
  pdfFieldMap?: PdfFieldMap; // Configurable field names from Sanity settings
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: GeneratePDFPayload = await request.json();
    const {
      sessionId,
      propertyId,
      propertyTitle,
      propertyPrice,
      depositAmount,
      locale,
      personal,
      offer,
      submittedAt,
      validUntil,
      pdfTemplateUrl,
      pdfFieldMap,
    } = body;

    const isEs = locale === 'es';

    // ── Format field values ────────────────────────────────────────────────────

    const formatEuro = (val: string | number) => {
      const n = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(n) ? '' : `€${n.toLocaleString('en-IE')}`;
    };

    const formattedOfferPrice = formatEuro(offer.offerPrice);
    const plainOfferPrice = parseFloat(offer.offerPrice)?.toString() || offer.offerPrice;
    const formattedDeposit = formatEuro(depositAmount);

    const formattedSubmittedAt = submittedAt
      ? new Date(submittedAt).toLocaleDateString(isEs ? 'es-ES' : 'en-GB', {
          timeZone: 'Europe/Madrid',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

    const formattedValidUntil = validUntil
      ? new Date(validUntil).toLocaleDateString(isEs ? 'es-ES' : 'en-GB', {
          timeZone: 'Europe/Madrid',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '';

    // ── Field map: data values keyed by configurable PDF field names ───────────
    // Uses names from Sanity settings if configured; falls back to defaults.
    const fm = pdfFieldMap || {};
    const fieldValues: Record<string, string> = {
      [fm.propertyTitle        ?? 'property_title']:        propertyTitle || '',
      [fm.propertyReference    ?? 'property_reference']:    propertyId || '',
      [fm.buyerFullName        ?? 'buyer_full_name']:       personal.fullName || '',
      [fm.buyerIdNumber        ?? 'buyer_id_number']:       personal.idNumber || '',
      [fm.buyerEmail           ?? 'buyer_email']:           personal.email || '',
      [fm.buyerPhone           ?? 'buyer_phone']:           personal.phone || '',
      [fm.buyerAddress         ?? 'buyer_address']:         personal.address || '',
      [fm.offerPrice           ?? 'offer_price']:           formattedOfferPrice,
      [fm.offerPriceWords      ?? 'offer_price_words']:     plainOfferPrice,
      [fm.additionalConditions ?? 'additional_conditions']: offer.additionalConditions || '',
      [fm.depositAmount        ?? 'deposit_amount']:        formattedDeposit,
      [fm.stripePaymentId      ?? 'stripe_payment_id']:     sessionId || '',
      [fm.submissionDate       ?? 'submission_date']:       formattedSubmittedAt,
      [fm.validityDate         ?? 'validity_date']:         formattedValidUntil,
    };

    // ── Load PDF template ──────────────────────────────────────────────────────

    if (!pdfTemplateUrl) {
      console.warn('[Offer/GeneratePDF] No PDF template URL provided — skipping PDF generation.');
      return NextResponse.json({ error: 'No PDF template configured in Sanity settings.' }, { status: 422 });
    }

    // Fetch the PDF template from Sanity CDN
    const templateResponse = await fetch(pdfTemplateUrl, { next: { revalidate: 3600 } });
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch PDF template: ${templateResponse.status} ${templateResponse.statusText}`);
    }

    const templateBytes = await templateResponse.arrayBuffer();

    // ── Fill the PDF form fields ───────────────────────────────────────────────

    const pdfDoc = await PDFDocument.load(templateBytes, {
      // Ignore encryption if template is not protected
      ignoreEncryption: true,
    });

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Log available field names for debugging
    console.log('[Offer/GeneratePDF] PDF template fields found:', fields.map(f => f.getName()));

    // Fill each matching field
    let filledCount = 0;
    for (const field of fields) {
      const name = field.getName();
      if (name in fieldValues) {
        try {
          // Try to fill as TextField (most common)
          const textField = form.getTextField(name);
          textField.setText(fieldValues[name]);
          filledCount++;
        } catch {
          // May be a different field type (dropdown, checkbox) — skip gracefully
          console.warn(`[Offer/GeneratePDF] Could not fill field "${name}" as TextField — skipping.`);
        }
      }
    }

    console.log(`[Offer/GeneratePDF] Filled ${filledCount}/${Object.keys(fieldValues).length} fields.`);

    // Flatten the form so fields become read-only text in the final PDF
    form.flatten();

    // ── Serialize and return ──────────────────────────────────────────────────

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    return NextResponse.json({ pdfBase64 });
  } catch (err: any) {
    console.error('[Offer/GeneratePDF] Error:', err);
    return NextResponse.json({ error: err.message || 'PDF generation failed' }, { status: 500 });
  }
}
