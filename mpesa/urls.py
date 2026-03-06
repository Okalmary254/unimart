from django.urls import path
from . import views

app_name = 'mpesa'

urlpatterns = [
    path('initiate/', views.initiate_mpesa_payment, name='initiate_payment'),  # Changed name
    path('callback/', views.mpesa_callback, name='callback'),  # Changed name
    path('status/<str:checkout_request_id>/', views.check_payment_status, name='check_status'),  # Changed name
    path('payment/', views.mpesa_payment_page, name='payment_page'),  # Changed name
]