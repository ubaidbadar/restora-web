import axios from 'axios';
import { describe, expect, it } from 'vitest';
import api from './api';

describe('API response validation', () => {
  it('keeps an HTML response distinguishable from a network failure', async () => {
    const error = await api.get('/orders', {
      adapter: async (config) => ({
        config,
        data: '<!DOCTYPE html><html></html>',
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
      }),
    }).catch((error: unknown) => error);

    expect(axios.isAxiosError(error)).toBe(true);
    expect(error).toMatchObject({
      code: 'ERR_BAD_RESPONSE',
      response: { status: 200 },
    });
  });

  it('passes a JSON response through unchanged', async () => {
    const response = await api.get('/orders', {
      adapter: async (config) => ({
        config,
        data: [],
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      }),
    });
    expect(response.data).toEqual([]);
  });
});
