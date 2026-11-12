// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MessageCircle, MonitorSmartphone, Printer } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import type SETTINGS_SECTIONS from './settings_sections';
import SettingsNav from './settings_nav';

const sections = [
  { value: 'devices', label: 'Devices', icon: MonitorSmartphone, group: 'Devices', content: null },
  { value: 'whatsapp', label: 'WhatsApp connection', icon: MessageCircle, group: 'Devices', content: null },
  { value: 'printers', label: 'Printers', icon: Printer, group: 'Devices', content: null },
] as typeof SETTINGS_SECTIONS;

describe('Settings navigation', () => {
  afterEach(cleanup);

  for (const list of [false, true]) {
    it(`hides WhatsApp connection in ${list ? 'phone' : 'desktop'} navigation but keeps other sections`, () => {
      render(<MemoryRouter><SettingsNav sections={sections} list={list} /></MemoryRouter>);
      expect(screen.queryByRole('link', { name: 'WhatsApp connection' })).toBeNull();
      expect(screen.getByRole('link', { name: 'Devices' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Printers' })).toBeTruthy();
    });
  }
});
