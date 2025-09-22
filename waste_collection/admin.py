from django.contrib import admin
from .models import (
    WasteCategory,
    CollectionPoint,
    WasteReport,
    CreditTransaction,
    CollectionEvent,
    EventParticipation,
)


@admin.register(WasteCategory)
class WasteCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'credit_rate', 'is_active']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['id']


@admin.register(CollectionPoint)
class CollectionPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'point_type', 'is_active']
    list_filter = ['point_type', 'is_active']
    search_fields = ['name', 'description', 'address']
    readonly_fields = ['id']


@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'reporter', 'category', 'status']
    list_filter = ['status', 'category']
    search_fields = ['description']
    readonly_fields = ['id']


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'transaction_type', 'amount']
    list_filter = ['transaction_type']
    readonly_fields = ['id']


@admin.register(CollectionEvent)
class CollectionEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'status', 'event_type']
    list_filter = ['status', 'event_type']
    search_fields = ['title', 'description']
    readonly_fields = ['id']


@admin.register(EventParticipation)
class EventParticipationAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'attended']
    list_filter = ['attended']
    readonly_fields = ['id']
