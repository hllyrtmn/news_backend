from django.urls import path
from .views import dashboard_stats, admin_dashboard

urlpatterns = [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('admin-dashboard/', admin_dashboard, name='admin-dashboard'),
]
