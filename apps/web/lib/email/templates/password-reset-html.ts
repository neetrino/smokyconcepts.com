import {
  PASSWORD_RESET_BRAND_NAME,
  PASSWORD_RESET_LOGO_PATH,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from '@/lib/auth/password-reset.constants';

const ACCENT_COLOR = '#DCC090';
const TEXT_COLOR = '#1a1a1a';
const MUTED_COLOR = '#5c5c5c';
const BG_COLOR = '#f7f3eb';
const CARD_BG = '#ffffff';
const MS_PER_HOUR = 60 * 60 * 1000;

export interface PasswordResetEmailHtmlParams {
  resetUrl: string;
  baseUrl: string;
}

/**
 * Branded HTML for password-reset emails (table layout for client compatibility).
 */
export function buildPasswordResetEmailHtml({
  resetUrl,
  baseUrl,
}: PasswordResetEmailHtmlParams): string {
  const logoUrl = `${baseUrl}${PASSWORD_RESET_LOGO_PATH}`;
  const expiresHours = Math.max(1, Math.round(PASSWORD_RESET_TOKEN_TTL_MS / MS_PER_HOUR));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${PASSWORD_RESET_BRAND_NAME} — Reset password</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:${CARD_BG};border-radius:12px;overflow:hidden;border:1px solid #e8dfd0;">
          <tr>
            <td align="center" style="padding:36px 32px 20px;background:linear-gradient(180deg,#2a2a2a 0%,#1a1a1a 100%);">
              <img src="${logoUrl}" alt="${PASSWORD_RESET_BRAND_NAME}" width="72" height="72" style="display:block;border:0;border-radius:8px;" />
              <p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:${ACCENT_COLOR};">
                ${PASSWORD_RESET_BRAND_NAME}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${TEXT_COLOR};font-weight:normal;">
                Վերականգնել գաղտնաբառը
              </h1>
              <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${MUTED_COLOR};">
                Ստացել եք այս նամակը, քանի որ խնդրել եք վերականգնել ձեր գաղտնաբառը։ Սեղմեք կոճակը՝ նոր գաղտնաբառ սահմանելու համար։
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:${ACCENT_COLOR};">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${TEXT_COLOR};text-decoration:none;">
                      Վերականգնել գաղտնաբառը
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${MUTED_COLOR};">
                Հղումը գործում է ${expiresHours} ժամ։ Եթե դուք չեք խնդրել վերականգնում, պարզապես անտեսեք այս նամակը։
              </p>
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#999999;word-break:break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid #f0e9dc;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999999;text-align:center;">
                © ${new Date().getFullYear()} ${PASSWORD_RESET_BRAND_NAME}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetEmailText(resetUrl: string): string {
  return [
    `${PASSWORD_RESET_BRAND_NAME}`,
    '',
    'Վերականգնել գաղտնաբառը / Reset your password',
    '',
    resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n');
}
