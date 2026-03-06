from django.urls import path
from . import views

urlpatterns = [
    path('my-orders/', views.my_orders, name='my_orders'),
    path('create/<int:product_id>/', views.create_order, name='create_order'),
]
