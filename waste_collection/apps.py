from django.apps import AppConfig


class WasteCollectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'waste_collection'

    def ready(self):
        import waste_collection.signals
