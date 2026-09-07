import { proxy } from 'valtio';

export const state = proxy({
  feeds: [],
  form: {
    value: '',
    error: null,
  },
});