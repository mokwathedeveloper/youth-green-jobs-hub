# Scripts Directory

This directory contains utility scripts for the Youth Green Jobs Hub platform.

## Available Scripts

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
