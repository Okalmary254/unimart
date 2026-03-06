from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Order, OrderItem
from store.models import Product

@login_required
def create_order(request, product_id):
    product = Product.objects.get(id=product_id)
    order = Order.objects.create(user=request.user)
    OrderItem.objects.create(order=order, product=product, quantity=1)
    return redirect("my_orders")

@login_required
def my_orders(request):
    orders = Order.objects.filter(user=request.user)
    return render(request, "orders/my_orders.html", {"orders": orders})
