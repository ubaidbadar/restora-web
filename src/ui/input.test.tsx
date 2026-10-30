// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Input from './input';

describe('Input', () => {
  const showPickerMock = vi.fn();

  beforeEach(() => {
    showPickerMock.mockReset();
    HTMLInputElement.prototype.showPicker = showPickerMock;
  });

  afterEach(() => {
    cleanup();
  });

  it('opens picker on click when type is date', () => {
    render(<Input type="date" aria-label="Date field" />);
    const input = screen.getByLabelText('Date field');

    fireEvent.click(input);
    expect(showPickerMock).toHaveBeenCalledTimes(1);
  });

  it('opens picker on click when type is time', () => {
    render(<Input type="time" aria-label="Time field" />);
    const input = screen.getByLabelText('Time field');

    fireEvent.click(input);
    expect(showPickerMock).toHaveBeenCalledTimes(1);
  });

  it('does not open picker when type is text', () => {
    render(<Input type="text" aria-label="Text field" />);
    const input = screen.getByLabelText('Text field');

    fireEvent.click(input);
    expect(showPickerMock).not.toHaveBeenCalled();
  });

  it('does not open picker when disabled', () => {
    render(<Input type="date" disabled aria-label="Disabled date" />);
    const input = screen.getByLabelText('Disabled date');

    fireEvent.click(input);
    expect(showPickerMock).not.toHaveBeenCalled();
  });

  it('does not open picker when readOnly', () => {
    render(<Input type="date" readOnly aria-label="Readonly date" />);
    const input = screen.getByLabelText('Readonly date');

    fireEvent.click(input);
    expect(showPickerMock).not.toHaveBeenCalled();
  });

  it('preserves user onClick prop', () => {
    const onClick = vi.fn();

    render(<Input type="date" onClick={onClick} aria-label="Date field" />);
    const input = screen.getByLabelText('Date field');

    fireEvent.click(input);
    expect(showPickerMock).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
