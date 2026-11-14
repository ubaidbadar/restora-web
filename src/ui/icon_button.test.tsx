// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Plus } from 'lucide-react';
import IconButton from './icon_button';

describe('IconButton', () => {
  it('defaults native icon buttons to type=button inside forms', () => {
    render(
      <form>
        <IconButton icon={Plus} aria-label="Add dish" onClick={() => {}} />
      </form>,
    );

    expect(screen.getByRole('button', { name: 'Add dish' }).getAttribute('type')).toBe('button');
  });

  it('preserves an explicit submit type', () => {
    render(
      <form>
        <IconButton type="submit" icon={Plus} aria-label="Submit form" />
      </form>,
    );

    expect(screen.getByRole('button', { name: 'Submit form' }).getAttribute('type')).toBe('submit');
  });

  it('does not add a button type to anchor icon actions', () => {
    render(<IconButton as="a" href="/orders" icon={Plus} aria-label="Open orders" />);

    expect(screen.getByRole('link', { name: 'Open orders' }).getAttribute('type')).toBeNull();
  });
});
