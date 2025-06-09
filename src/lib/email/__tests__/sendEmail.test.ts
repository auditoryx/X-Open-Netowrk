import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('path');

const sendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
(fs.readFileSync as jest.Mock).mockReturnValue('Hi {{name}}');
(path.join as jest.Mock).mockReturnValue('/template.html');

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

test('sends email and returns success', async () => {
  sendMail.mockResolvedValue({ messageId: '1' });
  process.env.SMTP_EMAIL = 'from@test.com';
  const { sendEmail } = require('../sendEmail');
  const res = await sendEmail('to@test.com', 'Sub', 'welcome.html', { name: 'A' });
  expect(path.join).toHaveBeenCalled();
  expect(fs.readFileSync).toHaveBeenCalledWith('/template.html', 'utf-8');
  expect(sendMail).toHaveBeenCalledWith({
    from: '"AuditoryX" <from@test.com>',
    to: 'to@test.com',
    subject: 'Sub',
    html: 'Hi A',
    text: 'Hi A'
  });
  expect(res).toEqual({ success: true });
});

test('returns error on failure', async () => {
  sendMail.mockRejectedValue(new Error('fail'));
  const { sendEmail } = require('../sendEmail');
  const res = await sendEmail('to@test.com', 'Sub', 't.html', {});
  expect(res).toEqual({ error: 'Email send failed' });
});
