"""
URL configuration for gamification app
"""
from django.urls import path
from . import views

app_name = 'gamification'

urlpatterns = [
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:user__username>/', views.UserProfileDetailView.as_view(), name='user-profile-detail'),
    
    # Badges
    path('badges/', views.BadgeListView.as_view(), name='badge-list'),
    path('badges/earned/', views.UserBadgesView.as_view(), name='user-badges'),
    path('badges/by-category/', views.user_badges_by_category, name='user-badges-by-category'),
    path('badges/available/', views.available_badges, name='available-badges'),
    
    # Points
    path('points/transactions/', views.PointTransactionListView.as_view(), name='point-transactions'),
    
    # Leaderboards
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('ranking/', views.user_ranking, name='user-ranking'),
    path('achievements/', views.achievements_summary, name='achievements-summary'),
    
    # Challenges
    path('challenges/', views.ChallengeListView.as_view(), name='challenge-list'),
    path('challenges/<uuid:pk>/', views.ChallengeDetailView.as_view(), name='challenge-detail'),
    path('challenges/join/', views.join_challenge, name='join-challenge'),
    path('challenges/my/', views.UserChallengesView.as_view(), name='user-challenges'),
    
    # Admin
    path('admin/award-points/', views.award_points, name='award-points'),
    path('admin/update-leaderboards/', views.update_leaderboards, name='update-leaderboards'),
    
    # Statistics
    path('stats/', views.gamification_stats, name='gamification-stats'),
]
