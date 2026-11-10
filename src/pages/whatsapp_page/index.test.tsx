// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WhatsAppPage from './index';

const conversations = [
  {
    phoneNumberId: 'meta-1', phone: '03001234567', customerName: 'New Customer',
    unread: true, count: 2, lastInboundAt: '2026-11-10T11:00:00.000Z',
    last: { _id: 'one', direction: 'inbound', text: 'Hello, are you open?', receivedAt: '2026-11-10T11:00:00.000Z' },
  },
  {
    phoneNumberId: 'meta-1', phone: '03007654321', customerName: 'Existing Customer',
    unread: false, count: 3, lastInboundAt: '2026-11-09T11:00:00.000Z',
    last: { _id: 'two', direction: 'outbound', text: 'Thanks!', receivedAt: '2026-11-10T10:00:00.000Z' },
  },
];
let rows = conversations;
vi.mock('../../hooks/useGet', () => ({ default: () => ({
  data: rows, loading: false, error: undefined, get: vi.fn(), update: vi.fn(),
}) }));
vi.mock('../../components/whatsapp_push_controls', () => ({ default: () => null }));

describe('WhatsApp inbox experience', () => {
  afterEach(() => { cleanup(); rows = conversations; });

  it('shows conversation counts and unread status', () => {
    render(<MemoryRouter initialEntries={['/whatsapp']}><WhatsAppPage /></MemoryRouter>);
    expect(screen.getByText('New Customer')).toBeTruthy();
    expect(screen.getByText('Existing Customer')).toBeTruthy();
    expect(screen.getByLabelText('1 unread conversations')).toBeTruthy();
  });

  it('filters unread conversations without losing the other chats', () => {
    render(<MemoryRouter initialEntries={['/whatsapp']}><WhatsAppPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Unread' }));
    expect(screen.getByText('New Customer')).toBeTruthy();
    expect(screen.queryByText('Existing Customer')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'All chats' }));
    expect(screen.getByText('Existing Customer')).toBeTruthy();
  });

  it('searches by customer name', () => {
    render(<MemoryRouter initialEntries={['/whatsapp']}><WhatsAppPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Search name or number'), {
      target: { value: 'Existing' },
    });
    expect(screen.getByText('Existing Customer')).toBeTruthy();
    expect(screen.queryByText('New Customer')).toBeNull();
  });

  it('explains the empty inbox and links to connection settings', () => {
    rows = [];
    render(<MemoryRouter initialEntries={['/whatsapp']}><WhatsAppPage /></MemoryRouter>);
    expect(screen.getByText('No WhatsApp messages yet.')).toBeTruthy();
    expect(screen.getByText('Check your connected numbers')).toBeTruthy();
  });
});
