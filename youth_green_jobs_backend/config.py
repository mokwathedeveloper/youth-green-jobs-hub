"""
Configuration utilities for Youth Green Jobs & Waste Recycling Hub

This module provides easy access to application configuration settings
and helper functions for configuration management.
"""

from django.conf import settings
from typing import Any, Dict, Optional, Union
import logging

logger = logging.getLogger(__name__)


class ConfigManager:
    """
    Centralized configuration manager for the application
    """
    
    @staticmethod
    def get_platform_config(key: str, default: Any = None) -> Any:
        """Get platform configuration value"""
        return getattr(settings, 'PLATFORM_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_youth_config(key: str, default: Any = None) -> Any:
        """Get youth eligibility configuration value"""
        return getattr(settings, 'YOUTH_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_waste_config(key: str, default: Any = None) -> Any:
        """Get waste collection configuration value"""
        return getattr(settings, 'WASTE_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_upload_config(key: str, default: Any = None) -> Any:
        """Get file upload configuration value"""
        return getattr(settings, 'UPLOAD_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_api_config(key: str, default: Any = None) -> Any:
        """Get API configuration value"""
        return getattr(settings, 'API_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_geolocation_config(key: str, default: Any = None) -> Any:
        """Get geolocation configuration value"""
        return getattr(settings, 'GEOLOCATION_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_analytics_config(key: str, default: Any = None) -> Any:
        """Get analytics configuration value"""
        return getattr(settings, 'ANALYTICS_CONFIG', {}).get(key, default)
    
    @staticmethod
    def get_all_config() -> Dict[str, Any]:
        """Get all application configuration as a dictionary"""
        return {
            'platform': getattr(settings, 'PLATFORM_CONFIG', {}),
            'youth': getattr(settings, 'YOUTH_CONFIG', {}),
            'waste': getattr(settings, 'WASTE_CONFIG', {}),
            'upload': getattr(settings, 'UPLOAD_CONFIG', {}),
            'api': getattr(settings, 'API_CONFIG', {}),
            'geolocation': getattr(settings, 'GEOLOCATION_CONFIG', {}),
            'analytics': getattr(settings, 'ANALYTICS_CONFIG', {}),
        }
    
    @staticmethod
    def validate_config() -> Dict[str, Any]:
        """
        Validate configuration settings and return validation results
        """
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Validate youth age configuration
        min_age = ConfigManager.get_youth_config('MIN_AGE', 18)
        max_age = ConfigManager.get_youth_config('MAX_AGE', 35)
        
        if min_age >= max_age:
            validation_results['valid'] = False
            validation_results['errors'].append(
                f"Youth minimum age ({min_age}) must be less than maximum age ({max_age})"
            )
        
        if min_age < 16:
            validation_results['warnings'].append(
                f"Youth minimum age ({min_age}) is quite low. Consider legal implications."
            )
        
        # Validate geolocation configuration
        lat = ConfigManager.get_geolocation_config('DEFAULT_LATITUDE', 0)
        lng = ConfigManager.get_geolocation_config('DEFAULT_LONGITUDE', 0)
        
        if not (-90 <= lat <= 90):
            validation_results['valid'] = False
            validation_results['errors'].append(
                f"Invalid default latitude ({lat}). Must be between -90 and 90."
            )
        
        if not (-180 <= lng <= 180):
            validation_results['valid'] = False
            validation_results['errors'].append(
                f"Invalid default longitude ({lng}). Must be between -180 and 180."
            )
        
        # Validate timeout configurations
        timeout = ConfigManager.get_api_config('DEFAULT_TIMEOUT_SECONDS', 30)
        if timeout <= 0:
            validation_results['valid'] = False
            validation_results['errors'].append(
                f"API timeout ({timeout}) must be positive."
            )
        
        geo_timeout = ConfigManager.get_geolocation_config('GEOLOCATION_TIMEOUT_MS', 10000)
        if geo_timeout <= 0:
            validation_results['valid'] = False
            validation_results['errors'].append(
                f"Geolocation timeout ({geo_timeout}) must be positive."
            )
        
        return validation_results


# Convenience functions for common configuration access
def get_default_county() -> str:
    """Get the default county for the platform"""
    return ConfigManager.get_platform_config('DEFAULT_COUNTY', 'Kisumu')

def get_youth_age_range() -> tuple:
    """Get the youth age range as (min_age, max_age)"""
    min_age = ConfigManager.get_youth_config('MIN_AGE', 18)
    max_age = ConfigManager.get_youth_config('MAX_AGE', 35)
    return (min_age, max_age)

def get_default_coordinates() -> tuple:
    """Get default coordinates as (latitude, longitude)"""
    lat = ConfigManager.get_geolocation_config('DEFAULT_LATITUDE', -0.0917)
    lng = ConfigManager.get_geolocation_config('DEFAULT_LONGITUDE', 34.7680)
    return (lat, lng)

def get_upload_path(upload_type: str) -> str:
    """
    Get upload path for specific upload type
    
    Args:
        upload_type: One of 'waste_reports', 'products', 'verification_docs', 'profile_pictures'
    
    Returns:
        Upload path string
    """
    path_mapping = {
        'waste_reports': 'WASTE_REPORTS_DIR',
        'products': 'PRODUCTS_DIR',
        'verification_docs': 'VERIFICATION_DOCS_DIR',
        'profile_pictures': 'PROFILE_PICTURES_DIR',
    }
    
    config_key = path_mapping.get(upload_type)
    if not config_key:
        logger.warning(f"Unknown upload type: {upload_type}")
        return 'uploads/'
    
    return ConfigManager.get_upload_config(config_key, 'uploads/')

def is_youth_eligible(age: int) -> bool:
    """
    Check if a person is eligible as youth based on age
    
    Args:
        age: Person's age in years
    
    Returns:
        True if eligible, False otherwise
    """
    min_age, max_age = get_youth_age_range()
    return min_age <= age <= max_age

def get_platform_info() -> Dict[str, str]:
    """Get basic platform information"""
    return {
        'name': ConfigManager.get_platform_config('PLATFORM_NAME', 'Youth Green Jobs Hub'),
        'version': ConfigManager.get_platform_config('PLATFORM_VERSION', '1.0.0'),
        'support_email': ConfigManager.get_platform_config('SUPPORT_EMAIL', 'support@youthgreenjobs.ke'),
        'support_website': ConfigManager.get_platform_config('SUPPORT_WEBSITE', 'https://youthgreenjobs.ke'),
    }


# Initialize configuration validation on import
def validate_configuration_on_startup():
    """Validate configuration when the module is imported"""
    try:
        validation_results = ConfigManager.validate_config()
        
        if not validation_results['valid']:
            logger.error("Configuration validation failed:")
            for error in validation_results['errors']:
                logger.error(f"  - {error}")
        
        if validation_results['warnings']:
            logger.warning("Configuration warnings:")
            for warning in validation_results['warnings']:
                logger.warning(f"  - {warning}")
                
    except Exception as e:
        logger.error(f"Error during configuration validation: {e}")


# Run validation when module is imported
if hasattr(settings, 'PLATFORM_CONFIG'):
    validate_configuration_on_startup()
