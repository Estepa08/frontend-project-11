import * as yup from 'yup'

export const urlSchema = yup
  .string()
  .required('errors.urlRequired')
  .url('errors.urlInvalid')
  .test('not-duplicate', 'errors.duplicate', function (url) {
    const feeds = this.options.context?.feeds || []
    return !feeds.some(feed => feed.url === url)
  })

export const validateUrl = (url, feeds) => {
  return urlSchema.validate(url, { context: { feeds } })
}
