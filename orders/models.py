from django.db import models
from django.conf import settings
from store.models import Product

# If orders app has its own OrderItem, either:
# Option 1: Remove it (if store handles orders)
# Option 2: Give it a different related_name

class Order(models.Model):
    # Your order model here
    pass

# If you have OrderItem here, make sure related_name is different:
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items_orders')  # Different related_name
    
# M-Pesa specific fields
mpesa_checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
mpesa_merchant_request_id = models.CharField(max_length=100, blank=True, null=True)
mpesa_phone_number = models.CharField(max_length=15, blank=True, null=True)    