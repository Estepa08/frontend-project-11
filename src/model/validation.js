import * as yup from 'yup';

export const urlSchema = yup
  .string()
  .required('errors.urlRequired')
  .url('errors.urlInvalid')
  .test('not-duplicate', 'errors.duplicate', function (url) {
    const feeds = this.options.context?.feeds || [];
    console.log('🔍 Проверка дубликата для:', url);
    console.log(
      '📋 Текущие фиды:',
      feeds.map((f) => f.url),
    );
    const isDuplicate = feeds.some((feed) => feed.url === url);
    console.log('✅ Результат:', isDuplicate ? 'ДУБЛИКАТ!' : 'OK');
    return !isDuplicate;
  });

export function validateUrl(url, feeds) {
  return urlSchema.validate(url, { context: { feeds } });
}
