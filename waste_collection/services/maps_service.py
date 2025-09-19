"""
Google Maps API integration service for waste collection
"""
import googlemaps
import logging
from typing import List, Dict, Tuple, Optional
from django.conf import settings
from django.contrib.gis.geos import Point, LineString
from decimal import Decimal
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class GoogleMapsService:
    """Service for Google Maps API integration"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
        if not self.api_key:
            logger.warning("Google Maps API key not configured")
            self.client = None
        else:
            self.client = googlemaps.Client(key=self.api_key)
    
    def geocode_address(self, address: str) -> Optional[Dict]:
        """
        Geocode an address to get coordinates and place details
        
        Args:
            address: Address string to geocode
            
        Returns:
            Dict with coordinates and place details, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        try:
            results = self.client.geocode(address)
            if not results:
                return None
            
            result = results[0]
            location = result['geometry']['location']
            
            return {
                'latitude': location['lat'],
                'longitude': location['lng'],
                'formatted_address': result['formatted_address'],
                'place_id': result['place_id'],
                'address_components': result['address_components'],
                'geometry': result['geometry'],
            }
        except Exception as e:
            logger.error(f"Geocoding failed for address '{address}': {e}")
            return None
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Reverse geocode coordinates to get address information
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Dict with address information, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        try:
            results = self.client.reverse_geocode((latitude, longitude))
            if not results:
                return None
            
            result = results[0]
            return {
                'formatted_address': result['formatted_address'],
                'place_id': result['place_id'],
                'address_components': result['address_components'],
                'plus_code': result.get('plus_code', {}),
            }
        except Exception as e:
            logger.error(f"Reverse geocoding failed for ({latitude}, {longitude}): {e}")
            return None
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """
        Get detailed information about a place
        
        Args:
            place_id: Google Places API place ID
            
        Returns:
            Dict with place details, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        try:
            result = self.client.place(
                place_id=place_id,
                fields=[
                    'name', 'formatted_address', 'geometry', 'place_id',
                    'types', 'vicinity', 'rating', 'opening_hours',
                    'wheelchair_accessible_entrance', 'business_status'
                ]
            )
            return result.get('result', {})
        except Exception as e:
            logger.error(f"Failed to get place details for {place_id}: {e}")
            return None
    
    def calculate_distance_matrix(
        self, 
        origins: List[Tuple[float, float]], 
        destinations: List[Tuple[float, float]],
        mode: str = 'driving'
    ) -> Optional[Dict]:
        """
        Calculate distance and duration matrix between multiple points
        
        Args:
            origins: List of (latitude, longitude) tuples for origin points
            destinations: List of (latitude, longitude) tuples for destination points
            mode: Travel mode ('driving', 'walking', 'bicycling', 'transit')
            
        Returns:
            Distance matrix results, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        try:
            result = self.client.distance_matrix(
                origins=origins,
                destinations=destinations,
                mode=mode,
                units='metric',
                avoid=['tolls'],
                departure_time=datetime.now()
            )
            return result
        except Exception as e:
            logger.error(f"Distance matrix calculation failed: {e}")
            return None
    
    def optimize_route(
        self, 
        start_point: Tuple[float, float],
        waypoints: List[Tuple[float, float]],
        end_point: Optional[Tuple[float, float]] = None
    ) -> Optional[Dict]:
        """
        Optimize route through multiple waypoints
        
        Args:
            start_point: Starting point (latitude, longitude)
            waypoints: List of waypoints to visit
            end_point: Optional ending point (defaults to start_point)
            
        Returns:
            Optimized route information, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        if not end_point:
            end_point = start_point
        
        try:
            result = self.client.directions(
                origin=start_point,
                destination=end_point,
                waypoints=waypoints,
                optimize_waypoints=True,
                mode='driving',
                units='metric',
                avoid=['tolls'],
                departure_time=datetime.now()
            )
            
            if not result:
                return None
            
            route = result[0]
            
            # Extract route geometry
            polyline_points = []
            for leg in route['legs']:
                for step in leg['steps']:
                    # Decode polyline points
                    points = googlemaps.convert.decode_polyline(
                        step['polyline']['points']
                    )
                    polyline_points.extend(points)
            
            # Create LineString geometry
            line_coords = [(point['lng'], point['lat']) for point in polyline_points]
            route_geometry = LineString(line_coords)
            
            # Calculate totals
            total_distance = sum(leg['distance']['value'] for leg in route['legs'])
            total_duration = sum(leg['duration']['value'] for leg in route['legs'])
            
            return {
                'route_geometry': route_geometry,
                'total_distance_meters': total_distance,
                'total_duration_seconds': total_duration,
                'waypoint_order': route.get('waypoint_order', []),
                'legs': route['legs'],
                'overview_polyline': route['overview_polyline'],
                'bounds': route['bounds'],
            }
        except Exception as e:
            logger.error(f"Route optimization failed: {e}")
            return None
    
    def find_nearby_places(
        self, 
        location: Tuple[float, float],
        radius: int = 5000,
        place_type: str = 'establishment'
    ) -> List[Dict]:
        """
        Find nearby places of interest
        
        Args:
            location: Center point (latitude, longitude)
            radius: Search radius in meters
            place_type: Type of places to search for
            
        Returns:
            List of nearby places
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return []
        
        try:
            result = self.client.places_nearby(
                location=location,
                radius=radius,
                type=place_type
            )
            return result.get('results', [])
        except Exception as e:
            logger.error(f"Nearby places search failed: {e}")
            return []
    
    def get_elevation(self, locations: List[Tuple[float, float]]) -> Optional[List[Dict]]:
        """
        Get elevation data for locations
        
        Args:
            locations: List of (latitude, longitude) tuples
            
        Returns:
            List of elevation data, or None if failed
        """
        if not self.client:
            logger.error("Google Maps client not initialized")
            return None
        
        try:
            result = self.client.elevation(locations)
            return result
        except Exception as e:
            logger.error(f"Elevation data request failed: {e}")
            return None


# Global service instance
maps_service = GoogleMapsService()
