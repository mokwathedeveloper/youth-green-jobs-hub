import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 

  Palette,
  Database,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your personal information and profile details'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configure your notification preferences'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Manage your privacy settings and account security'
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      icon: <Palette className="w-5 h-5" />,
      description: 'Customize your app experience and display settings'
    },
    {
      id: 'data',
      title: 'Data & Storage',
      icon: <Database className="w-5 h-5" />,
      description: 'Manage your data and storage preferences'
    }
  ];

  const handleSaveSettings = () => {
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            defaultValue={user?.first_name || ''}
            placeholder="Enter your first name"
          />
          <Input
            label="Last Name"
            defaultValue={user?.last_name || ''}
            placeholder="Enter your last name"
          />
          <Input
            label="Email"
            type="email"
            defaultValue={user?.email || ''}
            placeholder="Enter your email"
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="County"
            options={[
              { value: 'kisumu', label: 'Kisumu' },
              { value: 'nairobi', label: 'Nairobi' },
              { value: 'mombasa', label: 'Mombasa' }
            ]}
            defaultValue="kisumu"
          />
          <Input
            label="Sub-County"
            placeholder="Enter your sub-county"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { id: 'waste_reports', label: 'Waste Report Updates', description: 'Get notified when your waste reports are processed' },
            { id: 'credits', label: 'Credit Transactions', description: 'Receive notifications for credit earnings and spending' },
            { id: 'events', label: 'Collection Events', description: 'Stay updated on upcoming waste collection events' },
            { id: 'products', label: 'Product Updates', description: 'Get notified about new eco-friendly products' }
          ].map((notification) => (
            <div key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{notification.label}</h4>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Security</h3>
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          {[
            { id: 'profile_visibility', label: 'Profile Visibility', description: 'Make your profile visible to other users' },
            { id: 'location_sharing', label: 'Location Sharing', description: 'Share your location for better waste collection services' },
            { id: 'activity_tracking', label: 'Activity Tracking', description: 'Allow tracking of your environmental impact activities' }
          ].map((privacy) => (
            <div key={privacy.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{privacy.label}</h4>
                <p className="text-sm text-gray-600">{privacy.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Theme"
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' }
            ]}
            defaultValue="light"
          />
          <Select
            label="Language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'sw', label: 'Kiswahili' }
            ]}
            defaultValue="en"
          />
          <Select
            label="Dashboard Layout"
            options={[
              { value: 'grid', label: 'Grid View' },
              { value: 'list', label: 'List View' }
            ]}
            defaultValue="grid"
          />
          <Select
            label="Items Per Page"
            options={[
              { value: '10', label: '10 items' },
              { value: '20', label: '20 items' },
              { value: '50', label: '50 items' }
            ]}
            defaultValue="20"
          />
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Export Your Data</h4>
            <p className="text-sm text-gray-600 mb-4">Download a copy of all your data including waste reports, credits, and activities.</p>
            <Button variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'preferences':
        return renderPreferencesSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - Youth Green Jobs Hub</title>
        <meta name="description" content="Manage your account settings, preferences, and privacy controls" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600">
              Manage your account settings, preferences, and privacy controls
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6">
              <Alert type="success" message={successMessage} />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Navigation */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        {section.icon}
                        <span className="ml-3">{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {settingsSections.find(s => s.id === activeSection)?.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {settingsSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>

                {renderActiveSection()}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
