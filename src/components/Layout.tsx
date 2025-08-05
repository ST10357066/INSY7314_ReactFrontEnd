import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Shield, LogOut, CreditCard, User, BarChart3, Sun, Moon, Monitor, Bell, MessageSquare, HelpCircle } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import LiveChat from "./LiveChat";
import SupportTickets from "./SupportTickets";
import FAQ from "./FAQ";
import ComplianceCenter from "./ComplianceCenter";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export default function Layout({ children, showSidebar = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSupportTickets, setShowSupportTickets] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Persist language preference
  React.useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // Save language preference when it changes
  React.useEffect(() => {
    localStorage.setItem('lang', i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const sidebarItems = [
    { icon: BarChart3, label: t('dashboard'), path: "/dashboard" },
    { icon: CreditCard, label: t('new_payment') || 'New Payment', path: "/payment" },
    { icon: User, label: t('profile'), path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">SecurePay</span>
            </Link>
            
            <nav className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="px-2 py-1 rounded-md border border-slate-300 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={t('language')}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={`Current theme: ${theme}`}
              >
                {theme === 'light' && <Sun className="w-5 h-5" />}
                {theme === 'dark' && <Moon className="w-5 h-5" />}
                {theme === 'auto' && <Monitor className="w-5 h-5" />}
              </button>

              {user ? (
                <>
                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
                    title={t('notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Support Menu */}
                  <div className="relative group">
                    <button className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => setShowLiveChat(true)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{t('live_chat') || 'Live Chat'}</span>
                        </button>
                        <button
                          onClick={() => setShowSupportTickets(true)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>{t('support_tickets') || 'Support Tickets'}</span>
                        </button>
                        <button
                          onClick={() => setShowFAQ(true)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>{t('faq') || 'FAQ'}</span>
                        </button>
                        <button
                          onClick={() => setShowCompliance(true)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4" />
                          <span>{t('compliance') || 'Compliance'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t('welcome')}, {user.google_user_data?.given_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && user && (
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Live Chat */}
      <LiveChat
        isOpen={showLiveChat}
        onClose={() => setShowLiveChat(false)}
      />

      {/* Support Tickets */}
      <SupportTickets
        isOpen={showSupportTickets}
        onClose={() => setShowSupportTickets(false)}
      />

      {/* FAQ */}
      <FAQ
        isOpen={showFAQ}
        onClose={() => setShowFAQ(false)}
      />

      {/* Compliance Center */}
      <ComplianceCenter
        isOpen={showCompliance}
        onClose={() => setShowCompliance(false)}
      />
    </div>
  );
}
