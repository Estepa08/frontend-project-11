import * as yup from 'yup';
import i18next from 'i18next';

export const urlSchema = yup
  .string()
  .required(() => i18next.t('errors.urlRequired'))
  .url(() => i18next.t('errors.urlInvalid'))
  .test(
    'not-duplicate',
    () => i18next.t('errors.duplicate'),
    function (url) {
      const feeds = this.options.context?.feeds || [];
      return !feeds.some((feed) => feed.url === url);
    },
  );

export function validateUrl(url, feeds) {
  return urlSchema.validate(url, { context: { feeds } });
}