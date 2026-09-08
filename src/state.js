import { proxy } from 'valtio';

export const state = proxy({
  feeds: [],
  posts: [],

  form: {
    loading: false,
    error: '',
    status: '',
  },
});