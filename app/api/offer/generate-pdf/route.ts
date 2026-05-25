import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { sanitizeFieldMap, removeInvisibleChars } from '@/lib/sanitize';

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
  propertyCode?: string;
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
  [key: string]: string | undefined; // Allow index signature for sanitization
}

interface GeneratePDFPayload {
  sessionId: string;
  propertyId: string;
  propertyCode?: string;
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
      propertyCode,
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

    // ── Sanitize all string values to remove invisible Unicode chars ───────────
    const sanitizedTitle = removeInvisibleChars(propertyTitle || '');
    const sanitizedCode = removeInvisibleChars(propertyCode || '');
    const sanitizedPersonal = {
      fullName: removeInvisibleChars(personal?.fullName || ''),
      idNumber: removeInvisibleChars(personal?.idNumber || ''),
      email: removeInvisibleChars(personal?.email || ''),
      phone: removeInvisibleChars(personal?.phone || ''),
      address: removeInvisibleChars(personal?.address || ''),
    };
    const sanitizedAdditionalConditions = removeInvisibleChars(offer?.additionalConditions || '');
    const sanitizedSessionId = removeInvisibleChars(sessionId || '');
    const sanitizedPropertyId = removeInvisibleChars(propertyId || '');
    const sanitizedSubmittedAt = removeInvisibleChars(submittedAt || '');
    const sanitizedValidUntil = removeInvisibleChars(validUntil || '');
    const sanitizedPdfTemplateUrl = removeInvisibleChars(pdfTemplateUrl || '');
    const sanitizedDepositAmount = removeInvisibleChars(depositAmount || '');
    const sanitizedOfferPrice = removeInvisibleChars(offer?.offerPrice || '');
    const sanitizedPropertyPrice = removeInvisibleChars(propertyPrice || '');

    const isEs = locale === 'es';

    // ── Format field values ────────────────────────────────────────────────────

    const formatEuro = (val: string | number) => {
      const n = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(n) ? '' : `${n.toLocaleString('en-IE')}`;
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
    // Sanitize field map to remove any invisible Unicode characters from Sanity
    const fm = pdfFieldMap ? sanitizeFieldMap(pdfFieldMap) : {};
    const fieldValues: Record<string, string> = {
      [fm.propertyTitle        ?? 'property_title']:        sanitizedTitle,
      [fm.propertyReference    ?? 'property_reference']:    sanitizedPropertyId,
      [fm.propertyCode         ?? 'property_code']:         sanitizedCode,
      [fm.buyerFullName        ?? 'buyer_full_name']:       sanitizedPersonal.fullName,
      [fm.buyerIdNumber        ?? 'buyer_id_number']:       sanitizedPersonal.idNumber,
      [fm.buyerEmail           ?? 'buyer_email']:           sanitizedPersonal.email,
      [fm.buyerPhone           ?? 'buyer_phone']:           sanitizedPersonal.phone,
      [fm.buyerAddress         ?? 'buyer_address']:         sanitizedPersonal.address,
      [fm.offerPrice           ?? 'offer_price']:           formattedOfferPrice,
      [fm.offerPriceWords      ?? 'offer_price_words']:     plainOfferPrice,
      [fm.additionalConditions ?? 'additional_conditions']: sanitizedAdditionalConditions,
      [fm.depositAmount        ?? 'deposit_amount']:        formattedDeposit,
      [fm.stripePaymentId      ?? 'stripe_payment_id']:     sanitizedSessionId,
      [fm.submissionDate       ?? 'submission_date']:       formattedSubmittedAt,
      [fm.validityDate         ?? 'validity_date']:         formattedValidUntil,
    };

    // ── Load PDF template ──────────────────────────────────────────────────────

    if (!sanitizedPdfTemplateUrl) {
      console.warn('[Offer/GeneratePDF] No PDF template URL provided — skipping PDF generation.');
      return NextResponse.json({ error: 'No PDF template configured in Sanity settings.' }, { status: 422 });
    }

    // Fetch the PDF template from Sanity CDN
    const templateResponse = await fetch(sanitizedPdfTemplateUrl, { next: { revalidate: 3600 } });
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

    // ── DEBUGGING: Check if PDF has fillable fields ────────────────────────────
    console.log('[Offer/GeneratePDF] ═══════════════════════════════════════════════════');
    console.log('[Offer/GeneratePDF] PDF DEBUGGING INFO:');
    console.log('[Offer/GeneratePDF] - Total pages:', pdfDoc.getPageCount());
    console.log('[Offer/GeneratePDF] - Total form fields found:', fields.length);
    
    if (fields.length === 0) {
      console.error('[Offer/GeneratePDF] ❌ ERROR: PDF has NO fillable form fields!');
      console.error('[Offer/GeneratePDF] 💡 Solution: Open your PDF in Adobe Acrobat or LibreOffice and add form fields.');
      console.error('[Offer/GeneratePDF] 💡 Or use an online tool like PDFescape.com to add fillable fields.');
    }

    // Get all PDF field names and types
    const pdfFieldNames = fields.map(f => f.getName());
    const pdfFieldDetails = fields.map(f => ({
      name: f.getName(),
      type: f.constructor.name,
    }));
    
    console.log('[Offer/GeneratePDF] PDF template fields found:', pdfFieldNames);
    console.log('[Offer/GeneratePDF] PDF field details:', pdfFieldDetails);
    console.log('[Offer/GeneratePDF] Expected field names from config:', Object.keys(fieldValues));
    console.log('[Offer/GeneratePDF] ═══════════════════════════════════════════════════');

    // Create a normalized lookup map for flexible matching
    // This handles variations like "Property Title" vs "property_title"
    // Also strips invisible/zero-width Unicode characters
    const normalizeFieldName = (name: string) => {
      // First, remove all invisible/zero-width characters (U+200B to U+200D, U+FEFF, etc.)
      const cleaned = name.replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '');
      // Then normalize: lowercase, replace spaces/hyphens with underscores, remove non-word chars
      return cleaned.toLowerCase().replace(/[\s\-]/g, '_').replace(/[^\w]/g, '');
    };

    // Create reverse lookup: normalized name -> actual PDF field name
    const normalizedPdfFields = new Map<string, string>();
    for (const pdfFieldName of pdfFieldNames) {
      const normalized = normalizeFieldName(pdfFieldName);
      normalizedPdfFields.set(normalized, pdfFieldName);
    }

    // Create lookup: normalized expected name -> value
    const normalizedFieldValues = new Map<string, { originalKey: string; value: string }>();
    for (const [key, value] of Object.entries(fieldValues)) {
      const normalized = normalizeFieldName(key);
      normalizedFieldValues.set(normalized, { originalKey: key, value });
    }

    // Fill each matching field
    let filledCount = 0;
    const unmatchedExpected: string[] = [];
    const unmatchedPdf: string[] = [];

    // Try to fill fields using normalized matching
    for (const [normalizedName, pdfFieldName] of normalizedPdfFields.entries()) {
      const fieldData = normalizedFieldValues.get(normalizedName);
      
      if (fieldData) {
        try {
          // Try to fill as TextField (most common)
          const textField = form.getTextField(pdfFieldName);
          textField.setText(fieldData.value);
          filledCount++;
          console.log(`[Offer/GeneratePDF] ✓ Filled "${pdfFieldName}" with value from "${fieldData.originalKey}"`);
        } catch (err) {
          // May be a different field type (dropdown, checkbox) — skip gracefully
          console.warn(`[Offer/GeneratePDF] ✗ Could not fill field "${pdfFieldName}" as TextField — skipping.`);
        }
      } else {
        unmatchedPdf.push(pdfFieldName);
      }
    }

    // Check for expected fields that weren't found in PDF
    for (const [normalizedName, fieldData] of normalizedFieldValues.entries()) {
      if (!normalizedPdfFields.has(normalizedName)) {
        unmatchedExpected.push(fieldData.originalKey);
      }
    }

    console.log(`[Offer/GeneratePDF] ✓ Successfully filled ${filledCount}/${Object.keys(fieldValues).length} fields.`);
    
    if (unmatchedExpected.length > 0) {
      console.warn(`[Offer/GeneratePDF] ⚠️  Expected fields not found in PDF template:`, unmatchedExpected);
      console.warn(`[Offer/GeneratePDF] 💡 Tip: Update the "PDF Field Name Mapping" in Sanity to match your PDF's actual field names.`);
    }
    
    if (unmatchedPdf.length > 0) {
      console.log(`[Offer/GeneratePDF] ℹ️  PDF fields that were not filled (no matching data):`, unmatchedPdf);
    }

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
