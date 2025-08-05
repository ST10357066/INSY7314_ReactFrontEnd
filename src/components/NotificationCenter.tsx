import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Archive, Settings, Mail, Shield, CreditCard, AlertTriangle } from 'lucide-react';
import type { Notification } from '@/shared/types';
import Dialog from './Dialog';
import ErrorBoundary from './ErrorBoundary';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationCenterContent({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'read' as Notification['status'], read_at: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/archive`, {
        method: 'POST',
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'archived' as Notification['status'] }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  }, []);

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'transaction':
        return <CreditCard className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'account':
        return <Settings className="w-4 h-4" />;
      case 'marketing':
        return <Mail className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return notification.status === 'unread';
    if (activeTab === 'archived') return notification.status === 'archived';
    return notification.status !== 'archived';
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="max-w-2xl max-h-[600px] overflow-hidden flex flex-col">
        {/* Header with tabs and settings */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                {activeTab === 'unread' 
                  ? 'No unread notifications'
                  : activeTab === 'archived'
                  ? 'No archived notifications'
                  : 'No notifications yet'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                  notification.status === 'unread' ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">
                          {notification.title}
                        </h4>
                        {notification.priority === 'urgent' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                        <span className="capitalize">{notification.priority}</span>
                        <span className="capitalize">{notification.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {notification.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => archiveNotification(notification.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
          <button
            onClick={() => setActiveTab('all')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all notifications
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-slate-600 hover:text-slate-700"
          >
            Notification settings
          </button>
        </div>
      </div>

      {/* Notification Settings Dialog */}
      <Dialog isOpen={showSettings} onClose={() => setShowSettings(false)} title="Notification Settings">
        <NotificationSettings onClose={() => setShowSettings(false)} />
      </Dialog>
    </Dialog>
  );
}

// Notification Settings Component
function NotificationSettings({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    in_app_enabled: true,
    transaction_notifications: true,
    security_notifications: true,
    marketing_notifications: false,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Notification Channels</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.email_enabled}
              onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Email notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.sms_enabled}
              onChange={(e) => handleSettingChange('sms_enabled', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">SMS notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.push_enabled}
              onChange={(e) => handleSettingChange('push_enabled', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Push notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.in_app_enabled}
              onChange={(e) => handleSettingChange('in_app_enabled', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">In-app notifications</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Notification Types</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.transaction_notifications}
              onChange={(e) => handleSettingChange('transaction_notifications', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Transaction updates</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security_notifications}
              onChange={(e) => handleSettingChange('security_notifications', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Security alerts</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.marketing_notifications}
              onChange={(e) => handleSettingChange('marketing_notifications', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Marketing communications</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Quiet Hours</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.quiet_hours_enabled}
            onChange={(e) => handleSettingChange('quiet_hours_enabled', e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-slate-700">Enable quiet hours</span>
        </label>
        {settings.quiet_hours_enabled && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Start time</label>
              <input
                type="time"
                value={settings.quiet_hours_start}
                onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">End time</label>
              <input
                type="time"
                value={settings.quiet_hours_end}
                onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-600 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
} 

export default function NotificationCenter(props: NotificationCenterProps) {
  return (
    <ErrorBoundary>
      <NotificationCenterContent {...props} />
    </ErrorBoundary>
  );
} 