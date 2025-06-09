import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

let apiKeySet = false

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
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL

  if (!apiKey) {
    const msg = 'SENDGRID_API_KEY is not defined'
    console.error(msg)
    throw new Error(msg)
  }

  if (!fromEmail) {
    const msg = 'SENDGRID_FROM_EMAIL is not defined'
    console.error(msg)
    throw new Error(msg)
  }

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey)
    apiKeySet = true
  }

  try {
    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      text,
      html: html || `<p>${text}</p>`
    })
  } catch (err) {
    console.error('Error sending email notification:', err)
  }
}
