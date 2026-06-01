import { Router } from 'express';
import { requireAuth, requireManager } from '../middleware/auth';
import {
  EmailDeliveryError,
  sendCrmNotificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendTestEmail,
  sendWelcomeEmail,
} from '../services/emailService';

const router = Router();

router.use(requireAuth);

router.post('/test', requireManager, async (req, res) => {
  try {
    const to = String(req.body?.to || req.authUser?.email || '').trim().toLowerCase();
    const result = await sendTestEmail(to, req.authUser?.name || 'Digital Wave admin');
    res.json({ ok: true, id: result?.id, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    const status = error instanceof EmailDeliveryError ? error.status : 400;
    res.status(status).json({ error: message });
  }
});

router.post('/welcome', async (req, res) => {
  try {
    const to = req.authUser?.email || '';
    const result = await sendWelcomeEmail(to, req.authUser?.name || 'there');
    res.json({ ok: true, id: result?.id, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send welcome email';
    const status = error instanceof EmailDeliveryError ? error.status : 400;
    res.status(status).json({ error: message });
  }
});

router.post('/send', requireManager, async (req, res) => {
  try {
    const to = String(req.body?.to || '').trim().toLowerCase();
    const type = req.body?.type as string | undefined;
    let result: { id?: string } | null | undefined;

    if (type === 'password-reset') {
      if (!req.body?.resetLink) throw new EmailDeliveryError('Password reset email requires resetLink.', 400);
      result = await sendPasswordResetEmail(to, String(req.body.resetLink));
    } else if (type === 'crm-notification') {
      if (!req.body?.message) throw new EmailDeliveryError('CRM notification email requires message.', 400);
      result = await sendCrmNotificationEmail(to, String(req.body.message), req.body.actionUrl ? String(req.body.actionUrl) : undefined);
    } else if (type === 'payment-confirmation') {
      result = await sendPaymentConfirmationEmail(to, String(req.body?.planName || 'Digital Wave CRM'), String(req.body?.amount || 'Confirmed'));
    } else {
      throw new EmailDeliveryError('Unsupported email type.', 400);
    }

    res.json({ ok: true, id: result?.id, to, type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status = error instanceof EmailDeliveryError ? error.status : 400;
    res.status(status).json({ error: message });
  }
});

export { router as emailRoutes };
