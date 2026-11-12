// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SetupCard from './setup_card';

describe('single-install desktop printing setup', () => {
  afterEach(cleanup);

  it('does not ask a Restora Desktop user to install a separate Windows Agent', () => {
    render(<SetupCard embedded onAdded={() => {}} onSaved={() => {}} onRefresh={() => {}} />);
    expect(screen.getByText(/Printing is included with Restora Desktop/)).toBeTruthy();
    expect(screen.getByText(/No separate agent or installer is needed/)).toBeTruthy();
    expect(screen.queryByText('Get Restora Agent for Windows')).toBeNull();
    expect(screen.queryByText('Install Restora Agent')).toBeNull();
  });
});
