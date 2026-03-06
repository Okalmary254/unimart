"""
M-Pesa Admin Configuration
Add this to your admin.py
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import MpesaPayment, MpesaCallbackLog


@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    """
    Admin interface for M-Pesa payments
    """
    list_display = [
        'merchant_request_id',
        'user',
        'phone_number',
        'amount',
        'status_badge',
        'mpesa_receipt_number',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'created_at',
        'transaction_date'
    ]
    
    search_fields = [
        'merchant_request_id',
        'checkout_request_id',
        'phone_number',
        'mpesa_receipt_number',
        'user__username',
        'user__email',
        'order_id'
    ]
    
    readonly_fields = [
        'user',
        'order_id',
        'phone_number',
        'amount',
        'merchant_request_id',
        'checkout_request_id',
        'result_code',
        'result_description',
        'mpesa_receipt_number',
        'transaction_date',
        'account_reference',
        'transaction_description',
        'callback_data',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'order_id')
        }),
        ('Payment Details', {
            'fields': ('phone_number', 'amount', 'status')
        }),
        ('M-Pesa Transaction', {
            'fields': (
                'merchant_request_id',
                'checkout_request_id',
                'result_code',
                'result_description'
            )
        }),
        ('Receipt Information', {
            'fields': ('mpesa_receipt_number', 'transaction_date')
        }),
        ('Metadata', {
            'fields': (
                'account_reference',
                'transaction_description',
                'callback_data'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )
    
    def status_badge(self, obj):
        """Display colored status badge"""
        colors = {
            'pending': '#ffc107',
            'completed': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#6c757d'
        }
        
        # icons = {
        #     'pending': '⏳',
        #     'completed': '✅',
        #     'failed': '❌',
        #     'cancelled': '🚫'
        # }
        
        # color = colors.get(obj.status, '#6c757d')
        # icon = icons.get(obj.status, '❓')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 5px; font-weight: bold;">{} {}</span>',
            # color,
            # icon,
            # obj.status.upper()
        )
    
    status_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Prevent manual creation of payments"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of payment records"""
        return False


@admin.register(MpesaCallbackLog)
class MpesaCallbackLogAdmin(admin.ModelAdmin):
    """
    Admin interface for M-Pesa callback logs
    """
    list_display = [
        'id',
        'checkout_request_id',
        'processed_badge',
        'created_at'
    ]
    
    list_filter = [
        'processed',
        'created_at'
    ]
    
    search_fields = [
        'checkout_request_id',
        'raw_data'
    ]
    
    readonly_fields = [
        'checkout_request_id',
        'raw_data',
        'processed',
        'created_at'
    ]
    
    fieldsets = (
        ('Callback Information', {
            'fields': ('checkout_request_id', 'processed')
        }),
        ('Raw Data', {
            'fields': ('raw_data',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        })
    )
    
    def processed_badge(self, obj):
        """Display processed status with color"""
        if obj.processed:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; '
                'border-radius: 5px; font-weight: bold;">✅ PROCESSED</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 5px 10px; '
                'border-radius: 5px; font-weight: bold;">⏳ PENDING</span>'
            )
    
    processed_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Prevent manual creation"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion of old logs"""
        return request.user.is_superuser


# Optional: Custom Admin Actions
@admin.action(description='Mark selected payments as completed')
def mark_as_completed(modeladmin, request, queryset):
    """Admin action to manually mark payments as completed"""
    updated = queryset.update(status='completed')
    modeladmin.message_user(
        request,
        f'{updated} payment(s) marked as completed.'
    )


@admin.action(description='Mark selected payments as failed')
def mark_as_failed(modeladmin, request, queryset):
    """Admin action to manually mark payments as failed"""
    updated = queryset.update(status='failed')
    modeladmin.message_user(
        request,
        f'{updated} payment(s) marked as failed.'
    )


# Add actions to the MpesaPaymentAdmin
MpesaPaymentAdmin.actions = [mark_as_completed, mark_as_failed]