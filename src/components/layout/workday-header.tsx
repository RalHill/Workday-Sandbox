'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Bell, 
  Inbox, 
  Menu,
  Home,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut,
  UserCog,
  Grid3X3,
  Star,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

/**
 * Authentic Workday Header Navigation
 * 
 * Based on Workday 2026R1 design:
 * - Workday blue background (#0875E1)
 * - Menu button (hamburger) on far left
 * - Workday logo
 * - Prominent centered search bar (the "gateway to work")
 * - Notifications, Inbox, Profile icons on right
 * 
 * Reference: Workday Canvas Design System
 */
export function WorkdayHeader() {
  // Track if component is mounted to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [showAppsMenu, setShowAppsMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const { 
    currentUserName, 
    currentUserRole,
    isImpersonating,
    setCommandOpen, 
    toggleTasks,
    pendingTaskCount 
  } = useAppStore()

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard shortcut for command palette (Workday search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      }
      // Also support '/' for search like Workday
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setCommandOpen])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAppsMenu(false)
      setShowUserMenu(false)
      setShowNotifications(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Use default values during SSR to avoid hydration mismatch
  const displayName = mounted ? (currentUserName || 'Workday Sandbox') : 'Workday Sandbox'
  const displayRole = mounted ? (currentUserRole || 'Administrator') : 'Administrator'
  const displayTaskCount = mounted ? pendingTaskCount : 0
  const displayImpersonating = mounted ? isImpersonating : false

  // Don't render interactive parts until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <header className="workday-header sticky top-0 z-50 w-full flex items-center px-4 gap-3 h-14" style={{ background: '#0875E1' }}>
        <div className="flex items-center gap-2">
          <div className="p-2"><Menu className="h-5 w-5 text-white" /></div>
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-white">
              <span className="text-[#0875E1] font-bold text-lg">W</span>
            </div>
            <span className="text-white font-medium text-lg hidden sm:block">Workday</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="workday-search w-full max-w-lg flex items-center gap-3 h-10 px-4 text-sm">
            <Search className="h-4 w-4 text-white/70" />
            <span className="text-white/70 flex-1 text-left">Search</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="p-2"><Home className="h-5 w-5 text-white" /></div>
          <div className="p-2"><Bell className="h-5 w-5 text-white" /></div>
          <div className="p-2"><Inbox className="h-5 w-5 text-white" /></div>
        </div>
      </header>
    )
  }

  return (
    <header className="workday-header sticky top-0 z-50 w-full flex items-center px-4 gap-3 h-14" style={{ background: '#0875E1' }}>
      {/* Left Section: Menu + Logo */}
      <div className="flex items-center gap-2">
        {/* Hamburger Menu - Opens Apps/Shortcuts */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowAppsMenu(!showAppsMenu)
          }}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>

        {/* Workday Logo */}
        <Link href="/" className="flex items-center gap-2 px-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white">
            <span className="text-[#0875E1] font-bold text-lg">W</span>
          </div>
          <span className="text-white font-medium text-lg hidden sm:block">
            Workday
          </span>
        </Link>
      </div>

      {/* Center Section: Search Bar (The Gateway to Work) */}
      <div className="flex-1 flex justify-center max-w-2xl mx-auto">
        <button
          onClick={() => setCommandOpen(true)}
          className="workday-search w-full max-w-lg flex items-center gap-3 h-10 px-4 text-sm"
        >
          <Search className="h-4 w-4 text-white/70" />
          <span className="text-white/70 flex-1 text-left">
            Search
          </span>
          <kbd className="hidden sm:flex items-center gap-1 text-white/50 text-xs">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Section: Icons + Profile */}
      <div className="flex items-center gap-1">
        {/* Home */}
        <Link
          href="/"
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          title="Home"
        >
          <Home className="h-5 w-5 text-white" />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotifications(!showNotifications)
            }}
            className="p-2 rounded-md hover:bg-white/10 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-white" />
            <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: 'Time Off Request Approved', desc: 'Your PTO request for Dec 20-22 has been approved', time: '2h ago' },
                  { title: 'New Task Assigned', desc: 'Review compensation proposal for Sarah Chen', time: '4h ago' },
                  { title: 'Business Process Complete', desc: 'Hire Employee - John Smith completed successfully', time: '1d ago' },
                ].map((notif, i) => (
                  <div key={i} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t">
                <button className="text-sm text-[#0875E1] hover:underline w-full text-center">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inbox / Tasks */}
        <button
          onClick={toggleTasks}
          className="p-2 rounded-md hover:bg-white/10 transition-colors relative"
          title="Inbox"
        >
          <Inbox className="h-5 w-5 text-white" />
          {displayTaskCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white text-[10px] font-medium text-[#0875E1] flex items-center justify-center">
              {displayTaskCount > 9 ? '9+' : displayTaskCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowUserMenu(!showUserMenu)
            }}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <Avatar className="h-8 w-8 border-2 border-white/30">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white text-[#0875E1] text-xs font-medium">
                {displayName.split(' ').map(n => n[0]).join('') || 'WS'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-white/70 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div 
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Info */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#0875E1] text-white">
                      {displayName.split(' ').map(n => n[0]).join('') || 'WS'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-500">{displayRole}</p>
                  </div>
                </div>
                {displayImpersonating && (
                  <Badge variant="destructive" className="mt-2 animate-pulse">
                    Viewing as {displayName}
                  </Badge>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 w-full text-left">
                  <UserCog className="h-4 w-4" />
                  Switch Account
                </button>
                <Link href="/favorites" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  <Star className="h-4 w-4" />
                  Favorites
                </Link>
                <Link href="/reports" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  <Grid3X3 className="h-4 w-4" />
                  Reports
                </Link>
              </div>

              <div className="border-t py-2">
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  <Settings className="h-4 w-4" />
                  Account Preferences
                </Link>
                <Link href="/help" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  <HelpCircle className="h-4 w-4" />
                  Help
                </Link>
              </div>

              <div className="border-t py-2">
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-red-600 w-full text-left">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apps Menu Dropdown */}
      {showAppsMenu && (
        <div 
          className="absolute left-4 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Menu</h3>
          </div>
          
          {/* Shortcuts */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">Shortcuts</p>
            {[
              { icon: Clock, label: 'Time Off', href: '/time-off' },
              { icon: User, label: 'My Profile', href: '/profile' },
              { icon: Inbox, label: 'My Tasks', href: '/inbox' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700"
              >
                <item.icon className="h-4 w-4 text-gray-500" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Apps */}
          <div className="p-2 border-t">
            <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">Apps</p>
            <div className="grid grid-cols-3 gap-2 p-2">
              {[
                { icon: '💼', label: 'Pay', color: 'bg-green-100' },
                { icon: '🏥', label: 'Benefits', color: 'bg-blue-100' },
                { icon: '📅', label: 'Absence', color: 'bg-purple-100' },
                { icon: '📊', label: 'Career', color: 'bg-amber-100' },
                { icon: '📋', label: 'Learning', color: 'bg-pink-100' },
                { icon: '⚙️', label: 'Settings', color: 'bg-gray-100' },
              ].map((app, i) => (
                <button
                  key={i}
                  className="workday-app-tile flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className={`text-2xl p-2 rounded-lg ${app.color}`}>{app.icon}</span>
                  <span className="text-xs text-gray-600">{app.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-t">
            <button className="text-sm text-[#0875E1] hover:underline flex items-center gap-1">
              <MoreHorizontal className="h-4 w-4" />
              Add Apps
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
