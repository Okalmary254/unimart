from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    # Auth
    path('auth/register/', api_views.RegisterView.as_view()),
    path('auth/login/', api_views.LoginView.as_view()),
    path('auth/logout/', api_views.LogoutView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/me/', api_views.MeView.as_view()),

    # Products
    path('products/', api_views.ProductListView.as_view()),
    path('products/<int:pk>/', api_views.ProductDetailView.as_view()),

    # Categories
    path('categories/', api_views.CategoryListView.as_view()),

    # Cart
    path('cart/', api_views.CartView.as_view()),

    # Checkout
    path('checkout/', api_views.CheckoutView.as_view()),

    # Orders
    path('orders/', api_views.OrderListView.as_view()),
    path('orders/<int:pk>/', api_views.OrderDetailView.as_view()),

    # Wishlist
    path('wishlist/', api_views.WishlistView.as_view()),

    # Addresses
    path('addresses/', api_views.AddressListCreateView.as_view()),
    path('addresses/<int:pk>/', api_views.AddressDetailView.as_view()),

    # Contact
    path('contact/', api_views.ContactView.as_view()),

    # Site settings
    path('settings/', api_views.SiteSettingsView.as_view()),
]