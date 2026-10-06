import AppImage from './AppImage.jsx'
/** Accepts either `src` or a product-like object with `images[]`/`image`. */
export default function ProductImage({ src, images, product, ...props }) {
  const value = src || product?.images?.[0] || product?.image || images?.[0]
  return <AppImage src={value} kind="product" alt={props.alt ?? product?.name ?? ''} {...props} />
}
