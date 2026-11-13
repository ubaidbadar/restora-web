import { describe, expect, it } from 'vitest';
import completeAddress from './complete_address';

describe('completeAddress', () => {
  it('combines the saved area and address into one complete address', () => {
    expect(completeAddress('House 17, Street 4', 'Gulberg')).toBe('Gulberg, House 17, Street 4');
  });

  it('does not repeat an area already included in the address', () => {
    expect(completeAddress('Gulberg, House 17, Street 4', 'Gulberg')).toBe('Gulberg, House 17, Street 4');
  });

  it('keeps whichever part exists and trims it', () => {
    expect(completeAddress('  House 17  ', '')).toBe('House 17');
    expect(completeAddress('', '  Gulberg  ')).toBe('Gulberg');
    expect(completeAddress()).toBeUndefined();
  });
});
