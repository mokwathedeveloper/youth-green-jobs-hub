#!/usr/bin/env python
"""
Configuration Validation Script for Youth Green Jobs Hub

This script validates both backend and frontend configurations
and provides helpful feedback for any issues found.
"""

import os
import sys
import json
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')

try:
    import django
    django.setup()
    from youth_green_jobs_backend.config import ConfigManager
    DJANGO_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Django not available - {e}")
    DJANGO_AVAILABLE = False


def validate_backend_config():
    """Validate backend configuration"""
    print("🔧 Validating Backend Configuration...")
    
    if not DJANGO_AVAILABLE:
        print("❌ Django not available - cannot validate backend config")
        return False
    
    try:
        # Validate using Django's check system
        from django.core.management import execute_from_command_line
        from io import StringIO
        import contextlib
        
        # Capture output from Django check
        output = StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            try:
                execute_from_command_line(['manage.py', 'check', '--quiet'])
                django_check_passed = True
            except SystemExit as e:
                django_check_passed = e.code == 0
        
        if django_check_passed:
            print("✅ Django configuration check passed")
        else:
            print("❌ Django configuration check failed")
            print(output.getvalue())
        
        # Validate using our custom config manager
        validation_results = ConfigManager.validate_config()
        
        if validation_results['valid']:
            print("✅ Custom configuration validation passed")
        else:
            print("❌ Custom configuration validation failed:")
            for error in validation_results['errors']:
                print(f"   - {error}")
        
        if validation_results['warnings']:
            print("⚠️  Configuration warnings:")
            for warning in validation_results['warnings']:
                print(f"   - {warning}")
        
        # Check environment file
        env_file = project_root / '.env'
        if env_file.exists():
            print("✅ Backend .env file found")
        else:
            print("⚠️  Backend .env file not found - using defaults")
        
        return validation_results['valid'] and django_check_passed
        
    except Exception as e:
        print(f"❌ Backend validation error: {e}")
        return False


def validate_frontend_config():
    """Validate frontend configuration"""
    print("\n🎨 Validating Frontend Configuration...")
    
    frontend_dir = project_root / 'frontend'
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Check for environment files
    env_files = ['.env.local', '.env.development', '.env']
    env_found = False
    
    for env_file in env_files:
        env_path = frontend_dir / env_file
        if env_path.exists():
            print(f"✅ Frontend environment file found: {env_file}")
            env_found = True
            break
    
    if not env_found:
        print("⚠️  No frontend environment file found - using defaults")
    
    # Check package.json
    package_json = frontend_dir / 'package.json'
    if package_json.exists():
        print("✅ Frontend package.json found")
        try:
            with open(package_json) as f:
                package_data = json.load(f)
            
            # Check for required dependencies
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            all_deps = {**dependencies, **dev_dependencies}
            
            required_deps = ['react', 'axios', 'vite']
            missing_deps = [dep for dep in required_deps if dep not in all_deps]
            
            if missing_deps:
                print(f"⚠️  Missing dependencies: {', '.join(missing_deps)}")
            else:
                print("✅ Required dependencies found")
                
        except json.JSONDecodeError:
            print("❌ Invalid package.json format")
            return False
    else:
        print("❌ Frontend package.json not found")
        return False
    
    # Check for config file
    config_file = frontend_dir / 'src' / 'config' / 'index.ts'
    if config_file.exists():
        print("✅ Frontend configuration module found")
    else:
        print("❌ Frontend configuration module not found")
        return False
    
    return True


def validate_database_config():
    """Validate database configuration"""
    print("\n🗄️  Validating Database Configuration...")
    
    if not DJANGO_AVAILABLE:
        print("❌ Django not available - cannot validate database config")
        return False
    
    try:
        from django.db import connection
        from django.core.management import execute_from_command_line
        
        # Test database connection
        connection.ensure_connection()
        print("✅ Database connection successful")
        
        # Check for pending migrations
        from io import StringIO
        import contextlib
        
        output = StringIO()
        with contextlib.redirect_stdout(output):
            try:
                execute_from_command_line(['manage.py', 'showmigrations', '--plan'])
                migrations_output = output.getvalue()
                
                if '[ ]' in migrations_output:
                    print("⚠️  Pending migrations found - run 'python manage.py migrate'")
                else:
                    print("✅ All migrations applied")
                    
            except SystemExit:
                pass
        
        return True
        
    except Exception as e:
        print(f"❌ Database validation error: {e}")
        return False


def check_file_permissions():
    """Check file permissions for upload directories"""
    print("\n📁 Checking File Permissions...")
    
    if not DJANGO_AVAILABLE:
        print("❌ Django not available - cannot check upload directories")
        return False
    
    try:
        from django.conf import settings
        
        # Check media root
        media_root = Path(settings.MEDIA_ROOT)
        if media_root.exists():
            if os.access(media_root, os.W_OK):
                print(f"✅ Media directory writable: {media_root}")
            else:
                print(f"❌ Media directory not writable: {media_root}")
                return False
        else:
            print(f"⚠️  Media directory doesn't exist: {media_root}")
            try:
                media_root.mkdir(parents=True, exist_ok=True)
                print(f"✅ Created media directory: {media_root}")
            except PermissionError:
                print(f"❌ Cannot create media directory: {media_root}")
                return False
        
        # Check static root
        static_root = Path(settings.STATIC_ROOT)
        if static_root.exists():
            if os.access(static_root, os.W_OK):
                print(f"✅ Static directory writable: {static_root}")
            else:
                print(f"❌ Static directory not writable: {static_root}")
                return False
        else:
            print(f"⚠️  Static directory doesn't exist: {static_root}")
        
        return True
        
    except Exception as e:
        print(f"❌ File permissions check error: {e}")
        return False


def main():
    """Main validation function"""
    print("🚀 Youth Green Jobs Hub - Configuration Validator")
    print("=" * 50)
    
    results = []
    
    # Validate backend
    results.append(validate_backend_config())
    
    # Validate frontend
    results.append(validate_frontend_config())
    
    # Validate database
    results.append(validate_database_config())
    
    # Check file permissions
    results.append(check_file_permissions())
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Validation Summary")
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print("🎉 All validations passed!")
        print("Your configuration is ready for use.")
        return 0
    else:
        print(f"⚠️  {passed}/{total} validations passed")
        print("Please fix the issues above before proceeding.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
