import ImageGallery from '../image/ImageGallery.jsx'

/** Product detail gallery. Uses the shared keyboard-accessible ImageGallery; shows a placeholder if there are no images. */
export default function ProductGallery({ images = [], alt = '' }) {
  return <ImageGallery images={images} alt={alt} kind="product" aspect="1 / 1" className="[&_img]:rounded-sm" />
}
