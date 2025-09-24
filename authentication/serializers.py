from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Handles creation of new user accounts with validation
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    user_type = serializers.ChoiceField(
        choices=[('youth', 'Youth'), ('sme', 'SME'), ('admin', 'Admin')],
        default='youth',
        required=False
    )

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'gender', 'county', 'sub_county',
            'education_level', 'employment_status', 'preferred_language',
            'user_type', 'is_staff', 'is_superuser'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation and age requirements"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": _("Password fields didn't match.")
            })
        
        # Validate age for youth eligibility (if date_of_birth provided)
        if attrs.get('date_of_birth'):
            from datetime import date
            today = date.today()
            age = today.year - attrs['date_of_birth'].year - (
                (today.month, today.day) < (attrs['date_of_birth'].month, attrs['date_of_birth'].day)
            )
            if age < 16:
                raise serializers.ValidationError({
                    "date_of_birth": _("You must be at least 16 years old to register.")
                })
            if age > 50:
                raise serializers.ValidationError({
                    "date_of_birth": _("This platform is primarily for youth (18-35). Please contact support if you need assistance.")
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with validated data using raw SQL to handle user_type"""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        user_type = validated_data.pop('user_type', 'youth')

        # Check if this should be a superuser
        is_superuser = validated_data.pop('is_superuser', False)
        is_staff = validated_data.pop('is_staff', False)

        # Hash the password
        from django.contrib.auth.hashers import make_password
        hashed_password = make_password(password)

        # Create user with raw SQL to include user_type
        from django.db import connection
        from django.utils import timezone

        cursor = connection.cursor()

        # Prepare default values
        now = timezone.now()
        defaults = {
            'username': validated_data.get('username', ''),
            'first_name': validated_data.get('first_name', ''),
            'last_name': validated_data.get('last_name', ''),
            'email': validated_data.get('email', ''),
            'phone_number': validated_data.get('phone_number'),
            'date_of_birth': validated_data.get('date_of_birth'),
            'gender': validated_data.get('gender'),
            'county': validated_data.get('county', 'Kisumu'),
            'sub_county': validated_data.get('sub_county'),
            'address': validated_data.get('address'),
            'education_level': validated_data.get('education_level'),
            'skills': validated_data.get('skills'),
            'interests': validated_data.get('interests'),
            'employment_status': validated_data.get('employment_status', 'seeking_work'),
            'profile_picture': validated_data.get('profile_picture', ''),
            'bio': validated_data.get('bio'),
            'preferred_language': validated_data.get('preferred_language', 'en'),
            'receive_sms_notifications': validated_data.get('receive_sms_notifications', True),
            'receive_email_notifications': validated_data.get('receive_email_notifications', True),
            'profile_completed_at': validated_data.get('profile_completed_at'),
            'verification_document': validated_data.get('verification_document', ''),
        }

        # Insert user with all required fields including user_type
        cursor.execute("""
            INSERT INTO authentication_user
            (password, username, first_name, last_name, email, is_active, is_staff, is_superuser,
             date_joined, last_activity, phone_number, date_of_birth, gender, county, sub_county,
             address, education_level, skills, interests, employment_status, profile_picture, bio,
             is_verified, verification_document, preferred_language, receive_sms_notifications,
             receive_email_notifications, profile_completed_at, user_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, [
            hashed_password, defaults['username'], defaults['first_name'], defaults['last_name'],
            defaults['email'], True, is_staff, is_superuser, now, now,
            defaults['phone_number'], defaults['date_of_birth'], defaults['gender'],
            defaults['county'], defaults['sub_county'], defaults['address'],
            defaults['education_level'], defaults['skills'], defaults['interests'],
            defaults['employment_status'], defaults['profile_picture'], defaults['bio'],
            False, defaults['verification_document'], defaults['preferred_language'],
            defaults['receive_sms_notifications'], defaults['receive_email_notifications'],
            defaults['profile_completed_at'], user_type
        ])

        user_id = cursor.fetchone()[0]
        user = User.objects.get(id=user_id)

        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    Supports login with username/email and password
    """
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Authenticate user with username/email and password"""
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')
        
        if username_or_email and password:
            # Try to authenticate with username first
            user = authenticate(username=username_or_email, password=password)
            
            # If username auth fails, try with email
            if not user:
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError({
                    'non_field_errors': [_('Invalid credentials. Please check your username/email and password.')]
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    'non_field_errors': [_('User account is disabled.')]
                })
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError({
                'non_field_errors': [_('Must include username/email and password.')]
            })


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    Used for retrieving and updating user profiles
    """
    age = serializers.ReadOnlyField()
    is_youth = serializers.ReadOnlyField()
    profile_completion_percentage = serializers.ReadOnlyField()
    skills_list = serializers.ReadOnlyField(source='get_skills_list')
    interests_list = serializers.ReadOnlyField(source='get_interests_list')
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'age', 'gender', 'bio',
            'county', 'sub_county', 'address', 'education_level',
            'skills', 'skills_list', 'interests', 'interests_list',
            'employment_status', 'profile_picture', 'is_verified',
            'preferred_language', 'receive_sms_notifications',
            'receive_email_notifications', 'is_youth', 'is_staff', 'is_superuser',
            'profile_completion_percentage', 'date_joined', 'last_activity'
        )
        read_only_fields = (
            'id', 'username', 'is_verified', 'is_staff', 'is_superuser', 'date_joined', 'last_activity'
        )
    
    def validate_email(self, value):
        """Validate email uniqueness (excluding current user)"""
        user = self.instance
        if user and User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists."))
        return value


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    Allows partial updates of profile information
    """
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'gender', 'bio', 'county', 'sub_county', 'address',
            'education_level', 'skills', 'interests', 'employment_status',
            'profile_picture', 'preferred_language',
            'receive_sms_notifications', 'receive_email_notifications'
        )
    
    def validate_date_of_birth(self, value):
        """Validate date of birth for reasonable age range"""
        if value:
            from datetime import date
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            
            if age < 16:
                raise serializers.ValidationError(_("You must be at least 16 years old."))
            if age > 100:
                raise serializers.ValidationError(_("Please enter a valid date of birth."))
        
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password
    Requires current password and validates new password
    """
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Current password is incorrect."))
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": _("New password fields didn't match.")
            })
        return attrs
    
    def save(self, **kwargs):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    Accepts email and initiates password reset process
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that email exists in the system"""
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError(_("No active user found with this email address."))
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    Handles password reset with token validation
    """
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": _("Password fields didn't match.")
            })
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for user list view
    Provides minimal user information for public listings
    """
    age = serializers.ReadOnlyField()
    is_youth = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name',
            'county', 'age', 'is_youth', 'education_level',
            'employment_status', 'profile_picture', 'date_joined'
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer
    Adds user profile information to token response
    Supports both username and username_or_email fields for compatibility
    """
    username_or_email = serializers.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Keep both username and username_or_email fields for compatibility
        self.fields['username'].required = False

    def validate(self, attrs):
        """Custom validation to support email or username login"""
        # Support both username and username_or_email fields for compatibility
        username_or_email = attrs.get('username_or_email') or attrs.get('username')
        password = attrs.get('password')

        if not username_or_email:
            raise serializers.ValidationError('Username or email is required.')
        if not password:
            raise serializers.ValidationError('Password is required.')

        # Try to find user by username or email
        user = None
        if '@' in username_or_email:
            # Looks like an email
            try:
                user = User.objects.get(email=username_or_email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError('No user found with this email.')
        else:
            # Treat as username
            attrs['username'] = username_or_email

        # Remove our custom field before calling parent validation
        attrs.pop('username_or_email', None)

        # Call parent validation
        data = super().validate(attrs)

        # Add user profile information to response
        user = self.user
        data.update({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_youth': user.is_youth,
                'profile_completion_percentage': user.profile_completion_percentage,
                'county': user.county,
                'employment_status': user.employment_status,
            }
        })

        return data


class TokenRefreshResponseSerializer(serializers.Serializer):
    """
    Serializer for token refresh response
    Documents the response format for API documentation
    """
    access = serializers.CharField()
    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for user logout
    Handles refresh token blacklisting
    """
    refresh = serializers.CharField()

    def validate(self, attrs):
        """Validate and blacklist refresh token"""
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        """Blacklist the refresh token"""
        try:
            RefreshToken(self.token).blacklist()
        except Exception as e:
            raise serializers.ValidationError({'refresh': _('Invalid token.')})


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification
    Handles email verification token validation
    """
    token = serializers.CharField()

    def validate_token(self, value):
        """Validate email verification token"""
        # This would integrate with your email verification system
        # For now, we'll just validate that it's not empty
        if not value:
            raise serializers.ValidationError(_("Token is required."))
        return value
