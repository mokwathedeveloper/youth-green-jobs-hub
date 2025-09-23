import React, { useState } from 'react';
import { Bell, ChevronDown, Upload } from 'lucide-react';

export const TestPage: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleNotificationClick = () => {
    console.log('Notification clicked!');
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleUserMenuClick = () => {
    console.log('User menu clicked!');
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Photo input changed!', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Component Testing Page</h1>
        
        {/* Notification Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notification Icon Test</h2>
          <div className="relative inline-block">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-full transition-colors cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                3
              </span>
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">Test notification</p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Status: {isNotificationOpen ? 'Open' : 'Closed'}
          </p>
        </div>

        {/* User Menu Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Menu Test</h2>
          <div className="relative inline-block">
            <button
              onClick={handleUserMenuClick}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="button"
            >
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                JD
              </div>
              <span>John Doe</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help</a>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Status: {isUserMenuOpen ? 'Open' : 'Closed'}
          </p>
        </div>

        {/* Photo Upload Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Photo Upload Test</h2>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              {photoPreview ? (
                <div className="mb-4">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="test-photo"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>{photoPreview ? 'Change photo' : 'Upload a photo'}</span>
                  <input
                    id="test-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Photo: {photoPreview ? 'Uploaded' : 'None'}
          </p>
        </div>

        {/* Console Log Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Console Test</h2>
          <button
            onClick={() => console.log('Test button clicked!')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Click to Test Console
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Check browser console for messages when clicking buttons above.
          </p>
        </div>
      </div>
    </div>
  );
};
