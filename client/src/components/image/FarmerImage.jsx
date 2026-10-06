import AppImage from './AppImage.jsx'
export default function FarmerImage({ src, farmer, ...props }) {
  const value = src || farmer?.image || farmer?.profileImage || farmer?.farmImage
  return <AppImage src={value} kind="farmer" alt={props.alt ?? farmer?.name ?? ''} {...props} />
}
