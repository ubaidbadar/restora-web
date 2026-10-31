// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import useAuthStore from '../../store/auth_store';
import sampleMe from '../../test/sample_me';
import TableCallsLink from './table_calls_link';

const withCalls = (calls: NonNullable<NonNullable<ReturnType<typeof sampleMe>['workplace']>['calls']>) => {
  const me = sampleMe();
  useAuthStore.setState({ me: { ...me, workplace: { ...me.workplace!, calls } } });
  render(<MemoryRouter><TableCallsLink /></MemoryRouter>);
};

describe('TableCallsLink', () => {
  afterEach(cleanup);

  it('shows nothing without calls', () => {
    withCalls([]);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('names the one table waiting, from the calls in /me', () => {
    withCalls([
      { _id: 'c1', tableId: 't1', tableName: 'T1', type: 'waiter', createdAt: '2026-10-31T10:00:00.000Z' },
      { _id: 'c2', tableId: 't1', tableName: 'T1', type: 'bill', createdAt: '2026-10-31T10:01:00.000Z' },
    ]);
    expect(screen.getByRole('status').textContent).toContain('Table T1 asks for the bill');
  });

  it('counts tables, not calls', () => {
    withCalls([
      { _id: 'c1', tableId: 't1', tableName: 'T1', type: 'waiter', createdAt: '2026-10-31T10:00:00.000Z' },
      { _id: 'c2', tableId: 't2', tableName: 'T2', type: 'waiter', createdAt: '2026-10-31T10:01:00.000Z' },
    ]);
    expect(screen.getByRole('status').textContent).toContain('2 tables need you');
  });
});
