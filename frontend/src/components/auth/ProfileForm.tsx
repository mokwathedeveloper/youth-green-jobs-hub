import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Save, Camera, Shield, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profileUpdateSchema, ProfileUpdateFormData } from '../../schemas/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Alert from '../ui/Alert';

const ProfileForm: React.FC = () => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || undefined,
        bio: user.bio || '',
        county: user.county || '',
        sub_county: user.sub_county || '',
        address: user.address || '',
        education_level: user.education_level || undefined,
        skills: user.skills || '',
        interests: user.interests || '',
        employment_status: user.employment_status || undefined,
        preferred_language: user.preferred_language || 'en',
        receive_sms_notifications: user.receive_sms_notifications ?? true,
        receive_email_notifications: user.receive_email_notifications ?? true,
      });
    }
  }, [user, reset]);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      setSuccessMessage(null);
    };
  }, [clearError]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      await updateProfile(data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  const educationOptions = [
    { value: 'none', label: 'No formal education' },
    { value: 'primary', label: 'Primary education' },
    { value: 'secondary', label: 'Secondary education' },
    { value: 'tertiary', label: 'Tertiary education' },
    { value: 'university', label: 'University degree' },
    { value: 'postgraduate', label: 'Postgraduate degree' },
  ];

  const employmentOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'seeking_work', label: 'Seeking work' },
    { value: 'student', label: 'Student' },
    { value: 'self_employed', label: 'Self-employed' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Kiswahili' },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600">@{user.username}</p>
            {user.is_youth && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                Youth Eligible
              </span>
            )}
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <p className="text-sm text-gray-500">Profile Completion</p>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${user.profile_completion_percentage || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.profile_completion_percentage || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Messages */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={clearError}
          />
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('first_name')}
              type="text"
              label="First Name"
              error={errors.first_name?.message}
            />
            <Input
              {...register('last_name')}
              type="text"
              label="Last Name"
              error={errors.last_name?.message}
            />
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              error={errors.email?.message}
            />
            <Input
              {...register('phone_number')}
              type="tel"
              label="Phone Number"
              placeholder="+254712345678"
              error={errors.phone_number?.message}
            />
            <Input
              {...register('date_of_birth')}
              type="date"
              label="Date of Birth"
              error={errors.date_of_birth?.message}
            />
            <Select
              {...register('gender')}
              label="Gender"
              options={genderOptions}
              placeholder="Select your gender"
              error={errors.gender?.message}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('county')}
              type="text"
              label="County"
              error={errors.county?.message}
            />
            <Input
              {...register('sub_county')}
              type="text"
              label="Sub-County"
              error={errors.sub_county?.message}
            />
          </div>
          <div className="mt-4">
            <Input
              {...register('address')}
              type="text"
              label="Address"
              placeholder="Enter your full address"
              error={errors.address?.message}
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              {...register('education_level')}
              label="Education Level"
              options={educationOptions}
              placeholder="Select your education level"
              error={errors.education_level?.message}
            />
            <Select
              {...register('employment_status')}
              label="Employment Status"
              options={employmentOptions}
              placeholder="Select your employment status"
              error={errors.employment_status?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <textarea
                {...register('skills')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="List your skills (comma-separated)"
              />
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests
              </label>
              <textarea
                {...register('interests')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="List your interests (comma-separated)"
              />
              {errors.interests && (
                <p className="mt-1 text-sm text-red-600">{errors.interests.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Preferences
          </h2>
          <div className="space-y-4">
            <Select
              {...register('preferred_language')}
              label="Preferred Language"
              options={languageOptions}
              error={errors.preferred_language?.message}
            />
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('receive_email_notifications')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Receive email notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  {...register('receive_sms_notifications')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Receive SMS notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
