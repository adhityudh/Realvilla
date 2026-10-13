/**
 * Offer email builders (admin notification + buyer confirmation).
 *
 * Pure functions (no Next.js imports) so templates are unit-testable
 * without sending real emails.
 */
import { removeInvisibleChars } from './sanitize';

const clean = (v?: string): string => removeInvisibleChars(v || '');

export interface AdminOfferEmailData {
  sessionId: string;
  propertyTitle?: string;
  propertyCode?: string;
  propertyId?: string;
  propertyUrl?: string;
  fullName?: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferredLanguage?: string;
  offerPrice?: string;
  additionalConditions?: string;
  depositAmount?: string;
  submittedAt?: string;
  validUntil?: string;
}

export interface BuyerOfferEmailData {
  isEs: boolean;
  propertyTitle?: string;
  propertyCode?: string;
  propertyUrl?: string;
  fullName?: string;
  offerPrice?: string;
  depositAmount?: string;
  sessionId?: string;
  validUntil?: string;
  submittedAt?: string;
}

export function buildAdminEmail(data: AdminOfferEmailData) {
  const cleanPropertyTitle = clean(data.propertyTitle);
  const formattedPropertyTitle = data.propertyCode ? `[${clean(data.propertyCode)}] ${cleanPropertyTitle}` : cleanPropertyTitle;
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
          ${data.propertyUrl ? `
          <div style="margin:0 0 25px;">
            <a href="${data.propertyUrl}" target="_blank" style="display:inline-block;background:#111;color:#FFF;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">
              VIEW PROPERTY →
            </a>
            <div style="font-size:11px;color:#888;margin-top:8px;word-break:break-all;">${data.propertyUrl}</div>
          </div>
          ` : ''}
          <table width="100%" cellspacing="0" cellpadding="0">
            ${buildRow('BUYER', `<strong>${data.fullName}</strong>`)}
            ${buildRow('ID / PASSPORT', data.idNumber)}
            ${buildRow('EMAIL', `<a href="mailto:${data.email}" style="color:#D4AF37;">${data.email}</a>`)}
            ${buildRow('PHONE', `<a href="tel:${data.phone}" style="color:#111;">${data.phone}</a>`)}
            ${buildRow('ADDRESS', data.address)}
            ${data.preferredLanguage ? buildRow('PREFERRED LANGUAGE', `<strong>${data.preferredLanguage}</strong>`) : ''}
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
              <a href="https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}" target="_blank" style="display:inline-block;background:#25D366;color:#FFF;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;margin:0 5px 8px;">
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

export function buildRow(label: string, value: string | undefined) {
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #F4F4F0;">
      <div style="font-size:9px;font-weight:600;color:#A0A098;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">${label}</div>
      <div style="font-size:14px;color:#111;">${value ?? ''}</div>
    </td>
  </tr>`;
}

export function buildBuyerEmail(data: BuyerOfferEmailData) {
  const { isEs } = data;
  const cleanPropertyTitle = clean(data.propertyTitle);
  const formattedPropertyTitle = data.propertyCode ? `[${clean(data.propertyCode)}] ${cleanPropertyTitle}` : cleanPropertyTitle;
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
    ? `Estimado/a <strong>${data.fullName}</strong>, su propuesta de compra para <strong>${formattedPropertyTitle}</strong> ha sido recibida y está pendiente de verificación de la transferencia del depósito.`
    : `Dear <strong>${data.fullName}</strong>, your purchase proposal for <strong>${formattedPropertyTitle}</strong> has been received and is pending verification of the deposit transfer.`
  }
          </p>
          ${data.propertyUrl ? `
          <p style="margin:0 0 30px;">
            <a href="${data.propertyUrl}" target="_blank" style="display:inline-block;background:#111;color:#FFF;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">
              ${isEs ? 'VER PROPIEDAD →' : 'VIEW PROPERTY →'}
            </a>
          </p>
          ` : ''}
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAF8;border-left:3px solid #D4AF37;margin-bottom:30px;">
            <tr><td style="padding:25px 30px;">
              <div style="font-size:10px;color:#A0A098;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
                ${isEs ? 'RESUMEN DE LA PROPUESTA' : 'PROPOSAL SUMMARY'}
              </div>
              <div style="font-size:13px;color:#555;line-height:1.8;">
                <strong>${formattedPropertyTitle}</strong><br/>
                ${data.propertyCode ? `${isEs ? 'Código de propiedad' : 'Property code'}: <strong>${data.propertyCode}</strong><br/>` : ''}
                ${isEs ? 'Precio ofertado' : 'Offered price'}: <strong>${data.offerPrice}</strong><br/>
                ${isEs ? 'Depósito a transferir' : 'Deposit to transfer'}: <strong>${data.depositAmount}</strong><br/>
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
