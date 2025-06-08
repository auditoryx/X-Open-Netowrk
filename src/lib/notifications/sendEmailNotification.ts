import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL

if (!SENDGRID_API_KEY) {
  const msg = 'SENDGRID_API_KEY is not defined'
  console.error(msg)
  throw new Error(msg)
}

if (!SENDGRID_FROM_EMAIL) {
  const msg = 'SENDGRID_FROM_EMAIL is not defined'
  console.error(msg)
  throw new Error(msg)
}

sgMail.setApiKey(SENDGRID_API_KEY)

export async function sendEmailNotification({
  to,
  subject,
  text,
  html
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  try {
    await sgMail.send({
      to,
      from: SENDGRID_FROM_EMAIL as string,
      subject,
      text,
      html: html || `<p>${text}</p>`
    })
  } catch (err) {
    console.error('Error sending email notification:', err)
  }
}
