from django.urls import path
from . import views

urlpatterns = [
    path('pay/<int:order_id>/', views.pay_order, name='pay_order'),
]
