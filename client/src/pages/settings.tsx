import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Eye, Sun, Moon, Monitor, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState('system');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === 'account'
                      ? 'bg-[#e6f1f9] text-[#0056a6]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Account
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === 'notifications'
                      ? 'bg-[#e6f1f9] text-[#0056a6]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveSection('privacy')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === 'privacy'
                      ? 'bg-[#e6f1f9] text-[#0056a6]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSection('appearance')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === 'appearance'
                      ? 'bg-[#e6f1f9] text-[#0056a6]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="h-5 w-5 mr-3" />
                  Appearance
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {activeSection === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-[#0056a6] focus:border-[#0056a6]"
                      defaultValue="Jane Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-[#0056a6] focus:border-[#0056a6]"
                      defaultValue="jane.smith@oakbay.gov"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                      defaultValue="City Clerk"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact your administrator to change roles</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 bg-[#0056a6] text-white rounded-md hover:bg-[#004e95] text-sm font-medium flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Meeting reminders</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">New decisions</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Topic discussions</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">System updates</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">In-App Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">All notifications</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Sound alerts</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 bg-[#0056a6] text-white rounded-md hover:bg-[#004e95] text-sm font-medium flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'privacy' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Data Usage</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Analytics & Improvements</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Usage Statistics</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Session</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Stay logged in</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0056a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056a6]"></div>
                        </label>
                      </div>
                      <button className="text-sm text-[#0056a6] hover:text-[#004e95] mt-2">
                        Log out of all sessions
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Data Management</h3>
                    <button className="text-sm text-[#0056a6] hover:text-[#004e95]">
                      Export your data
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 bg-[#0056a6] text-white rounded-md hover:bg-[#004e95] text-sm font-medium flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          theme === 'light' ? 'border-[#0056a6] bg-[#e6f1f9]' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Sun className={`h-6 w-6 mb-2 ${theme === 'light' ? 'text-[#0056a6]' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-[#0056a6]' : 'text-gray-700'}`}>Light</span>
                      </button>
                      
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          theme === 'dark' ? 'border-[#0056a6] bg-[#e6f1f9]' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Moon className={`h-6 w-6 mb-2 ${theme === 'dark' ? 'text-[#0056a6]' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#0056a6]' : 'text-gray-700'}`}>Dark</span>
                      </button>
                      
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          theme === 'system' ? 'border-[#0056a6] bg-[#e6f1f9]' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Monitor className={`h-6 w-6 mb-2 ${theme === 'system' ? 'text-[#0056a6]' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'system' ? 'text-[#0056a6]' : 'text-gray-700'}`}>System</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Text Size</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">A</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        defaultValue="3"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-base text-gray-500 ml-3">A</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Dashboard Layout</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="compact" 
                          name="layout" 
                          className="h-4 w-4 text-[#0056a6] border-gray-300"
                        />
                        <label htmlFor="compact" className="ml-2 text-sm text-gray-700">Compact</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="standard" 
                          name="layout" 
                          className="h-4 w-4 text-[#0056a6] border-gray-300"
                          defaultChecked
                        />
                        <label htmlFor="standard" className="ml-2 text-sm text-gray-700">Standard</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="comfortable" 
                          name="layout" 
                          className="h-4 w-4 text-[#0056a6] border-gray-300"
                        />
                        <label htmlFor="comfortable" className="ml-2 text-sm text-gray-700">Comfortable</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 bg-[#0056a6] text-white rounded-md hover:bg-[#004e95] text-sm font-medium flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Appearance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;