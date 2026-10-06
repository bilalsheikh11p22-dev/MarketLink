import {useState} from 'react'
import {Outlet} from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import AdminTopbar from '../components/admin/AdminTopbar.jsx'
import {AdminProvider, useAdmin} from '../context/AdminContext.jsx'
function AdminGate({children}){const {status,error,refresh}=useAdmin();if(status==='error')return(<div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"><p>{error}</p><button type="button" onClick={refresh} className="mt-3 rounded-xl bg-forest px-4 py-2 text-cream">Retry</button></div>);if(status==='loading'||status==='idle')return <p className="py-16 text-center text-sm text-forest/55">Loading…</p>;return children}
export default function AdminLayout(){const [sidebarOpen,setSidebarOpen]=useState(false);return(<AdminProvider><div className="min-h-screen bg-cream text-forest-deep font-body"><AdminSidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/><div className="lg:pl-64 flex flex-col min-h-screen"><AdminTopbar onMenuOpen={()=>setSidebarOpen(true)}/><main className="flex-1 p-4 sm:p-6 lg:p-8"><AdminGate><Outlet/></AdminGate></main></div></div></AdminProvider>)}
