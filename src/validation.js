import * as yup from 'yup';

const urlSchema = yup
  .string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL')
  .test(
    'unique-url',
    'Ссылка должна быть валидным URL',
    (value, context) => !context.options.context.feeds.includes(value),
  );

export const validateUrl = (url, feeds) => urlSchema.validate(url, {
  context: { feeds },
  abortEarly: true,
});