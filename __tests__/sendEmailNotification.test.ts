jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue(undefined),
  },
}))
let sgMail: any

describe('sendEmailNotification env validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    sgMail = require('@sendgrid/mail').default
    process.env = { ...originalEnv }
    sgMail.setApiKey.mockClear()
    sgMail.send.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('throws when SENDGRID_API_KEY is missing', async () => {
    delete process.env.SENDGRID_API_KEY
    process.env.SENDGRID_FROM_EMAIL = 'from@example.com'

    const module = await import('@/lib/notifications/sendEmailNotification')
    await expect(
      module.sendEmailNotification({
        to: 'to@example.com',
        subject: 'Sub',
        text: 'hi'
      })
    ).rejects.toThrow('SENDGRID_API_KEY is not defined')
  })

  test('throws when SENDGRID_FROM_EMAIL is missing', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    delete process.env.SENDGRID_FROM_EMAIL

    const module = await import('@/lib/notifications/sendEmailNotification')
    await expect(
      module.sendEmailNotification({
        to: 'to@example.com',
        subject: 'Sub',
        text: 'hi'
      })
    ).rejects.toThrow('SENDGRID_FROM_EMAIL is not defined')
  })

  test('sends when variables are defined', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    process.env.SENDGRID_FROM_EMAIL = 'from@example.com'

    const module = await import('@/lib/notifications/sendEmailNotification')
    await module.sendEmailNotification({
      to: 'to@example.com',
      subject: 'Sub',
      text: 'hi',
    })

    expect(sgMail.setApiKey).toHaveBeenCalledWith('key')
    expect(sgMail.send).toHaveBeenCalledWith({
      to: 'to@example.com',
      from: 'from@example.com',
      subject: 'Sub',
      text: 'hi',
      html: '<p>hi</p>',
    })
  })
})
