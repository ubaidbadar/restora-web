import { describe, expect, it } from 'vitest';
import parseWhatsAppSignupMessage from './parse_whatsapp_signup_message';

describe('Meta WhatsApp Embedded Signup messages', () => {
  it('accepts the WABA and phone number selected in Meta', () => {
    expect(parseWhatsAppSignupMessage('https://www.facebook.com', JSON.stringify({
      type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH',
      data: { waba_id: '1506044834668577', phone_number_id: '1441060799087277' },
    }))).toEqual({
      event: 'finish', wabaId: '1506044834668577', phoneNumberId: '1441060799087277',
    });
  });

  it('rejects messages from non-Meta or insecure origins', () => {
    const payload = { type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH',
      data: { waba_id: '1234567890123', phone_number_id: '1234567890123' } };
    expect(parseWhatsAppSignupMessage('https://evilfacebook.com', payload)).toBeNull();
    expect(parseWhatsAppSignupMessage('http://www.facebook.com', payload)).toBeNull();
  });

  it('handles cancellation and Meta-reported errors without exposing their raw payload', () => {
    expect(parseWhatsAppSignupMessage('https://web.facebook.com', {
      type: 'WA_EMBEDDED_SIGNUP', event: 'CANCEL', data: { current_step: 'PHONE' },
    })).toEqual({ event: 'cancel' });
    expect(parseWhatsAppSignupMessage('https://www.facebook.com', {
      type: 'WA_EMBEDDED_SIGNUP', event: 'ERROR', data: { error_message: 'private provider detail' },
    })).toEqual({ event: 'error' });
  });

  it('fails closed when the selected account or phone IDs are malformed', () => {
    expect(parseWhatsAppSignupMessage('https://www.facebook.com', {
      type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH',
      data: { waba_id: 'not-an-id', phone_number_id: '1234567890123' },
    })).toEqual({ event: 'invalid' });
    expect(parseWhatsAppSignupMessage('https://www.facebook.com', 'not json')).toBeNull();
  });
});
