"""
M-Pesa Payment Models
"""

from django.db import models
from django.conf import settings  # Add this import


class MpesaPayment(models.Model):
    """
    Model to track M-Pesa payment transactions
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # User and Order Information
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Changed from User
        on_delete=models.CASCADE,
        related_name='mpesa_payments'
    )
    order_id = models.CharField(max_length=100, blank=True, null=True)
    
    # M-Pesa Transaction Details
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant_request_id = models.CharField(max_length=100, unique=True)
    checkout_request_id = models.CharField(max_length=100, unique=True)
    
    # Transaction Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result_code = models.CharField(max_length=10, blank=True, null=True)
    result_description = models.TextField(blank=True, null=True)
    
    # M-Pesa Receipt Details (filled after successful payment)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    account_reference = models.CharField(max_length=100)
    transaction_description = models.CharField(max_length=200)
    
    # Callback data (store full response)
    callback_data = models.JSONField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'M-Pesa Payment'
        verbose_name_plural = 'M-Pesa Payments'
    
    def __str__(self):
        return f"Payment {self.merchant_request_id} - {self.phone_number} - Ksh {self.amount}"
    
    def is_successful(self):
        """Check if payment was successful"""
        return self.status == 'completed' and self.result_code == '0'


class MpesaCallbackLog(models.Model):
    """
    Log all M-Pesa callbacks for debugging
    """
    checkout_request_id = models.CharField(max_length=100)
    raw_data = models.JSONField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Callback {self.checkout_request_id} - {self.created_at}"