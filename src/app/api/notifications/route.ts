import { NextRequest, NextResponse } from 'next/server'
import { sendInAppNotification } from '@/lib/notifications/sendInAppNotification'
import { sendEmailNotification } from '@/lib/notifications/sendEmailNotification'

export async function POST(req: NextRequest) {
  const { userId, email, type, title, message, link } = await req.json()
  if (!userId && !email) {
    return NextResponse.json({ error: 'No recipient specified' }, { status: 400 })
  }
  try {
    await Promise.all([
      userId
        ? sendInAppNotification({
            to: userId,
            type,
            title,
            message,
            link
          })
        : Promise.resolve(),
      email
        ? sendEmailNotification({
            to: email,
            subject: title,
            text: `${message}\n${link}`,
            html: `<p>${message}</p><p><a href="${link}">View</a></p>`
          })
        : Promise.resolve()
    ])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Notification error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
