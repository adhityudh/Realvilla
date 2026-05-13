import { NextResponse, userAgent } from 'next/server';
import { Resend } from 'resend';
import { client } from '@/sanity/lib/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, name, email, phone, message, municipality, propertyType, fax, ts, url } = body;

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

    // Synchronize to absolute timezone aligned with domain operations (Spain/Madrid)
    const submissionTime = new Date().toLocaleString('en-GB', {
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
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let htmlContent = '';
    let subject = '';

    const titleLabel = formType === 'sell' ? 'VALUATION REQUEST' : 'GENERAL INQUIRY';
    subject = formType === 'sell' 
      ? `[REALVILLA] Valuation Request: ${name} (${municipality || 'General'})` 
      : `[REALVILLA] Contact Inquiry: ${name}`;

    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Realvilla Luxury Touchpoint</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F8F5; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F8F5; padding: 50px 20px;">
          <tr>
            <td align="center">
              <!-- Luxury Outer Container -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #EBEBE5; box-shadow: 0 12px 40px rgba(0,0,0,0.03); overflow: hidden;">
                
                <!-- Top Brand Accent Line -->
                <tr>
                  <td height="5" style="background-color: #D4AF37; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>

                <!-- Header Section (Branding & Logo) -->
                <tr>
                  <td align="center" style="padding: 50px 40px 35px 40px; border-bottom: 1px solid #F4F4F0;">
                    <!-- Official Realvilla Brand Logo Hosted Asset -->
                    <img src="https://realvilla.es/images/logo-mark-raster.png" alt="Realvilla Logo" width="52" style="display: block; border: 0; outline: none;" />
                    <div style="font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 400; color: #111111; letter-spacing: 4px; text-transform: uppercase; margin-top: 16px; text-align: center;">
                      ${titleLabel}
                    </div>
                  </td>
                </tr>

                <!-- Main Body Section -->
                <tr>
                  <td style="padding: 50px 45px 45px 45px;">
                    <!-- Direct Header Introduction -->
                    <h2 style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 25px; font-weight: 400; color: #111111; margin: 0 0 35px 0; letter-spacing: -0.2px; line-height: 1.3;">
                      New touchpoint submission from ${name}
                    </h2>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <!-- Row 1: Client Full Name -->
                      <tr>
                        <td style="padding-bottom: 20px; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">CLIENT IDENTITY</div>
                          <div style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 20px; font-weight: 500; color: #111111;">${name}</div>
                        </td>
                      </tr>
                      
                      <!-- Row 2: Active Email Reach -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">EMAIL CHANNEL</div>
                          <div style="font-size: 15px; font-weight: 400;">
                            <a href="mailto:${email}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">${email}</a>
                          </div>
                        </td>
                      </tr>

                      <!-- Row 3: Direct Phone Number -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">PHONE TELEPHONY</div>
                          <div style="font-size: 15px; font-weight: 400;">
                            <a href="tel:${phone}" style="color: #111111; text-decoration: none; font-weight: 600;">${phone || '—'}</a>
                          </div>
                        </td>
                      </tr>

                      <!-- Row 4: Originating Entry Point URL -->
                      <tr>
                        <td style="padding: 20px 0; ${formType === 'sell' ? 'border-bottom: 1px solid #F4F4F0;' : ''}">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">ORIGINATING URL ENTRY POINT</div>
                          <div style="font-size: 14px; font-weight: 400; word-break: break-all;">
                            <a href="${url || 'https://realvilla.es'}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">
                              ${url || 'Direct site access'}
                            </a>
                          </div>
                        </td>
                      </tr>

                      ${formType === 'sell' ? `
                      <!-- Row 4: Municipality Context -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">TARGET MUNICIPALITY</div>
                          <div style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 19px; font-weight: 500; color: #111111;">${municipality || 'Not specified'}</div>
                        </td>
                      </tr>
                      <!-- Row 5: Property Category Class -->
                      <tr>
                        <td style="padding: 20px 0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">PROPERTY CLASS</div>
                          <div style="font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600; display: inline-block; background-color: #F8F8F6; color: #111111; border: 1px solid #EDEDE8; padding: 6px 16px; letter-spacing: 1px; text-transform: uppercase;">
                            ${propertyType || 'Not specified'}
                          </div>
                        </td>
                      </tr>
                      ` : `
                      <!-- Quote Message Viewport -->
                      <tr>
                        <td style="padding-top: 30px;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px;">ENQUIRY MESSAGE</div>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF8; border-left: 3px solid #D4AF37; margin-top: 5px;">
                            <tr>
                              <td style="padding: 25px 30px;">
                                <p style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 18px; font-style: italic; line-height: 1.8; color: #3A3A38; margin: 0;">
                                  "${message || 'No written message provided.'}"
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      `}
                    </table>

                    <!-- Meta-information Table (Device, Time, Location) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 45px; border-top: 1px solid #F4F4F0; padding-top: 35px;">
                      <tr>
                        <td>
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 18px;">TOUCHPOINT METADATA</div>
                          
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%" valign="top" style="padding-bottom: 15px; padding-right: 15px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">DEVICE & OPERATING SOFTWARE</div>
                                <div style="font-size: 12px; color: #333; font-weight: 500;">${device} • ${os}</div>
                                <div style="font-size: 11px; color: #888; margin-top: 3px;">${browser}</div>
                              </td>
                              <td width="50%" valign="top" style="padding-bottom: 15px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">SUBMISSION TIMESTAMPS</div>
                                <div style="font-size: 12px; color: #333; font-weight: 500;">${submissionTime}</div>
                                <div style="font-size: 11px; color: #888; margin-top: 3px;">Network Address: ${ip}</div>
                              </td>
                            </tr>
                            ${(city || country) ? `
                            <tr>
                              <td colspan="2" valign="top" style="padding-top: 8px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">ESTIMATED GEOGRAPHIC LOCATOR</div>
                                <div style="font-size: 12px; color: #D4AF37; font-weight: 600;">
                                  📍 ${city ? city + ', ' : ''}${country}
                                </div>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Call to Action: Direct SMTP Reply Trigger -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 50px;">
                      <tr>
                        <td align="center">
                          <a href="mailto:${email}" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; text-decoration: none; padding: 18px 38px; transition: background-color 0.3s ease;">
                            RESPOND TO CLIENT
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Minimalist Branded Footer Section -->
                <tr>
                  <td align="center" style="background-color: #FAF9F6; padding: 35px 40px; border-top: 1px solid #EBEBE5;">
                    <p style="font-family: 'Manrope', sans-serif; font-size: 10px; color: #111111; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0; font-weight: 400;">REALVILLA</p>
                    <p style="font-size: 10px; color: #B8B8B0; margin: 0; line-height: 1.6; font-weight: 300;">
                      Confidential notification routed securely from <br />
                      <a href="https://realvilla.es" style="color: #9B9B95; text-decoration: underline; font-weight: 400;">realvilla.es</a> integrated core interface.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Dynamically fetch recipients from Sanity configurations with layered fallback strategies
    let toEmails: string[] = [];
    try {
      const settings = await client.fetch(`*[_type == "settings"][0]{ contactRecipientEmails }`);
      if (settings?.contactRecipientEmails && Array.isArray(settings.contactRecipientEmails) && settings.contactRecipientEmails.length > 0) {
        toEmails = settings.contactRecipientEmails.map((e: string) => e.trim()).filter(Boolean);
      }
    } catch (fetchErr) {
      console.warn('[Contact API] Dynamic settings fetch from Sanity failed, reverting to environment default:', fetchErr);
    }

    // Fallback to environment configurations (which allows comma-separated strings)
    if (toEmails.length === 0) {
      const fallbackEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'delivered@resend.dev';
      toEmails = fallbackEmail.split(',').map(item => item.trim()).filter(Boolean);
    }

    const { data, error } = await resend.emails.send({
      from: 'REALVILLA <hello@realvilla.es>',
      to: toEmails,
      subject: subject,
      html: htmlContent,
      replyTo: email || undefined,
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
