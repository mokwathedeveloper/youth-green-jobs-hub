from django.contrib import admin
from django.utils.html import format_html
from .models import (
    WasteCategory,
    CollectionPoint,
    WasteReport,
    CreditTransaction,
    CollectionEvent,
    EventParticipation
)


@admin.register(WasteCategory)
class WasteCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'credit_rate_per_kg', 'co2_reduction_per_kg', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['name']


@admin.register(CollectionPoint)
class CollectionPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'point_type', 'county', 'sub_county', 'is_active', 'created_at']
    list_filter = ['point_type', 'county', 'is_active', 'created_at']
    search_fields = ['name', 'address', 'county', 'sub_county']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['accepted_categories']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'point_type', 'address', 'county', 'sub_county')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email', 'operating_hours')
        }),
        ('Configuration', {
            'fields': ('accepted_categories', 'is_active')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'reporter', 'category', 'status', 'priority',
        'estimated_weight_kg', 'actual_weight_kg', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'category', 'county', 'created_at',
        'verified_at', 'collected_at'
    ]
    search_fields = ['title', 'description', 'reporter__username', 'reporter__email']
    readonly_fields = [
        'id', 'estimated_credits', 'actual_credits',
        'estimated_co2_reduction', 'actual_co2_reduction',
        'created_at', 'updated_at'
    ]
    autocomplete_fields = ['reporter', 'category', 'collection_point', 'verified_by', 'collected_by']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Report Information', {
            'fields': ('title', 'description', 'reporter', 'category', 'status', 'priority')
        }),
        ('Weight and Credits', {
            'fields': (
                'estimated_weight_kg', 'estimated_credits', 'estimated_co2_reduction',
                'actual_weight_kg', 'actual_credits', 'actual_co2_reduction'
            )
        }),
        ('Location', {
            'fields': ('location_description', 'county', 'sub_county', 'latitude', 'longitude', 'photo')
        }),
        ('Processing', {
            'fields': (
                'collection_point', 'verified_by', 'verified_at',
                'collected_by', 'collected_at', 'notes'
            )
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'reporter', 'category', 'collection_point', 'verified_by', 'collected_by'
        )


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'transaction_type', 'amount', 'description',
        'waste_report', 'created_at'
    ]
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'user__email', 'description', 'reference_id']
    readonly_fields = ['id', 'created_at']
    autocomplete_fields = ['user', 'waste_report', 'processed_by']
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'waste_report', 'processed_by'
        )


class EventParticipationInline(admin.TabularInline):
    model = EventParticipation
    extra = 0
    readonly_fields = ['joined_at']
    autocomplete_fields = ['user']


@admin.register(CollectionEvent)
class CollectionEventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'event_type', 'organizer', 'start_date', 'end_date',
        'status', 'participant_count', 'total_weight_collected'
    ]
    list_filter = ['event_type', 'status', 'county', 'start_date']
    search_fields = ['title', 'description', 'organizer__username']
    readonly_fields = [
        'id', 'participant_count', 'is_active',
        'created_at', 'updated_at'
    ]
    autocomplete_fields = ['organizer']
    filter_horizontal = ['target_categories']
    date_hierarchy = 'start_date'
    inlines = [EventParticipationInline]

    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'description', 'event_type', 'organizer', 'status')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Location', {
            'fields': ('location', 'county', 'sub_county')
        }),
        ('Configuration', {
            'fields': ('max_participants', 'target_categories', 'bonus_multiplier')
        }),
        ('Results', {
            'fields': ('total_weight_collected', 'total_credits_awarded', 'participant_count')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('organizer')


@admin.register(EventParticipation)
class EventParticipationAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'event', 'joined_at', 'weight_collected', 'credits_earned'
    ]
    list_filter = ['joined_at', 'event__event_type']
    search_fields = ['user__username', 'event__title']
    readonly_fields = ['id', 'joined_at']
    autocomplete_fields = ['user', 'event']
    date_hierarchy = 'joined_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'event')
