from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.shortcuts import get_object_or_404
from django.utils import timezone
from youth_green_jobs_backend.config import get_youth_age_range

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
    UserListSerializer,
    EmailVerificationSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    API view for user registration
    Creates new user accounts with comprehensive validation
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create new user and return success message"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': _('Registration successful! Welcome to Youth Green Jobs Hub.'),
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view
    Supports login with username or email
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating user profile
    Allows users to view and edit their own profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the current user's profile"""
        return self.request.user

    def get_serializer_class(self):
        """Use different serializer for updates"""
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def update(self, request, *args, **kwargs):
        """Update user profile and mark completion timestamp"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Mark profile completion timestamp if not already set
        if not instance.profile_completed_at and instance.profile_completion_percentage >= 80:
            instance.profile_completed_at = timezone.now()

        self.perform_update(serializer)

        # Return full profile data
        return Response(
            UserProfileSerializer(instance).data,
            status=status.HTTP_200_OK
        )


class ChangePasswordView(generics.UpdateAPIView):
    """
    API view for changing user password
    Requires current password and validates new password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the current user"""
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Change user password"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('Password changed successfully.')
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API view for user logout
    Blacklists the refresh token to prevent reuse
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Logout user by blacklisting refresh token"""
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('Successfully logged out.')
        }, status=status.HTTP_200_OK)


from dateutil.relativedelta import relativedelta

class UserListView(generics.ListAPIView):
    """
    API view for listing users
    Provides public user listings with minimal information
    """
    queryset = User.objects.filter(is_active=True).order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Filter users based on query parameters"""
        queryset = super().get_queryset()

        # Filter by county
        county = self.request.query_params.get('county')
        if county:
            queryset = queryset.filter(county__icontains=county)

        # Filter by employment status
        employment_status = self.request.query_params.get('employment_status')
        if employment_status:
            queryset = queryset.filter(employment_status=employment_status)

        # Filter by education level
        education_level = self.request.query_params.get('education_level')
        if education_level:
            queryset = queryset.filter(education_level=education_level)

        # Filter by youth status
        youth_only = self.request.query_params.get('youth_only')
        if youth_only and youth_only.lower() == 'true':
            # Filter by configurable youth age range
            from datetime import date
            today = date.today()
            min_age, max_age = get_youth_age_range()
            min_birth_date = today - relativedelta(years=max_age)
            max_birth_date = today - relativedelta(years=min_age)
            queryset = queryset.filter(
                date_of_birth__gte=min_birth_date,
                date_of_birth__lte=max_birth_date
            )

        return queryset


class UserDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving specific user details
    Provides public user profile information
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'

    def get_serializer_context(self):
        """Add request context to serializer"""
        context = super().get_serializer_context()
        context['public_view'] = True
        return context


class PasswordResetRequestView(APIView):
    """
    API view for password reset request
    Sends password reset email to user
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Request password reset"""
        serializer = PasswordResetFormSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('If an account with this email exists, you will receive password reset instructions.')
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    API view for password reset confirmation
    Resets password using valid token
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Confirm password reset with token"""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('Password reset successful. You can now login with your new password.')
        }, status=status.HTTP_200_OK)


class EmailVerificationView(APIView):
    """
    API view for email verification
    Verifies user email using verification token
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Verify email with token"""
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('Email verified successfully.')
        }, status=status.HTTP_200_OK)


class ResendEmailVerificationView(APIView):
    """
    API view for resending email verification
    Sends new verification email to user
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Resend email verification"""
        user = request.user

        if user.is_verified:
            return Response({
                'message': _('Your email is already verified.')
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = PasswordResetFormSerializer(data={'email': user.email}, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': _('Verification email sent. Please check your inbox.')
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_view(request):
    """
    API view for user statistics
    Returns platform statistics for the current user
    """
    user = request.user

    # Calculate user-specific statistics
    stats = {
        'profile_completion': user.profile_completion_percentage,
        'is_youth_eligible': user.is_youth,
        'account_age_days': (timezone.now().date() - user.date_joined.date()).days,
        'verification_status': user.is_verified,
        'county': user.county,
        'employment_status': user.employment_status,
    }

    # Add platform-wide statistics
    total_users = User.objects.filter(is_active=True).count()
    youth_users = User.objects.filter(is_active=True).exclude(date_of_birth__isnull=True)

    # Calculate youth count using configurable age range
    from datetime import date
    from dateutil.relativedelta import relativedelta
    today = date.today()
    min_age, max_age = get_youth_age_range()
    min_birth_date = today - relativedelta(years=max_age)
    max_birth_date = today - relativedelta(years=min_age)

    youth_count = youth_users.filter(
        date_of_birth__gte=min_birth_date,
        date_of_birth__lte=max_birth_date
    ).count()

    stats.update({
        'platform_stats': {
            'total_users': total_users,
            'youth_users': youth_count,
            'users_in_county': User.objects.filter(
                is_active=True,
                county=user.county
            ).count() if user.county else 0,
        }
    })

    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def deactivate_account_view(request):
    """
    API view for account deactivation
    Allows users to deactivate their own accounts
    """
    user = request.user

    # Confirm deactivation with password
    password = request.data.get('password')
    if not password or not user.check_password(password):
        return Response({
            'error': _('Password confirmation required for account deactivation.')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Deactivate account
    user.is_active = False
    user.save()

    # Blacklist the refresh token
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            RefreshToken(refresh_token).blacklist()
        except Exception as e:
            # Log the error, but don't prevent deactivation
            print(e)

    return Response({
        'message': _('Account deactivated successfully. We\'re sorry to see you go!')
    }, status=status.HTTP_200_OK)
