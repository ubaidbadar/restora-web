// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Form from './index';

afterEach(() => cleanup());

describe('Form', () => {
  it('does not let a form rendered in a portal submit its parent form', async () => {
    const parentSubmit = vi.fn();
    const customerSubmit = vi.fn();

    function CustomerForm() {
      return createPortal(
        <Form
          onSubmit={({ onSuccess }) => {
            customerSubmit();
            onSuccess('Saved');
          }}
          component={() => <button type="submit">Save customer</button>}
        />,
        document.body,
      );
    }

    render(
      <Form onSubmit={parentSubmit} component={() => <CustomerForm />} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save customer' }));

    await waitFor(() => expect(customerSubmit).toHaveBeenCalledOnce());
    expect(parentSubmit).not.toHaveBeenCalled();
  });
});
