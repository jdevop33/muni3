import React, { useState } from 'react';
import { Bell, Plus, X, Calendar, CheckCircle, LightbulbIcon, MapPin } from 'lucide-react';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'meeting',
      name: 'Council Meetings',
      description: 'All regular council meetings',
      active: true
    },
    {
      id: 2,
      type: 'topic',
      name: 'Housing',
      description: 'All discussions related to housing',
      active: true
    },
    {
      id: 3,
      type: 'decision',
      name: 'Zoning Decisions',
      description: 'Decisions affecting zoning regulations',
      active: false
    },
    {
      id: 4,
      type: 'neighborhood',
      name: 'Oak Bay Village',
      description: 'Issues affecting the Village area',
      active: true
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Decision: Parks Master Plan Approved',
      date: 'Apr 2, 2024',
      read: false,
      type: 'decision'
    },
    {
      id: 2,
      title: 'Upcoming Meeting: Budget Review Session',
      date: 'Apr 8, 2024',
      read: false,
      type: 'meeting'
    },
    {
      id: 3,
      title: 'Housing Topic: New Development Proposal',
      date: 'Mar 28, 2024',
      read: true,
      type: 'topic'
    },
    {
      id: 4,
      title: 'Oak Bay Village: Pedestrian Safety Improvements',
      date: 'Mar 25, 2024',
      read: true,
      type: 'neighborhood'
    },
    {
      id: 5,
      title: 'Meeting Minutes Available: March Planning Committee',
      date: 'Mar 22, 2024',
      read: true,
      type: 'meeting'
    }
  ]);

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'decision':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'topic':
        return <LightbulbIcon className="h-5 w-5 text-amber-500" />;
      case 'neighborhood':
        return <MapPin className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Alerts</h1>
        <p className="text-gray-600">Manage your notification preferences for council activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Notifications</h2>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-500">
                  {notifications.filter(n => !n.read).length} unread
                </span>
                <button className="text-sm text-[#0056a6] hover:text-[#004e95]">
                  Mark all as read
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex items-start ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="mr-3 mt-0.5">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`text-sm ${notification.read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Active Alerts</h2>
              <button className="text-sm text-white bg-[#0056a6] hover:bg-[#004e95] px-3 py-1.5 rounded flex items-center">
                <Plus className="h-4 w-4 mr-1" /> New Alert
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {alerts.map(alert => (
                <div key={alert.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{alert.name}</h3>
                      <p className="text-xs text-gray-500">{alert.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={alert.active}
                      onChange={() => toggleAlert(alert.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Delivery Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="email" className="h-4 w-4 text-[#0056a6] border-gray-300 rounded" checked />
                  <label htmlFor="email" className="ml-2 text-sm text-gray-700">Email notifications</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="sms" className="h-4 w-4 text-[#0056a6] border-gray-300 rounded" />
                  <label htmlFor="sms" className="ml-2 text-sm text-gray-700">SMS alerts (coming soon)</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="app" className="h-4 w-4 text-[#0056a6] border-gray-300 rounded" checked />
                  <label htmlFor="app" className="ml-2 text-sm text-gray-700">In-app notifications</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;