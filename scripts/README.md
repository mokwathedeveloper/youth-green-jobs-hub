# Scripts Directory

This directory contains utility scripts for the Youth Green Jobs Hub platform, organized by category for better maintainability.

## 📁 Directory Structure

```
scripts/
├── README.md                    # This file
├── validate_config.py          # Configuration validation utility
├── deployment/                 # Deployment and production scripts
│   ├── build.sh               # Build script for production
│   ├── configure_apis.sh      # API configuration setup
│   ├── deploy_production.sh   # Production deployment script
│   ├── deploy_to_heroku.sh    # Heroku deployment script
│   ├── deploy_to_render.sh    # Render deployment script
│   ├── optimize_render_deployment.py  # Render optimization
│   ├── fix_render_database.py # Database fixes for Render
│   └── populate_production_data.py    # Production data seeding
└── testing/                   # Testing and integration scripts
    ├── test_email.py          # Email functionality testing
    ├── test_integration.py    # Integration testing
    ├── test-integration.sh    # Integration test runner
    ├── test-integration.js    # Frontend integration tests
    ├── test_mpesa.py          # M-Pesa payment testing
    ├── test_paystack.py       # Paystack payment testing
    ├── test_render_deployment.py      # Render deployment testing
    └── test_render_final.py   # Final Render deployment validation
```

## 🔧 Configuration Scripts

### validate_config.py

A comprehensive configuration validation script that checks:

- Backend Django configuration
- Frontend environment setup
- Database connectivity
- File permissions
- Configuration consistency

**Usage:**
```bash
# From project root
python scripts/validate_config.py

# Or make it executable and run directly
chmod +x scripts/validate_config.py
./scripts/validate_config.py
```

**What it checks:**
- ✅ Django settings validation
- ✅ Environment variables
- ✅ Database connection
- ✅ File upload directories
- ✅ Frontend configuration
- ✅ Required dependencies

## 🚀 Deployment Scripts (`deployment/`)

### Core Deployment Scripts

- **`build.sh`** - Production build script for the entire application
- **`deploy_production.sh`** - Main production deployment orchestrator
- **`configure_apis.sh`** - Sets up API configurations and environment variables

### Platform-Specific Deployment

- **`deploy_to_heroku.sh`** - Automated Heroku deployment with configuration
- **`deploy_to_render.sh`** - Automated Render deployment with optimization
- **`optimize_render_deployment.py`** - Render-specific performance optimizations
- **`fix_render_database.py`** - Database migration and fixes for Render platform

### Data Management

- **`populate_production_data.py`** - Seeds production database with initial data for Kisumu

**Usage Examples:**
```bash
# Full production deployment
./scripts/deployment/deploy_production.sh

# Deploy to specific platform
./scripts/deployment/deploy_to_render.sh
./scripts/deployment/deploy_to_heroku.sh

# Setup production data
python scripts/deployment/populate_production_data.py
```

## 🧪 Testing Scripts (`testing/`)

### Integration Testing

- **`test_integration.py`** - Python-based integration tests
- **`test-integration.js`** - JavaScript/Node.js integration tests
- **`test-integration.sh`** - Shell script to run all integration tests

### Payment Gateway Testing

- **`test_mpesa.py`** - M-Pesa payment integration testing
- **`test_paystack.py`** - Paystack payment integration testing

### Platform Testing

- **`test_render_deployment.py`** - Render deployment validation
- **`test_render_final.py`** - Final Render deployment verification

### Communication Testing

- **`test_email.py`** - Email functionality and SMTP testing

**Usage Examples:**
```bash
# Run all integration tests
./scripts/testing/test-integration.sh

# Test specific payment gateway
python scripts/testing/test_mpesa.py
python scripts/testing/test_paystack.py

# Test deployment
python scripts/testing/test_render_deployment.py
```

## 📝 Script Development Guidelines

When adding new scripts:

1. **Choose the right directory** - Place in `deployment/`, `testing/`, or root based on purpose
2. **Make scripts executable** - Use `chmod +x script_name.sh` for shell scripts
3. **Add documentation** - Update this README with script description and usage
4. **Use consistent naming** - Follow existing naming conventions
5. **Include error handling** - Scripts should fail gracefully with helpful messages
6. **Test thoroughly** - Validate scripts in development before production use

## 🔍 Troubleshooting

### Common Issues

1. **Permission denied** - Make scripts executable: `chmod +x script_name.sh`
2. **Python path issues** - Run from project root or set PYTHONPATH
3. **Environment variables** - Ensure all required env vars are set
4. **Database connection** - Verify database is accessible and credentials are correct

### Getting Help

1. Check script documentation and comments
2. Run `python script_name.py --help` if available
3. Review logs in `logs/` directory
4. Contact the development team for script-specific issues

**Example output:**
```
🚀 Youth Green Jobs Hub - Configuration Validator
==================================================
🔧 Validating Backend Configuration...
✅ Django configuration check passed
✅ Custom configuration validation passed
✅ Backend .env file found

🎨 Validating Frontend Configuration...
✅ Frontend environment file found: .env.local
✅ Frontend package.json found
✅ Required dependencies found
✅ Frontend configuration module found

🗄️  Validating Database Configuration...
✅ Database connection successful
✅ All migrations applied

📁 Checking File Permissions...
✅ Media directory writable: /path/to/media
✅ Static directory writable: /path/to/static

==================================================
📊 Validation Summary
🎉 All validations passed!
Your configuration is ready for use.
```

## Adding New Scripts

When adding new scripts to this directory:

1. **Make them executable**: `chmod +x script_name.py`
2. **Add proper shebang**: `#!/usr/bin/env python`
3. **Include documentation**: Add description to this README
4. **Follow naming convention**: Use snake_case for script names
5. **Add error handling**: Scripts should handle errors gracefully
6. **Return appropriate exit codes**: 0 for success, non-zero for failure

## Script Guidelines

- **Use absolute imports** when importing from the project
- **Set up Django properly** if using Django models/settings
- **Provide helpful output** with emojis and clear messages
- **Include validation** for required dependencies
- **Handle missing files gracefully**
- **Provide usage instructions** in docstrings
