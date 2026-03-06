from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from store.models import Product
from orders.models import Order

def is_admin(user):
    return user.role in ['admin', 'store_manager']

@user_passes_test(is_admin)
def dashboard_home(request):
    products = Product.objects.count()
    orders = Order.objects.count()
    revenue = sum(order.total_price() for order in Order.objects.filter(is_paid=True))

    context = {
        "products": products,
        "orders": orders,
        "revenue": revenue,
    }
    return render(request, "dashboard/home.html", context)
