// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import useGet from '../hooks/useGet';
import CustomersPage from './customers_page';
import ReservationsPage from './reservations_page';
import TablesPage from './tables_page';
import DashboardNumbers from './dashboard_page/dashboard_numbers';

vi.mock('../hooks/useGet', () => ({ default: vi.fn() }));
const retry = vi.fn();

describe('failed initial reads', () => {
  afterEach(cleanup);
  beforeEach(() => {
    retry.mockReset();
    vi.mocked(useGet).mockReturnValue({
      data: undefined,
      loading: false,
      error: 'The API answered with a page instead of data.',
      options: { params: { date: '2026-11-09' } },
      get: retry,
      update: vi.fn(),
    });
  });

  for (const [what, content] of [
    ['the customers', <CustomersPage />],
    ['the reservations', <ReservationsPage />],
    ['the tables', <TablesPage />],
    ['the numbers', <DashboardNumbers from="2026-11-09" to="2026-11-09" scope="branch" />],
  ] as const) {
    it(`offers a retry for ${what} instead of showing empty data or loading forever`, () => {
      render(<MemoryRouter>{content}</MemoryRouter>);
      expect(screen.getByText(`Couldn't load ${what}`)).toBeTruthy();
      expect(screen.queryByRole('status')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(retry).toHaveBeenCalledTimes(1);
    });
  }
});
