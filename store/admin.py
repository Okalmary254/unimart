from django.contrib import admin
from .models import (
    Profile, Category, Product, Order, OrderItem, 
    Wishlist, Address, ContactMessage, SiteSettings
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_id', 'phone', 'created_at']
    search_fields = ['user__username', 'user__email', 'student_id']
    list_filter = ['created_at']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']  # Removed slug and icon
    search_fields = ['name']
    # Remove prepopulated_fields if slug doesn't exist
    # prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    # Remove prepopulated_fields if slug doesn't exist
    # prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'stock', 'is_featured']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'user__username', 'user__email']
    list_editable = ['status']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'added_at']
    list_filter = ['added_at']

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_name', 'full_name', 'city', 'is_default']
    list_filter = ['is_default', 'city']
    search_fields = ['user__username', 'full_name', 'address_line1']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at', 'is_read']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject']
    list_editable = ['is_read']

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'contact_email', 'contact_phone']