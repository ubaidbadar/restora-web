import type AuthState from '../types/auth_state';
import createStore from './create_store';

/**
 * Who is signed in. `me` is undefined while it loads, null when nobody is signed in.
 * `terminal` is true on a registered POS terminal that is locked (nobody unlocked on it).
 * After a save, the actions below put the answer in place, so nothing asks the server for `/me` again.
 */
const useAuthStore = createStore<AuthState>((set, get) => ({
  me: undefined,
  terminal: false,
  setMe: (me, terminal = false) => set({ me, terminal }),

  setWorkplace: (changes) => {
    const { me } = get();
    if (me?.workplace) set({ me: { ...me, workplace: { ...me.workplace, ...changes } } });
  },

  setSettings: (settings) => {
    const { me } = get();
    if (!me?.workplace) return;
    const restaurant = { _id: me.workplace.restaurant._id, name: settings.restaurantName, logo: settings.logo };
    set({
      me: {
        ...me,
        workplace: { ...me.workplace, settings, restaurant },
        restaurants: me.restaurants.map((r) => (r._id === restaurant._id ? { ...r, name: restaurant.name } : r)),
      },
    });
  },

  setBranch: ({ _id, name, isActive }) => {
    const workplace = get().me?.workplace;
    if (!workplace) return;
    let branches = workplace.branches;
    if (isActive === false) branches = branches.filter((b) => b._id !== _id);
    else if (branches.some((b) => b._id === _id)) branches = branches.map((b) => (b._id === _id ? { _id, name } : b));
    // A new or reopened branch is theirs only if they work at every branch.
    else if (workplace.allBranches) branches = [...branches, { _id, name }];
    // If their own branch was archived, the server moves them to their first open one; so does the app.
    const branch = branches.find((b) => b._id === workplace.branch?._id) ?? branches[0] ?? null;
    get().setWorkplace({ branches, branch });
  },
}));

export default useAuthStore;
