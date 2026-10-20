import { beforeEach, describe, expect, it } from 'vitest';
import sampleMe from '../test/sample_me';
import useAuthStore from './auth_store';

const workplace = () => useAuthStore.getState().me!.workplace!;

describe('auth store', () => {
  beforeEach(() => useAuthStore.getState().setMe(sampleMe()));

  it('setWorkplace changes only what it is given', () => {
    useAuthStore.getState().setWorkplace({ hasPin: true });
    expect(workplace().hasPin).toBe(true);
    expect(workplace().branch?._id).toBe('b1');
  });

  it('setSettings renames the restaurant in the workplace and in the switcher', () => {
    useAuthStore.getState().setSettings({ ...workplace().settings, restaurantName: 'New Grill', logo: '/uploads/logo.png' });
    expect(workplace().settings.restaurantName).toBe('New Grill');
    expect(workplace().restaurant).toEqual({ _id: 'r1', name: 'New Grill', logo: '/uploads/logo.png' });
    expect(useAuthStore.getState().me!.restaurants.map((r) => r.name)).toEqual(['New Grill', 'Other Place']);
  });

  it('setBranch renames a branch, the current one too', () => {
    useAuthStore.getState().setBranch({ _id: 'b1', name: 'Main Boulevard' });
    expect(workplace().branches[0]).toEqual({ _id: 'b1', name: 'Main Boulevard' });
    expect(workplace().branch).toEqual({ _id: 'b1', name: 'Main Boulevard' });
  });

  it('setBranch adds a new branch for someone who works at every branch', () => {
    useAuthStore.getState().setBranch({ _id: 'b3', name: 'DHA' });
    expect(workplace().branches.map((b) => b._id)).toEqual(['b1', 'b2', 'b3']);
  });

  it('setBranch does not add a new branch for someone with chosen branches only', () => {
    useAuthStore.getState().setWorkplace({ allBranches: false });
    useAuthStore.getState().setBranch({ _id: 'b3', name: 'DHA' });
    expect(workplace().branches.map((b) => b._id)).toEqual(['b1', 'b2']);
  });

  it('setBranch with their own branch archived moves them to the first open one', () => {
    useAuthStore.getState().setBranch({ _id: 'b1', name: 'Main', isActive: false });
    expect(workplace().branches.map((b) => b._id)).toEqual(['b2']);
    expect(workplace().branch?._id).toBe('b2');
  });

  it('setBranch with the last branch archived leaves no branch', () => {
    useAuthStore.getState().setWorkplace({ branches: [{ _id: 'b1', name: 'Main' }] });
    useAuthStore.getState().setBranch({ _id: 'b1', name: 'Main', isActive: false });
    expect(workplace().branch).toBeNull();
  });
});
