from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Apps with their own URL configs
    path('', include('store.urls')),  # Store URLs at root level
    path('accounts/', include('accounts.urls')),
    path('orders/', include('orders.urls')),
    path('payments/', include('payments.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('mpesa/', include('mpesa.urls')),
    
    # Social authentication
    path('social-auth/', include('social_django.urls', namespace='social')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)