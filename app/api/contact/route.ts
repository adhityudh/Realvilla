import { NextResponse, userAgent } from 'next/server';
import { Resend } from 'resend';
import { client } from '@/sanity/lib/client';
import { sanitizeSanityData } from '@/lib/sanitize';
import { buildContactEmail, getContactStrings, isSpanishLocale } from '@/lib/contact-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, name, email, phone, message, municipality, propertyType, fax, ts, url, latitude, longitude, locale } = body;
    const strings = getContactStrings(locale);

    // Robust Telemetry Captures
    const ua = userAgent(request);
    const browser = `${ua.browser.name || ''} ${ua.browser.version || ''}`.trim() || 'Unknown Browser';
    const os = `${ua.os.name || ''} ${ua.os.version || ''}`.trim() || 'Unknown OS';

    // Derive a neat Device Model name
    let deviceType = 'Desktop/PC';
    if (ua.device.type) {
      deviceType = ua.device.type.charAt(0).toUpperCase() + ua.device.type.slice(1);
    }
    const device = `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim() || deviceType;

    // Dynamic Location / Network resolution (Vercel edge-integrated standard headers)
    const country = request.headers.get('x-vercel-ip-country') || '';
    const city = request.headers.get('x-vercel-ip-city') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Synchronize to absolute timezone aligned with domain operations (Spain/Madrid),
    // localized to the site language the enquiry was submitted from.
    const submissionTime = new Date().toLocaleString(isSpanishLocale(locale) ? 'es-ES' : 'en-GB', {
      timeZone: 'Europe/Madrid',
      dateStyle: 'full',
      timeStyle: 'short'
    }) + ' (Madrid CET)';

    // Anti-spam Check 1: Honeypot Protection Trap
    // Bots automatically fill all visible/hidden fields. Real humans cannot see this field.
    if (fax && fax.trim() !== '') {
      console.warn('[Anti-Spam] Honeypot triggered! Shadow-discarding bot submission.');
      // Return 200 OK so the automated bot thinks it succeeded, preventing it from bypassing the shield!
      return NextResponse.json({ success: true, message: 'Operation processed stealthily' });
    }

    // Anti-spam Check 2: Execution Speed Threshold
    // A human physically takes at least 1.5 - 2.0 seconds to read and submit forms. Bots are instant.
    const now = Date.now();
    if (ts && now - Number(ts) < 1500) {
      console.warn('[Anti-Spam] Bot speed threshold triggered! Shadow-discarding execution.');
      return NextResponse.json({ success: true, message: 'Operation processed stealthily' });
    }

    if (!name) {
      return NextResponse.json({ error: strings.nameRequired }, { status: 400 });
    }

    const { subject, html: htmlContent } = buildContactEmail(
      { formType, name, email, phone, message, municipality, propertyType, url, latitude, longitude },
      { device, os, browser, submissionTime, ip, city, country },
      locale
    );


    // Dynamically fetch recipients from Sanity configurations with layered fallback strategies
    let toEmails: string[] = [];
    try {
      const rawSettings = await client.fetch(`*[_type == "settings"][0]{ contactRecipientEmails }`);
      const settings = sanitizeSanityData(rawSettings);
      if (settings?.contactRecipientEmails && Array.isArray(settings.contactRecipientEmails) && settings.contactRecipientEmails.length > 0) {
        toEmails = settings.contactRecipientEmails
          .map((e: string) => e.trim())
          .filter(Boolean);
      }
    } catch (fetchErr) {
      console.warn('[Contact API] Dynamic settings fetch from Sanity failed, reverting to environment default:', fetchErr);
    }

    // Fallback to environment configurations (which allows comma-separated strings)
    if (toEmails.length === 0) {
      const fallbackEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'delivered@resend.dev';
      toEmails = fallbackEmail.split(',')
        .map(item => item.replace(/[^\x20-\x7E]/g, '').trim())
        .filter(Boolean);
    }

    // Also sanitize the replyTo field from client side payload for total system safety
    const sanitizedReplyTo = email ? String(email).replace(/[^\x20-\x7E]/g, '').trim() : undefined;

    const { data, error } = await resend.emails.send({
      from: 'REALVILLA <hello@realvilla.es>',
      to: toEmails,
      subject: subject,
      html: htmlContent,
      replyTo: sanitizedReplyTo || undefined,
    });

    if (error) {
      console.error('Resend API sending failed:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Contact API error handler:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
