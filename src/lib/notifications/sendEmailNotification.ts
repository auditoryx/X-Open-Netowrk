import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

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
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject,
      text,
      html: html || `<p>${text}</p>`
    })
  } catch (err) {
    console.error('Error sending email notification:', err)
  }
}
