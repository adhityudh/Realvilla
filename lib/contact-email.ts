/**
 * Localized contact/enquiry email builder (EN/ES).
 *
 * Pure function (no Next.js imports) so the templates can be unit-tested
 * without sending real emails. The API route supplies telemetry/device meta.
 */

export interface ContactEmailPayload {
  formType?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  municipality?: string;
  propertyType?: string;
  url?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface ContactEmailMeta {
  device: string;
  os: string;
  browser: string;
  submissionTime: string;
  ip: string;
  city: string;
  country: string;
}

type Dict = Record<string, string>;

const EN: Dict = {
  titleGeneral: 'GENERAL INQUIRY',
  titleSell: 'VALUATION REQUEST',
  titleMortgage: 'MORTGAGE STUDY',
  subjectSell: 'Valuation Request',
  subjectMortgage: 'Mortgage Study Request',
  subjectGeneral: 'Contact Inquiry',
  generalFallback: 'General',
  heading: 'New touchpoint submission',
  langBadge: 'Submitted via the English site — reply in English',
  clientIdentity: 'CLIENT IDENTITY',
  emailChannel: 'EMAIL CHANNEL',
  phoneTelephony: 'PHONE TELEPHONY',
  originUrl: 'ORIGINATING URL ENTRY POINT',
  directAccess: 'Direct site access',
  propertyAddress: 'PROPERTY ADDRESS (TENERIFE)',
  notSpecified: 'Not specified',
  openInMaps: 'Open in Google Maps',
  pinCoords: 'Exact Pin Coordinates',
  propertyClass: 'PROPERTY CLASS',
  enquiryMessage: 'ENQUIRY MESSAGE',
  noMessage: 'No written message provided.',
  metadata: 'TOUCHPOINT METADATA',
  deviceOs: 'DEVICE & OPERATING SOFTWARE',
  timestamps: 'SUBMISSION TIMESTAMPS',
  networkAddress: 'Network Address',
  geoLocator: 'ESTIMATED GEOGRAPHIC LOCATOR',
  replyEmail: 'REPLY VIA EMAIL',
  respondWhatsapp: 'RESPOND VIA WHATSAPP',
  footerNote: 'Confidential notification routed securely from <br />',
  nameRequired: 'Name is required',
};

const ES: Dict = {
  titleGeneral: 'CONSULTA GENERAL',
  titleSell: 'SOLICITUD DE VALORACIÓN',
  titleMortgage: 'ESTUDIO HIPOTECARIO',
  subjectSell: 'Solicitud de valoración',
  subjectMortgage: 'Solicitud de estudio hipotecario',
  subjectGeneral: 'Consulta de contacto',
  generalFallback: 'General',
  heading: 'Nueva solicitud recibida',
  langBadge: 'Enviado desde la versión en español — responder en español',
  clientIdentity: 'IDENTIDAD DEL CLIENTE',
  emailChannel: 'CORREO ELECTRÓNICO',
  phoneTelephony: 'TELÉFONO',
  originUrl: 'URL DE ORIGEN',
  directAccess: 'Acceso directo al sitio',
  propertyAddress: 'DIRECCIÓN DE LA PROPIEDAD (TENERIFE)',
  notSpecified: 'No especificado',
  openInMaps: 'Abrir en Google Maps',
  pinCoords: 'Coordenadas exactas',
  propertyClass: 'TIPO DE PROPIEDAD',
  enquiryMessage: 'MENSAJE DE LA CONSULTA',
  noMessage: 'Sin mensaje escrito.',
  metadata: 'METADATOS DEL REGISTRO',
  deviceOs: 'DISPOSITIVO Y SISTEMA',
  timestamps: 'FECHA DE ENVÍO',
  networkAddress: 'Dirección de red',
  geoLocator: 'UBICACIÓN GEOGRÁFICA ESTIMADA',
  replyEmail: 'RESPONDER POR CORREO',
  respondWhatsapp: 'RESPONDER POR WHATSAPP',
  footerNote: 'Notificación confidencial enviada de forma segura desde <br />',
  nameRequired: 'Se requiere el nombre',
};

export function isSpanishLocale(locale?: string): boolean {
  return (locale || '').toLowerCase().startsWith('es');
}

export function getContactStrings(locale?: string): Dict {
  return isSpanishLocale(locale) ? ES : EN;
}

export function buildContactEmail(
  payload: ContactEmailPayload,
  meta: ContactEmailMeta,
  locale?: string
): { subject: string; html: string } {
  const t = getContactStrings(locale);
  const { formType, name, email, phone, message, municipality, propertyType, url, latitude, longitude } = payload;

  const titleLabel = formType === 'sell' ? t.titleSell : formType === 'mortgage' ? t.titleMortgage : t.titleGeneral;

  const subject =
    formType === 'sell'
      ? `[REALVILLA] ${t.subjectSell}: ${name} (${municipality || t.generalFallback})`
      : formType === 'mortgage'
        ? `[REALVILLA] ${t.subjectMortgage}: ${name}`
        : `[REALVILLA] ${t.subjectGeneral}: ${name}`;

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>REALVILLA Touchpoint</title>
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
                  <td style="padding: 50px 40px 35px 40px; border-bottom: 1px solid #F4F4F0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left side: Logo -->
                        <td align="left" valign="middle">
                          <img src="https://realvilla.es/images/logo-mark-raster.png" alt="Realvilla Logo" width="52" style="display: block; border: 0; outline: none;" />
                        </td>
                        <!-- Right side: Title -->
                        <td align="right" valign="middle">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600; color: #111111; letter-spacing: 3px; text-transform: uppercase;">
                            ${titleLabel}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Body Section -->
                <tr>
                  <td style="padding: 50px 45px 45px 45px;">
                    <!-- Direct Header Introduction -->
                    <h2 style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 25px; font-weight: 400; color: #111111; margin: 0 0 12px 0; letter-spacing: -0.2px; line-height: 1.3; text-transform: uppercase">
                      ${t.heading}
                    </h2>
                    <div style="display: inline-block; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #7A6515; background-color: #FAF3DC; border: 1px solid #E7D48A; padding: 7px 14px; margin-bottom: 30px;">
                      ${t.langBadge}
                    </div>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <!-- Row 1: Client Full Name -->
                      <tr>
                        <td style="padding-bottom: 20px; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">${t.clientIdentity}</div>
                          <div style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 20px; font-weight: 500; color: #111111;">${name}</div>
                        </td>
                      </tr>
                      
                      <!-- Row 2: Active Email Reach -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">${t.emailChannel}</div>
                          <div style="font-size: 15px; font-weight: 400;">
                            <a href="mailto:${email}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">${email}</a>
                          </div>
                        </td>
                      </tr>

                      <!-- Row 3: Direct Phone Number -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">${t.phoneTelephony}</div>
                          <div style="font-size: 15px; font-weight: 400;">
                            <a href="tel:${phone}" style="color: #111111; text-decoration: none; font-weight: 600;">${phone || '—'}</a>
                          </div>
                        </td>
                      </tr>

                      <!-- Row 4: Originating Entry Point URL -->
                      <tr>
                        <td style="padding: 20px 0; ${formType === 'sell' ? 'border-bottom: 1px solid #F4F4F0;' : ''}">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">${t.originUrl}</div>
                          <div style="font-size: 14px; font-weight: 400; word-break: break-all;">
                            <a href="${url || 'https://realvilla.es'}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">
                              ${url || t.directAccess}
                            </a>
                          </div>
                        </td>
                      </tr>

                      ${formType === 'sell' ? `
                      <!-- Row 4: Municipality Context -->
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #F4F4F0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">${t.propertyAddress}</div>
                          <div style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 19px; font-weight: 500; line-height: 1.4;">
                            ${latitude && longitude ? `
                            <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" style="color: #111111; text-decoration: none; border-bottom: 1.5px dotted #D4AF37;" title="${t.openInMaps}">
                              ${municipality || t.notSpecified}
                            </a>
                            ` : `
                            <span style="color: #111111;">${municipality || t.notSpecified}</span>
                            `}
                          </div>
                          ${latitude && longitude ? `
                          <div style="font-family: 'Manrope', sans-serif; font-size: 12px; margin-top: 12px; color: #8A8A82;">
                            📍 ${t.pinCoords}: <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" style="color: #D4AF37; text-decoration: underline; font-weight: 600; margin-left: 2px;">${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}</a> (${t.openInMaps})
                          </div>
                          ` : ''}
                        </td>
                      </tr>
                      <!-- Row 5: Property Category Class -->
                      <tr>
                        <td style="padding: 20px 0;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">${t.propertyClass}</div>
                          <div style="font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600; display: inline-block; background-color: #F8F8F6; color: #111111; border: 1px solid #EDEDE8; padding: 6px 16px; letter-spacing: 1px; text-transform: uppercase;">
                            ${propertyType || t.notSpecified}
                          </div>
                        </td>
                      </tr>
                      ` : formType === 'mortgage' ? '' : `
                      <!-- Quote Message Viewport -->
                      <tr>
                        <td style="padding-top: 30px;">
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px;">${t.enquiryMessage}</div>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF8; border-left: 3px solid #D4AF37; margin-top: 5px;">
                            <tr>
                              <td style="padding: 25px 30px;">
                                <p style="font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 18px; font-style: italic; line-height: 1.8; color: #3A3A38; margin: 0;">
                                  "${message || t.noMessage}"
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
                          <div style="font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 400; color: #111111; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 18px;">${t.metadata}</div>
                          
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%" valign="top" style="padding-bottom: 15px; padding-right: 15px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">${t.deviceOs}</div>
                                <div style="font-size: 12px; color: #333; font-weight: 500;">${meta.device} • ${meta.os}</div>
                                <div style="font-size: 11px; color: #888; margin-top: 3px;">${meta.browser}</div>
                              </td>
                              <td width="50%" valign="top" style="padding-bottom: 15px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">${t.timestamps}</div>
                                <div style="font-size: 12px; color: #333; font-weight: 500;">${meta.submissionTime}</div>
                                <div style="font-size: 11px; color: #888; margin-top: 3px;">${t.networkAddress}: ${meta.ip}</div>
                              </td>
                            </tr>
                            ${(meta.city || meta.country) ? `
                            <tr>
                              <td colspan="2" valign="top" style="padding-top: 8px;">
                                <div style="font-size: 9px; font-weight: 600; color: #A0A098; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">${t.geoLocator}</div>
                                <div style="font-size: 12px; color: #D4AF37; font-weight: 600;">
                                  📍 ${meta.city ? meta.city + ', ' : ''}${meta.country}
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
                          <a href="mailto:${email}" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 16px 32px; margin: 0 5px 10px 5px;">
                            ${t.replyEmail}
                          </a>
                          ${phone ? `
                          <a href="https://wa.me/${String(phone).replace(/[^0-9]/g, '')}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 16px 32px; margin: 0 5px 10px 5px;">
                            ${t.respondWhatsapp}
                          </a>
                          ` : ''}
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
                      ${t.footerNote}
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

  return { subject, html };
}
