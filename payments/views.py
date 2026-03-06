from django.shortcuts import render, redirect
from .models import Payment
from orders.models import Order

def pay_order(request, order_id):
    order = Order.objects.get(id=order_id)

    # Simulated payment
    Payment.objects.create(
        order=order,
        transaction_id="TXN123456",
        amount=order.total_price(),
        status="Completed"
    )

    order.is_paid = True
    order.save()

    return redirect("my_orders")
