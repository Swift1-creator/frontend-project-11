import * as yup from 'yup';
import { setLocale } from 'yup';

setLocale({
  mixed: {
    required: 'validation.required',
  },
  string: {
    url: 'validation.url',
  },
});

const urlSchema = yup
  .string()
  .trim()
  .required()
  .url()
  .test(
    'unique-url',
    'validation.duplicate',
    (value, context) => {
      const { feeds } = context.options.context;

      return !feeds.includes(value);
    },
  );

export const validateUrl = (url, feeds) => (
  urlSchema.validate(url, {
    context: { feeds },
    abortEarly: true,
  })
);