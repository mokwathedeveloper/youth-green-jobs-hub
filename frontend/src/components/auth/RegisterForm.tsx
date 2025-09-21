import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Leaf, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema } from '../../schemas/auth';
import type { RegisterFormData } from '../../schemas/auth';
import { Button } from '@/components/ui/button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Alert from '../ui/Alert';

const RegisterForm: React.FC = () => {
  const {
    register: registerUser,
    isAuthenticated,
    isLoading,
    error,
    clearError
  } = useAuth();
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      county: 'Kisumu',
      preferred_language: 'en',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      setRegistrationSuccess(true);
      // After successful registration, user will be automatically logged in
      // and redirected via the useEffect above
    } catch (err) {
      // Error is handled by the auth context
      setRegistrationSuccess(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">Youth Green Jobs</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join the movement
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start making a difference in Kisumu
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Success Alert */}
            {registrationSuccess && (
              <Alert
                type="success"
                message="Registration successful! Redirecting to dashboard..."
                icon={<CheckCircle className="h-5 w-5" />}
              />
            )}

            {/* Error Alert */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={clearError}
              />
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('first_name')}
                  type="text"
                  label="First Name"
                  placeholder="Enter your first name"
                  error={errors.first_name?.message}
                  autoComplete="given-name"
                />
                <Input
                  {...register('last_name')}
                  type="text"
                  label="Last Name"
                  placeholder="Enter your last name"
                  error={errors.last_name?.message}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <Input
                  {...register('username')}
                  type="text"
                  label="Username"
                  placeholder="Choose a unique username"
                  error={errors.username?.message}
                  autoComplete="username"
                />
                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  error={errors.email?.message}
                  autoComplete="email"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('password')}
                    type="password"
                    label="Password"
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    showPasswordToggle
                    autoComplete="new-password"
                  />
                  <Input
                    {...register('password_confirm')}
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    error={errors.password_confirm?.message}
                    showPasswordToggle
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('phone_number')}
                  type="tel"
                  label="Phone Number (Optional)"
                  placeholder="+254712345678"
                  error={errors.phone_number?.message}
                  autoComplete="tel"
                />
                <Input
                  {...register('date_of_birth')}
                  type="date"
                  label="Date of Birth (Optional)"
                  error={errors.date_of_birth?.message}
                  autoComplete="bday"
                />
                <Select
                  {...register('gender')}
                  label="Gender (Optional)"
                  options={genderOptions}
                  placeholder="Select your gender"
                  error={errors.gender?.message}
                />
                <Select
                  {...register('preferred_language')}
                  label="Preferred Language"
                  options={languageOptions}
                  error={errors.preferred_language?.message}
                />
              </div>
            </div>

            {/* Location & Background */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('county')}
                  type="text"
                  label="County"
                  placeholder="Enter your county"
                  error={errors.county?.message}
                />
                <Input
                  {...register('sub_county')}
                  type="text"
                  label="Sub-County (Optional)"
                  placeholder="Enter your sub-county"
                  error={errors.sub_county?.message}
                />
                <Select
                  {...register('education_level')}
                  label="Education Level (Optional)"
                  options={educationOptions}
                  placeholder="Select your education level"
                  error={errors.education_level?.message}
                />
                <Select
                  {...register('employment_status')}
                  label="Employment Status (Optional)"
                  options={employmentOptions}
                  placeholder="Select your employment status"
                  error={errors.employment_status?.message}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>

          {/* Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-green-600 hover:text-green-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
