import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image) => {
  return imageBuilder?.image(source).auto('format').fit('max').quality(80)
}

export const getImageUrl = (source: Image, width?: number, height?: number) => {
  let builder = imageBuilder.image(source).auto('format').quality(80);
  if (width) builder = builder.width(width);
  if (height) builder = builder.height(height);
  return builder.url();
}
