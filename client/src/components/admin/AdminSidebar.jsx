import {NavLink,useNavigate} from 'react-router-dom'
import {LayoutDashboard,Users,Sprout,ClipboardCheck,Store,Package,Tags,ShoppingBag,Star,ShieldCheck,Bell,BarChart3,User,Settings,LogOut,X} from 'lucide-react'
import {useAuth} from '../../context/AuthContext.jsx'
const SECTIONS=[
  {title:'Overview',items:[{label:'Dashboard',to:'/admin',end:true,icon:LayoutDashboard}]},
  {title:'Marketplace',items:[
    {label:'Users',to:'/admin/users',icon:Users},{label:'Farmers',to:'/admin/farmers',icon:Sprout},
    {label:'Farmer Approvals',to:'/admin/farmers/approvals',icon:ClipboardCheck},{label:'Markets',to:'/admin/markets',icon:Store},
    {label:'Products',to:'/admin/products',icon:Package},{label:'Categories',to:'/admin/categories',icon:Tags},
    {label:'Orders',to:'/admin/orders',icon:ShoppingBag}]},
  {title:'Community',items:[{label:'Reviews',to:'/admin/reviews',icon:Star},{label:'Moderation',to:'/admin/moderation',icon:ShieldCheck},{label:'Notifications',to:'/admin/notifications',icon:Bell}]},
  {title:'Analytics',items:[{label:'Analytics',to:'/admin/analytics',icon:BarChart3},{label:'Impact',to:'/admin/impact',icon:Sprout},{label:'Reports',to:'/admin/reports',icon:ClipboardCheck},{label:'Audit Logs',to:'/admin/audit-logs',icon:ShieldCheck}]},
  {title:'Account',items:[{label:'Profile',to:'/admin/profile',icon:User},{label:'Settings',to:'/admin/settings',icon:Settings}]}
]
export default function AdminSidebar({open,onClose}){
  const {logout,user}=useAuth();const navigate=useNavigate()
  const handleLogout=async()=>{await logout();navigate('/login')}
  const linkClass=({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/60 ${isActive?'bg-olive/20 text-cream':'text-cream/70 hover:bg-white/5 hover:text-cream'}`
  const content=(<div className="flex h-full flex-col"><div className="flex items-center justify-between px-5 py-5 border-b border-white/10"><div><p className="font-display text-lg text-cream">MarketLink</p><p className="text-[11px] uppercase tracking-widest2 text-olive/80">Admin</p></div><button type="button" onClick={onClose} className="lg:hidden rounded-lg p-1.5 text-cream/60 hover:bg-white/10" aria-label="Close menu"><X size={20}/></button></div><nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar" aria-label="Admin navigation">{SECTIONS.map(s=><div key={s.title}><p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-cream/35">{s.title}</p><ul className="space-y-0.5">{s.items.map(item=><li key={item.to}><NavLink to={item.to} end={item.end} className={linkClass} onClick={onClose}><item.icon size={18} strokeWidth={1.75}/>{item.label}</NavLink></li>)}</ul></div>)}</nav><div className="border-t border-white/10 p-3"><div className="mb-2 px-3 py-2"><p className="text-sm font-medium text-cream truncate">{user?.name||'Admin'}</p><p className="text-xs text-cream/45 truncate">{user?.email}</p></div><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/70 hover:bg-white/5"><LogOut size={18}/>Logout</button></div></div>)
  return(<><aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-forest-deep z-30">{content}</aside>{open&&(<div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-forest-deep/60" onClick={onClose}/><aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-forest-deep shadow-2xl">{content}</aside></div>)}</>)
}
