process.env.SMTP_EMAIL = "mock@email.com";
process.env.SMTP_PASS = "mockpass";

import fs from 'fs';
import path from 'path';

const sendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail })),
}));
jest.mock('fs');
jest.mock('path');

(fs.readFileSync as jest.Mock).mockReturnValue('Hi {{name}}');
(path.join as jest.Mock).mockReturnValue('/template.html');

import { sendEmail } from '../sendEmail';

afterEach(() => {
  jest.clearAllMocks();
});

test('sends email and returns success', async () => {
  sendMail.mockResolvedValue({ messageId: '1' });
  const res = await sendEmail({
    to: 'to@test.com',
    subject: 'Sub',
    templateName: 'welcome.html',
    replacements: { name: 'A' },
  });
  expect(path.join).toHaveBeenCalled();
  expect(fs.readFileSync).toHaveBeenCalledWith('/template.html', 'utf-8');
  expect(sendMail).toHaveBeenCalledWith({
    from: '"AuditoryX" <mock@email.com>',
    to: 'to@test.com',
    subject: 'Sub',
    html: 'Hi A',
    text: 'Hi A',
  });
  expect(res).toEqual({ success: true });
});

test('returns error on failure', async () => {
  sendMail.mockRejectedValue(new Error('fail'));
  const res = await sendEmail({
    to: 'to@test.com',
    subject: 'Sub',
    templateName: 't.html',
    replacements: {},
  });
  expect(res).toEqual({ error: 'Email send failed' });
});
