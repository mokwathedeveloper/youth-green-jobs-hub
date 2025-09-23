import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, MapPin, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { wasteReportSchema, type WasteReportFormData } from '../../schemas/wasteSchemas';
import { useWaste } from '../../hooks/useWaste';
import { wasteApi } from '../../services/api';
import type { MapLocation, WasteCategory, CollectionPoint } from '../../types/waste';


interface WasteReportFormProps {
  onSuccess?: (reportId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<WasteReportFormData>;
}

export const WasteReportForm: React.FC<WasteReportFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const {
    categories,
    collectionPoints,
    nearbyPoints,
    categoriesLoading,
    collectionPointsLoading,
    nearbyPointsLoading,
    loadNearbyPoints
  } = useWaste();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<WasteReportFormData>({
    resolver: zodResolver(wasteReportSchema),
    defaultValues: {
      ...initialData
    }
  });

  const watchedPhoto = watch('photo');

  // Categories are now loaded via useWaste hook

  // Collection points are now loaded via useWaste hook

  // Handle photo preview
  useEffect(() => {
    if (watchedPhoto && watchedPhoto instanceof FileList && watchedPhoto.length > 0) {
      const file = watchedPhoto[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }, [watchedPhoto]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await wasteApi.getCurrentLocation();
      setCurrentLocation(location);
      setValue('latitude', location.latitude);
      setValue('longitude', location.longitude);

      // Load nearby collection points using useWaste hook
      if (loadNearbyPoints) {
        loadNearbyPoints(location.latitude, location.longitude, 10);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('Failed to get your location. Please ensure location services are enabled.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const onSubmit = async (data: WasteReportFormData) => {
    try {
      const report = await wasteApi.createWasteReport(data);
      reset();
      setPhotoPreview(null);
      onSuccess?.(report.id);
    } catch (error) {
      console.error('Failed to create waste report:', error);
      alert('Failed to submit waste report. Please try again.');
    }
  };

  const kisumuSubCounties = [
    'Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 
    'Nyando', 'Muhoroni', 'Nyakach'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Waste</h2>
        <p className="text-gray-600">
          Help keep Kisumu clean by reporting waste that needs collection.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Report Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., Plastic bottles near market"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe the waste, its condition, and any relevant details..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Waste Category *
            </label>
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : (
              <select
                {...register('category_id')}
                id="category_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {(() => {
                  const categoriesToUse = categories || [];
                  if (!Array.isArray(categoriesToUse)) {
                    console.error('Categories is not an array:', categoriesToUse);
                    return null;
                  }
                  return categoriesToUse.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.credit_rate || category.credit_rate_per_kg || 0} credits/kg)
                    </option>
                  ));
                })()}
              </select>
            )}
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="estimated_weight" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Weight (kg) *
            </label>
            <input
              {...register('estimated_weight', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              id="estimated_weight"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.estimated_weight && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.estimated_weight.message}
              </p>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level *
          </label>
          <select
            {...register('priority')}
            id="priority"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="low">Low - Can wait for regular collection</option>
            <option value="medium">Medium - Should be collected soon</option>
            <option value="high">High - Needs prompt attention</option>
            <option value="urgent">Urgent - Immediate collection required</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.priority.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location_description" className="block text-sm font-medium text-gray-700 mb-1">
            Location Description *
          </label>
          <div className="flex gap-2">
            <input
              {...register('location_description')}
              type="text"
              id="location_description"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Behind Kisumu Central Market, near the bus stop"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </button>
          </div>
          {currentLocation && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Location captured: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </p>
          )}
          {errors.location_description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.location_description.message}
            </p>
          )}
        </div>



        {/* Collection Point */}
        {(() => {
          const pointsToUse = nearbyPoints.length > 0 ? nearbyPoints : (Array.isArray(collectionPoints) ? collectionPoints : collectionPoints?.results || []);
          if (pointsToUse.length === 0) return null;

          return (
            <div>
              <label htmlFor="collection_point_id" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Collection Point (Optional)
              </label>
              <select
                {...register('collection_point_id')}
                id="collection_point_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">No preference</option>
                {pointsToUse.map((point: any) => (
                  <option key={point.id} value={point.id}>
                    {point.name} - {point.address}
                    {point.distance_km && ` (${point.distance_km.toFixed(1)} km away)`}
                  </option>
                ))}
              </select>
            </div>
          );
        })()}

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
            Photo (Optional)
          </label>
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
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="photo"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>{photoPreview ? 'Change photo' : 'Upload a photo'}</span>
                  <input
                    {...register('photo')}
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
          {errors.photo && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.photo.message}
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
