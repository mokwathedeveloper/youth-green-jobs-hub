from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin for Youth Green Jobs Hub
    Extends Django's UserAdmin with youth-specific fields
    """

    # Fields to display in the user list
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'age', 'is_youth', 'county', 'employment_status',
        'is_verified', 'profile_completion_percentage',
        'is_staff', 'is_active', 'date_joined'
    )

    # Fields to filter by in the admin sidebar
    list_filter = (
        'is_staff', 'is_superuser', 'is_active', 'is_verified',
        'gender', 'county', 'education_level', 'employment_status',
        'preferred_language', 'date_joined', 'last_login'
    )

    # Fields to search by
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')

    # Default ordering
    ordering = ('-date_joined',)

    # Fields that are read-only
    readonly_fields = ('age', 'is_youth', 'profile_completion_percentage', 'last_activity')

    # Fieldsets for the user detail/edit page
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Personal info'), {
            'fields': (
                'first_name', 'last_name', 'email', 'phone_number',
                'date_of_birth', 'age', 'gender', 'bio', 'profile_picture'
            )
        }),
        (_('Location'), {
            'fields': ('county', 'sub_county', 'address')
        }),
        (_('Education & Skills'), {
            'fields': ('education_level', 'skills', 'interests', 'employment_status')
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verification_document')
        }),
        (_('Preferences'), {
            'fields': (
                'preferred_language', 'receive_sms_notifications',
                'receive_email_notifications'
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
        }),
        (_('Important dates'), {
            'fields': (
                'last_login', 'date_joined', 'profile_completed_at',
                'last_activity'
            )
        }),
        (_('Profile Stats'), {
            'fields': ('is_youth', 'profile_completion_percentage'),
            'classes': ('collapse',)
        }),
    )

    # Fields for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name', 'last_name',
                'password1', 'password2', 'phone_number',
                'county', 'employment_status'
            ),
        }),
    )

    def age(self, obj):
        """Display age in admin list"""
        return obj.age
    age.short_description = _('Age')

    def is_youth(self, obj):
        """Display youth status in admin list"""
        return obj.is_youth
    is_youth.boolean = True
    is_youth.short_description = _('Youth (18-35)')

    def profile_completion_percentage(self, obj):
        """Display profile completion percentage"""
        return f"{obj.profile_completion_percentage}%"
    profile_completion_percentage.short_description = _('Profile Complete')
