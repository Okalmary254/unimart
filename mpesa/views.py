"""
M-Pesa Views
"""

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.urls import reverse
import json
from datetime import datetime
import logging
import socket

# Set up logging
logger = logging.getLogger(__name__)

# CORRECTED IMPORTS - Use local models and utils
from .models import MpesaPayment, MpesaCallbackLog
from .utils import MpesaAPI, validate_mpesa_phone

# Get M-Pesa settings
MPESA_CONSUMER_KEY = getattr(settings, 'MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
MPESA_BUSINESS_SHORTCODE = getattr(settings, 'MPESA_BUSINESS_SHORTCODE', '')
MPESA_PASSKEY = getattr(settings, 'MPESA_PASSKEY', '')
MPESA_ENVIRONMENT = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')


def is_localhost():
    """
    Check if the site is running on localhost
    """
    hostname = socket.gethostname()
    local_ips = ['127.0.0.1', 'localhost', '0.0.0.0']
    
    try:
        # Get the actual IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        
        # Check if it's a local IP
        if ip.startswith('127.') or ip.startswith('192.168.') or ip.startswith('10.'):
            return True
    except:
        pass
    
    return False


@login_required
@require_http_methods(["POST"])
def initiate_mpesa_payment(request):
    """
    Initiate M-Pesa STK Push payment
    """
    try:
        # Log the request
        logger.info(f"M-Pesa initiation request from user {request.user.id}")
        
        # Parse JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON format',
                'error': str(e)
            }, status=400)
        
        # Extract data
        phone_number = data.get('phone_number', '').strip()
        amount = data.get('amount')
        order_id = data.get('order_id', '').strip()
        
        # Log extracted data
        logger.info(f"Received: phone={phone_number}, amount={amount}, order={order_id}")
        
        # Validate phone number
        if not phone_number:
            return JsonResponse({
                'success': False,
                'message': 'Phone number is required'
            }, status=400)
        
        # Validate amount
        if not amount:
            return JsonResponse({
                'success': False,
                'message': 'Amount is required'
            }, status=400)
        
        try:
            amount = float(amount)
            if amount <= 0:
                return JsonResponse({
                    'success': False,
                    'message': 'Amount must be greater than 0'
                }, status=400)
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Amount must be a valid number'
            }, status=400)
        
        # Validate phone number format
        is_valid, formatted_phone = validate_mpesa_phone(phone_number)
        if not is_valid:
            return JsonResponse({
                'success': False,
                'message': formatted_phone
            }, status=400)
        
        # Initialize M-Pesa API
        mpesa = MpesaAPI(
            consumer_key=MPESA_CONSUMER_KEY,
            consumer_secret=MPESA_CONSUMER_SECRET,
            business_shortcode=MPESA_BUSINESS_SHORTCODE,
            passkey=MPESA_PASSKEY,
            environment=MPESA_ENVIRONMENT
        )
        
        # Use ngrok URL for callback (hardcode for testing)
        callback_url = "https://671d-102-219-210-42.ngrok-free.app/mpesa/callback/"
        
        # Account reference
        account_ref = order_id if order_id else f"UniMart{request.user.id}"
        
        # Transaction description
        trans_desc = f"ORDER {order_id}" if order_id else "UniMart PURCHASE"
        trans_desc = trans_desc[:13]
        
        # Initiate STK Push
        result = mpesa.stk_push(
            phone_number=formatted_phone,
            amount=int(amount),
            account_reference=account_ref,
            transaction_desc=trans_desc,
            callback_url=callback_url
        )
        
        if result.get('success'):
            # Save to database
            payment = MpesaPayment.objects.create(
                user=request.user,
                order_id=order_id,
                phone_number=formatted_phone,
                amount=amount,
                merchant_request_id=result['merchant_request_id'],
                checkout_request_id=result['checkout_request_id'],
                account_reference=account_ref,
                transaction_description=trans_desc,
                status='pending'
            )
            
            return JsonResponse({
                'success': True,
                'message': 'STK Push sent successfully',
                'checkout_request_id': result['checkout_request_id'],
                'merchant_request_id': result['merchant_request_id'],
                'customer_message': result.get('customer_message', '')
            })
        else:
            logger.error(f"STK Push failed: {result}")
            return JsonResponse({
                'success': False,
                'message': result.get('message', 'Failed to initiate M-Pesa payment'),
                'details': result
            }, status=500)
            
    except Exception as e:
        logger.exception("Unexpected error in initiate_mpesa_payment")
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def mpesa_callback(request):
    """
    Handle M-Pesa payment callback
    This URL must be accessible from the internet (use ngrok for local testing)
    """
    try:
        # Parse callback data
        callback_data = json.loads(request.body)
        
        # Log the callback for debugging
        logger.info(f"M-Pesa callback received: {callback_data}")
        
        # Log the callback
        callback_log = MpesaCallbackLog.objects.create(
            checkout_request_id=callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID', ''),
            raw_data=callback_data,
            processed=False
        )
        
        # Extract callback details
        stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        merchant_request_id = stk_callback.get('MerchantRequestID')
        result_code = str(stk_callback.get('ResultCode'))
        result_desc = stk_callback.get('ResultDesc')
        
        # Find the payment record
        try:
            payment = MpesaPayment.objects.get(checkout_request_id=checkout_request_id)
        except MpesaPayment.DoesNotExist:
            logger.error(f"Payment not found for checkout_id: {checkout_request_id}")
            return JsonResponse({
                'ResultCode': 1,
                'ResultDesc': 'Payment record not found'
            })
        
        # Update payment status
        payment.result_code = result_code
        payment.result_description = result_desc
        payment.callback_data = callback_data
        
        if result_code == '0':  # Success
            payment.status = 'completed'
            
            # Extract additional details from callback
            callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            for item in callback_metadata:
                name = item.get('Name')
                value = item.get('Value')
                
                if name == 'MpesaReceiptNumber':
                    payment.mpesa_receipt_number = value
                elif name == 'Amount':
                    payment.amount = value
                elif name == 'TransactionDate':
                    # Convert timestamp to datetime
                    trans_date = str(value)
                    try:
                        payment.transaction_date = datetime.strptime(trans_date, '%Y%m%d%H%M%S')
                    except:
                        pass
                elif name == 'PhoneNumber':
                    payment.phone_number = value
            
            logger.info(f"Payment completed successfully. Receipt: {payment.mpesa_receipt_number}")
            
            # Update order status if order_id exists
            if payment.order_id:
                try:
                    from orders.models import Order
                    order = Order.objects.get(id=payment.order_id)
                    order.payment_status = 'paid'
                    order.payment_method = 'mpesa'
                    order.mpesa_receipt = payment.mpesa_receipt_number
                    order.save()
                    logger.info(f"Order {order.id} updated with payment")
                except Exception as e:
                    logger.error(f"Error updating order: {e}")
            
        else:  # Failed
            payment.status = 'failed'
            logger.warning(f"Payment failed: {result_desc}")
        
        payment.save()
        
        # Mark callback as processed
        callback_log.processed = True
        callback_log.save()
        
        return JsonResponse({
            'ResultCode': 0,
            'ResultDesc': 'Success'
        })
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in callback")
        return JsonResponse({
            'ResultCode': 1,
            'ResultDesc': 'Invalid JSON'
        })
    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return JsonResponse({
            'ResultCode': 1,
            'ResultDesc': f'Error: {str(e)}'
        })


@login_required
@require_http_methods(["GET"])
def check_payment_status(request, checkout_request_id):
    """
    Check the status of an M-Pesa payment
    """
    try:
        payment = MpesaPayment.objects.get(
            checkout_request_id=checkout_request_id,
            user=request.user
        )
        
        return JsonResponse({
            'success': True,
            'status': payment.status,
            'result_code': payment.result_code,
            'result_description': payment.result_description,
            'mpesa_receipt': payment.mpesa_receipt_number,
            'is_successful': payment.status == 'completed'
        })
        
    except MpesaPayment.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Payment not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@login_required
def mpesa_payment_page(request):
    """
    Render the M-Pesa payment page
    """
    # Get cart total or order total
    cart = request.session.get('cart', {})
    total = 0
    
    # Calculate cart total
    for item in cart.values():
        total += float(item.get('price', 0)) * int(item.get('quantity', 1))
    
    # Check if running on localhost
    on_localhost = is_localhost()
    
    context = {
        'total': total,
        'user': request.user,
        'environment': MPESA_ENVIRONMENT,
        'on_localhost': on_localhost,
        'use_ngrok': on_localhost and MPESA_ENVIRONMENT == 'sandbox'
    }
    
    return render(request, 'mpesa/payment.html', context)