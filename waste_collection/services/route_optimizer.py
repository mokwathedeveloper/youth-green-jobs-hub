"""
Route optimization service for waste collection
"""
import logging
from typing import List, Dict, Tuple, Optional
from decimal import Decimal
from django.contrib.gis.geos import Point
from django.utils import timezone
from ..models import CollectionPoint, CollectionRoute, RouteOptimization
from .maps_service import maps_service

logger = logging.getLogger(__name__)


class RouteOptimizer:
    """Service for optimizing waste collection routes"""
    
    def __init__(self):
        self.maps_service = maps_service
    
    def optimize_collection_route(
        self,
        start_location: Point,
        collection_points: List[CollectionPoint],
        constraints: Optional[Dict] = None
    ) -> Optional[Dict]:
        """
        Optimize route for waste collection
        
        Args:
            start_location: Starting point for the route
            collection_points: List of collection points to visit
            constraints: Optional constraints (max_duration, max_distance, etc.)
            
        Returns:
            Optimized route data or None if optimization failed
        """
        if not collection_points:
            logger.warning("No collection points provided for optimization")
            return None
        
        # Set default constraints
        default_constraints = {
            'max_duration_minutes': 480,  # 8 hours
            'max_distance_km': 100,
            'vehicle_capacity_kg': 1000,
        }
        if constraints:
            default_constraints.update(constraints)
        
        try:
            # Prepare waypoints
            start_point = (start_location.y, start_location.x)
            waypoints = []
            
            for cp in collection_points:
                if hasattr(cp, 'location_data') and cp.location_data.coordinates:
                    waypoints.append((
                        cp.location_data.coordinates.y,
                        cp.location_data.coordinates.x
                    ))
                else:
                    # Fallback to basic coordinates if location_data not available
                    waypoints.append((cp.latitude, cp.longitude))
            
            # Use Google Maps to optimize the route
            route_result = self.maps_service.optimize_route(
                start_point=start_point,
                waypoints=waypoints,
                end_point=start_point  # Return to start
            )
            
            if not route_result:
                logger.error("Failed to get optimized route from Google Maps")
                return None
            
            # Calculate efficiency score
            efficiency_score = self._calculate_efficiency_score(
                route_result, collection_points, default_constraints
            )
            
            # Prepare optimized route data
            optimized_data = {
                'route_geometry': route_result['route_geometry'],
                'total_distance_km': Decimal(str(route_result['total_distance_meters'] / 1000)),
                'total_duration_minutes': route_result['total_duration_seconds'] // 60,
                'efficiency_score': efficiency_score,
                'waypoint_order': route_result['waypoint_order'],
                'collection_points_order': self._reorder_collection_points(
                    collection_points, route_result['waypoint_order']
                ),
                'route_legs': route_result['legs'],
                'overview_polyline': route_result['overview_polyline'],
                'bounds': route_result['bounds'],
            }
            
            return optimized_data
            
        except Exception as e:
            logger.error(f"Route optimization failed: {e}")
            return None
    
    def _calculate_efficiency_score(
        self, 
        route_result: Dict, 
        collection_points: List[CollectionPoint],
        constraints: Dict
    ) -> Decimal:
        """
        Calculate efficiency score for the optimized route
        
        Args:
            route_result: Route optimization result from Google Maps
            collection_points: Original collection points
            constraints: Route constraints
            
        Returns:
            Efficiency score (0-100)
        """
        try:
            # Base metrics
            total_distance_km = route_result['total_distance_meters'] / 1000
            total_duration_minutes = route_result['total_duration_seconds'] / 60
            num_points = len(collection_points)
            
            # Distance efficiency (lower is better)
            max_distance = constraints['max_distance_km']
            distance_efficiency = max(0, (max_distance - total_distance_km) / max_distance * 100)
            
            # Time efficiency (lower is better)
            max_duration = constraints['max_duration_minutes']
            time_efficiency = max(0, (max_duration - total_duration_minutes) / max_duration * 100)
            
            # Point density efficiency (more points per km is better)
            if total_distance_km > 0:
                point_density = num_points / total_distance_km
                density_efficiency = min(100, point_density * 10)  # Scale appropriately
            else:
                density_efficiency = 100
            
            # Weighted average of efficiency metrics
            efficiency_score = (
                distance_efficiency * 0.4 +
                time_efficiency * 0.4 +
                density_efficiency * 0.2
            )
            
            return Decimal(str(round(efficiency_score, 2)))
            
        except Exception as e:
            logger.error(f"Failed to calculate efficiency score: {e}")
            return Decimal('0.00')
    
    def _reorder_collection_points(
        self, 
        collection_points: List[CollectionPoint], 
        waypoint_order: List[int]
    ) -> List[CollectionPoint]:
        """
        Reorder collection points based on optimized waypoint order
        
        Args:
            collection_points: Original list of collection points
            waypoint_order: Optimized order indices from Google Maps
            
        Returns:
            Reordered list of collection points
        """
        try:
            if not waypoint_order:
                return collection_points
            
            reordered = []
            for index in waypoint_order:
                if 0 <= index < len(collection_points):
                    reordered.append(collection_points[index])
            
            # Add any remaining points that weren't in the optimized order
            for i, cp in enumerate(collection_points):
                if i not in waypoint_order:
                    reordered.append(cp)
            
            return reordered
            
        except Exception as e:
            logger.error(f"Failed to reorder collection points: {e}")
            return collection_points
    
    def create_optimized_route(
        self,
        name: str,
        description: str,
        start_location: Point,
        collection_points: List[CollectionPoint],
        created_by,
        constraints: Optional[Dict] = None
    ) -> Optional[CollectionRoute]:
        """
        Create and save an optimized collection route
        
        Args:
            name: Route name
            description: Route description
            start_location: Starting point
            collection_points: Collection points to include
            created_by: User creating the route
            constraints: Optional route constraints
            
        Returns:
            Created CollectionRoute instance or None if failed
        """
        try:
            # Optimize the route
            optimization_result = self.optimize_collection_route(
                start_location, collection_points, constraints
            )
            
            if not optimization_result:
                logger.error("Failed to optimize route")
                return None
            
            # Create the route
            route = CollectionRoute.objects.create(
                name=name,
                description=description,
                route_geometry=optimization_result['route_geometry'],
                estimated_duration_minutes=optimization_result['total_duration_minutes'],
                estimated_distance_km=optimization_result['total_distance_km'],
                optimization_score=optimization_result['efficiency_score'],
                created_by=created_by
            )
            
            logger.info(f"Created optimized route: {route.name} (ID: {route.id})")
            return route
            
        except Exception as e:
            logger.error(f"Failed to create optimized route: {e}")
            return None
    
    def analyze_route_coverage(
        self, 
        routes: List[CollectionRoute],
        analysis_area: Optional[Point] = None
    ) -> Dict:
        """
        Analyze coverage of collection routes
        
        Args:
            routes: List of collection routes to analyze
            analysis_area: Optional geographic area for analysis
            
        Returns:
            Coverage analysis results
        """
        try:
            total_distance = sum(
                route.estimated_distance_km for route in routes
            )
            total_duration = sum(
                route.estimated_duration_minutes for route in routes
            )
            avg_efficiency = sum(
                route.optimization_score for route in routes
            ) / len(routes) if routes else Decimal('0.00')
            
            analysis = {
                'total_routes': len(routes),
                'total_distance_km': float(total_distance),
                'total_duration_hours': float(total_duration / 60),
                'average_efficiency_score': float(avg_efficiency),
                'routes_by_efficiency': {
                    'excellent': len([r for r in routes if r.optimization_score >= 80]),
                    'good': len([r for r in routes if 60 <= r.optimization_score < 80]),
                    'fair': len([r for r in routes if 40 <= r.optimization_score < 60]),
                    'poor': len([r for r in routes if r.optimization_score < 40]),
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Route coverage analysis failed: {e}")
            return {}


# Global optimizer instance
route_optimizer = RouteOptimizer()
