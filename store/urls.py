# from django.urls import path, include, reverse_lazy
# from django.contrib.auth import views as auth_views
# from . import views
# from django.views.generic.base import RedirectView

# app_name = 'store'

# urlpatterns = [
#     # Public pages
#     path('', views.home, name='home'),
#     path('products/', views.products, name='products'),
#     path('categories/', views.categories, name='categories'),
#     path('category/<str:category_name>/', views.category_detail, name='category_detail'),
#     path('product/<int:pk>/', views.product_detail, name='product_detail'),
#     path('deals/', views.deals, name='deals'),
#     path('about/', views.about, name='about'),
#     path('contact/', views.contact, name='contact'),
#     path('faq/', views.faq, name='faq'),
#     path('shipping/', views.shipping, name='shipping'),
#     path('returns/', views.returns, name='returns'),
#     path('terms/', views.terms, name='terms'),
    
#     # Cart
#     path('cart/', views.cart, name='cart'),
#     path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
#     path('remove-cart-item/', views.remove_cart_item, name='remove_cart_item'),
#     path('update-cart/', views.update_cart, name='update_cart'),
#     path('checkout/', views.checkout, name='checkout'),
    
#     # Authentication
#     path('account/', views.account, name='account'),
#     path('logout/', auth_views.LogoutView.as_view(), name='logout'),
#     path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
#     path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
#     path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
#     path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    
#     # Social auth
#     path('social-auth/', include('social_django.urls', namespace='social')),
    
#     # User profile
#     path('update-profile/', views.update_profile, name='update_profile'),
#     path('change-password/', views.change_password, name='change_password'),
#     path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
#     path('update-settings/', views.update_settings, name='update_settings'),
#     path('delete-account/', views.delete_account, name='delete_account'),
    
#     # Wishlist
#     path('add-to-wishlist/', views.add_to_wishlist, name='add_to_wishlist'),
#     path('remove-from-wishlist/<int:item_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
#     # Addresses
#     path('add-address/', views.add_address, name='add_address'),
#     path('edit-address/<int:address_id>/', views.edit_address, name='edit_address'),
#     path('delete-address/<int:address_id>/', views.delete_address, name='delete_address'),
    
#     # Orders
#     path('order/<int:order_id>/', views.order_detail, name='order_detail'),

#     # Temporary redirect for login
#     path('login/', RedirectView.as_view(url=reverse_lazy('accounts:login')), name='login'),

#     # ========== CUSTOM ADMIN DASHBOARD ==========
#     # Admin Dashboard URLs (accessible at /store/admin/)
#     path('store/admin/', views.admin_dashboard, name='admin_dashboard'),
    
#     # User Management
#     path('admin/users/', views.admin_users, name='admin_users'),
#     path('admin/users/add/', views.admin_user_add, name='admin_user_add'),
#     path('admin/users/edit/<int:user_id>/', views.admin_user_edit, name='admin_user_edit'),
#     path('admin/users/delete/<int:user_id>/', views.admin_user_delete, name='admin_user_delete'),
#     path('admin/users/toggle/<int:user_id>/', views.admin_user_toggle_status, name='admin_user_toggle_status'),
    
#     # Product Management
#     path('store/admin/products/', views.admin_products, name='admin_products'),
#     path('store/admin/products/add/', views.admin_product_add, name='admin_product_add'),
#     path('store/admin/products/edit/<int:product_id>/', views.admin_product_edit, name='admin_product_edit'),
#     path('store/admin/products/delete/<int:product_id>/', views.admin_product_delete, name='admin_product_delete'),
#     path('store/admin/products/bulk-action/', views.admin_product_bulk_action, name='admin_product_bulk_action'),
    
#     # Category Management
#     path('store/admin/categories/', views.admin_categories, name='admin_categories'),
#     path('store/admin/categories/add/', views.admin_category_add, name='admin_category_add'),
#     path('store/admin/categories/edit/<int:category_id>/', views.admin_category_edit, name='admin_category_edit'),
#     path('store/admin/categories/delete/<int:category_id>/', views.admin_category_delete, name='admin_category_delete'),
    
#     # Order Management
#     path('store/admin/orders/', views.admin_orders, name='admin_orders'),
#     path('store/admin/orders/<int:order_id>/', views.admin_order_detail, name='admin_order_detail'),
#     path('store/admin/orders/<int:order_id>/update-status/', views.admin_order_update_status, name='admin_order_update_status'),
    
#     # Deals Management
#     path('store/admin/deals/', views.admin_deals, name='admin_deals'),
#     path('store/admin/deals/add/', views.admin_deals_add, name='admin_deals_add'),
#     path('store/admin/deals/remove/<int:product_id>/', views.admin_deals_remove, name='admin_deals_remove'),
    
#     # Messages Management
#     path('store/admin/messages/', views.admin_messages, name='admin_messages'),
#     path('store/admin/messages/<int:message_id>/', views.admin_message_detail, name='admin_message_detail'),
#     path('store/admin/messages/delete/<int:message_id>/', views.admin_message_delete, name='admin_message_delete'),
    
#     # Settings
#     path('store/admin/settings/', views.admin_settings, name='admin_settings'),
    
#     # Reports
#     path('store/admin/reports/', views.admin_reports, name='admin_reports'),
# ]

from django.urls import path, include, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views
from django.views.generic.base import RedirectView

app_name = 'store'

urlpatterns = [
    # Public pages
    path('', views.home, name='home'),
    path('products/', views.products, name='products'),
    path('categories/', views.categories, name='categories'),
    path('category/<str:category_name>/', views.category_detail, name='category_detail'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    path('deals/', views.deals, name='deals'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('faq/', views.faq, name='faq'),
    path('shipping/', views.shipping, name='shipping'),
    path('returns/', views.returns, name='returns'),
    path('terms/', views.terms, name='terms'),
    
    # Cart
    path('cart/', views.cart, name='cart'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('remove-cart-item/', views.remove_cart_item, name='remove_cart_item'),
    path('update-cart/', views.update_cart, name='update_cart'),
    path('checkout/', views.checkout, name='checkout'),
    
    # Authentication
    path('account/', views.account, name='account'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    
    # Social auth
    path('social-auth/', include('social_django.urls', namespace='social')),
    
    # User profile
    path('update-profile/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('update-settings/', views.update_settings, name='update_settings'),
    path('delete-account/', views.delete_account, name='delete_account'),
    
    # Wishlist
    path('add-to-wishlist/', views.add_to_wishlist, name='add_to_wishlist'),
    path('remove-from-wishlist/<int:item_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
    # Addresses
    path('add-address/', views.add_address, name='add_address'),
    path('edit-address/<int:address_id>/', views.edit_address, name='edit_address'),
    path('delete-address/<int:address_id>/', views.delete_address, name='delete_address'),
    
    # Orders
    path('order/<int:order_id>/', views.order_detail, name='order_detail'),

    # Temporary redirect for login
    path('login/', RedirectView.as_view(url=reverse_lazy('accounts:login')), name='login'),

    # ========== CUSTOM ADMIN DASHBOARD (ALL UNDER /dashboard/) ==========
    
    # Dashboard Home
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # User Management
    path('dashboard/users/', views.admin_users, name='admin_users'),
    path('dashboard/users/add/', views.admin_user_add, name='admin_user_add'),
    path('dashboard/users/edit/<int:user_id>/', views.admin_user_edit, name='admin_user_edit'),
    path('dashboard/users/delete/<int:user_id>/', views.admin_user_delete, name='admin_user_delete'),
    path('dashboard/users/toggle/<int:user_id>/', views.admin_user_toggle_status, name='admin_user_toggle_status'),
    
    # Product Management
    path('dashboard/products/', views.admin_products, name='admin_products'),
    path('dashboard/products/add/', views.admin_product_add, name='admin_product_add'),
    path('dashboard/products/edit/<int:product_id>/', views.admin_product_edit, name='admin_product_edit'),
    path('dashboard/products/delete/<int:product_id>/', views.admin_product_delete, name='admin_product_delete'),
    path('dashboard/products/bulk-action/', views.admin_product_bulk_action, name='admin_product_bulk_action'),
    
    # Category Management
    path('dashboard/categories/', views.admin_categories, name='admin_categories'),
    path('dashboard/categories/add/', views.admin_category_add, name='admin_category_add'),
    path('dashboard/categories/edit/<int:category_id>/', views.admin_category_edit, name='admin_category_edit'),
    path('dashboard/categories/delete/<int:category_id>/', views.admin_category_delete, name='admin_category_delete'),
    
    # Order Management
    path('dashboard/orders/', views.admin_orders, name='admin_orders'),
    path('dashboard/orders/<int:order_id>/', views.admin_order_detail, name='admin_order_detail'),
    path('dashboard/orders/<int:order_id>/update-status/', views.admin_order_update_status, name='admin_order_update_status'),
    
    # Deals Management
    path('dashboard/deals/', views.admin_deals, name='admin_deals'),
    path('dashboard/deals/add/', views.admin_deals_add, name='admin_deals_add'),
    path('dashboard/deals/remove/<int:product_id>/', views.admin_deals_remove, name='admin_deals_remove'),
    
    # Messages Management
    path('dashboard/messages/', views.admin_messages, name='admin_messages'),
    path('dashboard/messages/<int:message_id>/', views.admin_message_detail, name='admin_message_detail'),
    path('dashboard/messages/delete/<int:message_id>/', views.admin_message_delete, name='admin_message_delete'),
    
    # Settings
    path('dashboard/settings/', views.admin_settings, name='admin_settings'),
    
    # Reports
    path('dashboard/reports/', views.admin_reports, name='admin_reports'),
]