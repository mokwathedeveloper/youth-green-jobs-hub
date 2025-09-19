/**
 * Google Maps service for frontend integration
 */

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id: string;
  address_components: any[];
}

interface RouteOptimizationRequest {
  start_latitude: number;
  start_longitude: number;
  collection_point_ids: string[];
  constraints?: {
    max_duration_minutes?: number;
    max_distance_km?: number;
    vehicle_capacity_kg?: number;
  };
}

interface RouteOptimizationResult {
  success: boolean;
  optimization_result?: {
    total_distance_km: number;
    total_duration_minutes: number;
    efficiency_score: number;
    waypoint_order: number[];
    overview_polyline: string;
    bounds: any;
  };
  error?: string;
}

class MapsService {
  private apiKey: string;
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Load Google Maps JavaScript API
   */
  async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Initialize a Google Map
   */
  async initializeMap(
    container: HTMLElement,
    options: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    await this.loadGoogleMaps();
    return new google.maps.Map(container, options);
  }

  /**
   * Geocode an address using backend API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await fetch('/api/v1/waste-collection/maps/geocode/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      
      if (data.success && data.result) {
        return {
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          formatted_address: data.result.formatted_address,
          place_id: data.result.place_id,
          address_components: data.result.address_components,
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates using backend API
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await fetch('/api/v1/waste-collection/maps/reverse-geocode/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      
      if (data.success && data.result) {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Optimize collection route using backend API
   */
  async optimizeRoute(request: RouteOptimizationRequest): Promise<RouteOptimizationResult> {
    try {
      const response = await fetch('/api/v1/waste-collection/routes/optimize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Route optimization failed:', error);
      return {
        success: false,
        error: 'Route optimization failed',
      };
    }
  }

  /**
   * Get coverage analysis for an area
   */
  async getCoverageAnalysis(
    centerLatitude: number,
    centerLongitude: number,
    radiusKm: number = 10
  ): Promise<any> {
    try {
      const response = await fetch(
        `/api/v1/waste-collection/analytics/coverage/?center_latitude=${centerLatitude}&center_longitude=${centerLongitude}&radius_km=${radiusKm}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Coverage analysis failed:', error);
      return null;
    }
  }

  /**
   * Create a marker on the map
   */
  async createMarker(
    map: google.maps.Map,
    position: google.maps.LatLngLiteral,
    options?: google.maps.MarkerOptions
  ): Promise<google.maps.Marker> {
    await this.loadGoogleMaps();
    
    return new google.maps.Marker({
      position,
      map,
      ...options,
    });
  }

  /**
   * Create an info window
   */
  async createInfoWindow(
    content: string,
    options?: google.maps.InfoWindowOptions
  ): Promise<google.maps.InfoWindow> {
    await this.loadGoogleMaps();
    
    return new google.maps.InfoWindow({
      content,
      ...options,
    });
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get user's current location
   */
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
}

// Global service instance
export const mapsService = new MapsService();
export default mapsService;
