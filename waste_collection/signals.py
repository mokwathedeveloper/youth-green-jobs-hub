from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .simple_models import CreditTransaction, User, EventParticipation, CollectionEvent
from django.db import models, transaction

@receiver(post_save, sender=CreditTransaction)
def update_user_credit_balance(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=instance.user.pk)
            if instance.transaction_type == 'earned':
                user.credits += instance.amount
            elif instance.transaction_type == 'redeemed':
                user.credits -= instance.amount
            user.save()

@receiver([post_save, post_delete], sender=EventParticipation)
def update_total_waste_collected(sender, instance, **kwargs):
    event = instance.event
    total_waste = EventParticipation.objects.filter(event=event).aggregate(models.Sum('waste_collected'))['waste_collected__sum'] or 0
    event.total_waste_collected = total_waste
    event.save()
