import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import DashboardContent from './DashboardContent'
import DestinationPage from './Destination'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  const handleLogout = () => {
    setActiveMenu('dashboard')
    onLogout()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navbar */}
        <div className="bg-white shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="hidden lg:flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500 font-medium">Logged in</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  AU
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeMenu === 'dashboard' && <DashboardContent />}
            {activeMenu === 'destination' && <DestinationPage />}
          </div>
        </div>
      </div>
    </div>
  )
}
