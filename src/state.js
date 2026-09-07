import { proxy } from 'valtio';

export const state = proxy({
  feeds: [],
  posts: [],

  form: {
    value: '',
    error: null,
  },

  loading: false,
  requestError: null,
});