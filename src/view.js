import { subscribe } from 'valtio/vanilla';
import { state } from './state.js';

const renderError = (input, errorElement, error) => {
  input.classList.toggle('border-red-500', Boolean(error));
  input.classList.toggle('focus:border-red-500', Boolean(error));
  input.classList.toggle('focus:ring-red-500', Boolean(error));
  input.setAttribute('aria-invalid', String(Boolean(error)));

  errorElement.textContent = error ?? '';
  errorElement.classList.toggle('hidden', !error);
};

export const initView = () => {
  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#rss-url');
  const errorElement = document.querySelector('#rss-error');

  const render = () => {
    input.value = state.form.value;
    renderError(input, errorElement, state.form.error);
  };

  subscribe(state.form, render);
  render();

  input.addEventListener('input', (event) => {
    state.form.value = event.target.value;
    state.form.error = null;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.dispatchEvent(new CustomEvent('rss:submit', {
      bubbles: true,
      detail: input.value,
    }));
  });

  return { input };
};