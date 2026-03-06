from requests.exceptions import RequestException
import requests
import base64
from datetime import datetime
from requests.auth import HTTPBasicAuth
import json
import logging
import os
import re
import traceback
from django.conf import settings

# Set up logging
logger = logging.getLogger(__name__)

class MpesaAPI:
    """
    M-Pesa Daraja API wrapper for STK Push payments
    Production-ready version with environment variables
    """
    
    def __init__(self, consumer_key=None, consumer_secret=None, business_shortcode=None, 
                 passkey=None, environment=None, callback_url=None):
        """
        Initialize M-Pesa API credentials from environment variables
        
        Args:
            consumer_key: Optional override - defaults to settings.MPESA_CONSUMER_KEY
            consumer_secret: Optional override - defaults to settings.MPESA_CONSUMER_SECRET
            business_shortcode: Optional override - defaults to settings.MPESA_BUSINESS_SHORTCODE
            passkey: Optional override - defaults to settings.MPESA_PASSKEY
            environment: Optional override - defaults to settings.MPESA_ENVIRONMENT
            callback_url: Optional override - defaults to settings.MPESA_CALLBACK_URL
        """
        # Load credentials from Django settings (which loads from .env)
        self.consumer_key = consumer_key or getattr(settings, 'MPESA_CONSUMER_KEY', '')
        self.consumer_secret = consumer_secret or getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = business_shortcode or getattr(settings, 'MPESA_BUSINESS_SHORTCODE', '')
        self.passkey = passkey or getattr(settings, 'MPESA_PASSKEY', '')
        self.environment = environment or getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        self.callback_url = callback_url or getattr(settings, 'MPESA_CALLBACK_URL', '')
        
        # Validate required credentials
        if not all([self.consumer_key, self.consumer_secret, self.business_shortcode, self.passkey]):
            missing = []
            if not self.consumer_key: missing.append('MPESA_CONSUMER_KEY')
            if not self.consumer_secret: missing.append('MPESA_CONSUMER_SECRET')
            if not self.business_shortcode: missing.append('MPESA_BUSINESS_SHORTCODE')
            if not self.passkey: missing.append('MPESA_PASSKEY')
            error_msg = f"Missing M-Pesa credentials in environment: {', '.join(missing)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Set API URLs based on environment
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
        
        self.auth_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        self.query_url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
        
        logger.info(f"MpesaAPI initialized in {self.environment} mode")
    
    def extract_incapsula_id(self, html_response):
        """
        Extract Incapsula incident ID from HTML response
        """
        match = re.search(r'incident_id=([0-9-]+)', html_response)
        if match:
            return match.group(1)
        return "Unknown"
    
    def check_incapsula_block(self, response):
        """
        Check if response is an Incapsula firewall block
        """
        if response.status_code == 403:
            indicators = [
                'Incapsula',
                '_Incapsula_Resource',
                'Request unsuccessful',
                'incident_id'
            ]
            for indicator in indicators:
                if indicator in response.text:
                    return True
        return False
    
    def get_access_token(self):
        """
        Generate OAuth access token with Incapsula firewall detection
        
        Returns:
            str: Access token or None if failed
        """
        try:
            logger.info("Requesting access token...")
            response = requests.get(
                self.auth_url,
                auth=HTTPBasicAuth(self.consumer_key, self.consumer_secret),
                timeout=30
            )
            
            logger.info(f"Token response status: {response.status_code}")
            
            # Check for Incapsula firewall block
            if self.check_incapsula_block(response):
                incident_id = self.extract_incapsula_id(response.text)
                logger.error("🚫 INCAPSULA FIREWALL BLOCK DETECTED")
                logger.error(f"Incapsula Incident ID: {incident_id}")
                logger.error("Solutions:")
                logger.error("1. Wait 15-30 minutes and try again")
                logger.error("2. Change your IP address (use VPN or mobile hotspot)")
                logger.error("3. Use Pesa Playground for local development")
                return None
            
            # Check for non-200 responses
            if response.status_code != 200:
                logger.error(f"Failed to get token: Status {response.status_code}")
                logger.error(f"Response body: {response.text[:500]}")  # Log first 500 chars
                
                # Check for rate limiting
                if response.status_code == 429:
                    logger.error("Rate limited by Safaricom API. Too many requests.")
                elif response.status_code == 401:
                    logger.error("Authentication failed. Check your Consumer Key/Secret.")
                elif response.status_code == 500:
                    logger.error("Safaricom internal server error. Their servers might be down.")
                
                return None
            
            # Try to parse JSON response
            try:
                result = response.json()
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {response.text[:200]}")
                return None
            
            access_token = result.get('access_token')
            if access_token:
                logger.info("Access token obtained successfully")
                return access_token
            else:
                logger.error("No access token in response")
                logger.error(f"Response keys: {result.keys()}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error("Timeout while getting access token (30s exceeded)")
            return None
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error while getting access token: {e}")
            return None
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error getting access token: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text[:500]}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting access token: {e}")
            logger.error(traceback.format_exc())
            return None

    def generate_password(self):
        """
        Generate password for STK push
        Password = Base64(Shortcode + Passkey + Timestamp)
        
        Returns:
            tuple: (password, timestamp)
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        
        # Encode to bytes, then base64, then decode to string
        encoded = base64.b64encode(data_to_encode.encode('utf-8'))
        password = encoded.decode('utf-8')
        
        logger.debug(f"Generated timestamp: {timestamp}")
        return password, timestamp
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc, callback_url=None):
        """
        Initiate STK Push to customer's phone
        
        Args:
            phone_number: Customer phone number (format: 254XXXXXXXXX)
            amount: Amount to charge (integer)
            account_reference: Order ID or reference
            transaction_desc: Description of transaction
            callback_url: Optional override - defaults to settings.MPESA_CALLBACK_URL
        
        Returns:
            dict: Response from M-Pesa API
        """
        # Use provided callback_url or from settings
        final_callback_url = callback_url or self.callback_url or getattr(settings, 'MPESA_CALLBACK_URL', '')
        
        # Validate callback URL for production
        if self.environment == 'production' and ('localhost' in final_callback_url or '127.0.0.1' in final_callback_url or 'ngrok' in final_callback_url):
            return {
                'success': False,
                'message': 'Invalid callback URL for production. Must be a public HTTPS URL.',
                'error_type': 'configuration_error'
            }
        
        # Validate phone number first
        is_valid, phone_result = validate_mpesa_phone(phone_number)
        if not is_valid:
            return {
                'success': False,
                'message': phone_result,
                'error_type': 'validation_error'
            }
        
        formatted_phone = phone_result
        
        # Get access token
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token. M-Pesa service temporarily unavailable.',
                'error_type': 'auth_error'
            }
        
        # Generate password and timestamp
        password, timestamp = self.generate_password()
        
        # Prepare headers
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Prepare payload
        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',  # Use 'CustomerBuyGoodsOnline' for Till
            'Amount': int(amount),
            'PartyA': formatted_phone,  # Customer phone
            'PartyB': self.business_shortcode,  # Your shortcode
            'PhoneNumber': formatted_phone,  # Customer phone
            'CallBackURL': final_callback_url,
            'AccountReference': str(account_reference)[:12],  # Max 12 chars
            'TransactionDesc': str(transaction_desc)[:13]  # Max 13 chars
        }
        
        logger.info(f"Initiating STK push for amount: {amount} to {formatted_phone}")
        
        try:
            response = requests.post(
                self.stk_push_url,
                json=payload,
                headers=headers,
                timeout=60
            )
            
            logger.info(f"STK Push response status: {response.status_code}")
            
            # Check for Incapsula block in STK response
            if self.check_incapsula_block(response):
                incident_id = self.extract_incapsula_id(response.text)
                logger.error(f"🚫 INCAPSULA BLOCK DETECTED in STK Push. Incident: {incident_id}")
                return {
                    'success': False,
                    'message': 'Payment service temporarily unavailable. Please try again later.',
                    'error_type': 'firewall_block',
                    'incident_id': incident_id
                }
            
            if response.status_code != 200:
                error_msg = f"STK Push failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_detail = error_data.get('errorMessage', response.text)
                except:
                    error_detail = response.text
                
                logger.error(f"{error_msg}: {error_detail}")
                return {
                    'success': False,
                    'message': error_msg,
                    'error_type': 'api_error',
                    'detail': error_detail,
                    'response': response.text if response.text else None
                }
            
            response.raise_for_status()
            result = response.json()
            
            # Check if request was successful
            if result.get('ResponseCode') == '0':
                logger.info(f"STK Push initiated successfully. CheckoutRequestID: {result.get('CheckoutRequestID')}")
                return {
                    'success': True,
                    'response': result,
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID'),
                    'response_code': result.get('ResponseCode'),
                    'response_description': result.get('ResponseDescription'),
                    'customer_message': result.get('CustomerMessage')
                }
            else:
                error_msg = result.get('ResponseDescription', 'Unknown error')
                logger.error(f"STK Push failed: {error_msg}")
                return {
                    'success': False,
                    'message': error_msg,
                    'error_type': 'payment_error',
                    'response_code': result.get('ResponseCode'),
                    'response': result
                }
                
        except requests.exceptions.Timeout:
            logger.error("Timeout during STK Push")
            return {
                'success': False,
                'message': 'Request timeout - please try again',
                'error_type': 'timeout_error'
            }
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error during STK Push: {e}")
            return {
                'success': False,
                'message': 'Network connection error - please check your internet',
                'error_type': 'connection_error'
            }
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error during STK Push: {e}")
            return {
                'success': False,
                'message': f'HTTP error: {str(e)}',
                'error_type': 'http_error'
            }
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return {
                'success': False,
                'message': 'Invalid response from server',
                'error_type': 'json_error'
            }
        except Exception as e:
            logger.error(f"Unexpected error during STK Push: {e}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'message': f'Unexpected error: {str(e)}',
                'error_type': 'unexpected_error'
            }
    
    def query_stk_status(self, checkout_request_id):
        """
        Query the status of an STK Push transaction
        
        Args:
            checkout_request_id: CheckoutRequestID from STK Push response
        
        Returns:
            dict: Transaction status
        """
        if not checkout_request_id:
            return {
                'success': False,
                'message': 'CheckoutRequestID is required',
                'error_type': 'validation_error'
            }
        
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_type': 'auth_error'
            }
        
        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id
        }
        
        try:
            response = requests.post(self.query_url, json=payload, headers=headers, timeout=30)
            
            # Check for Incapsula block
            if self.check_incapsula_block(response):
                incident_id = self.extract_incapsula_id(response.text)
                logger.error(f"🚫 INCAPSULA BLOCK DETECTED in status query. Incident: {incident_id}")
                return {
                    'success': False,
                    'message': 'Status query temporarily unavailable',
                    'error_type': 'firewall_block',
                    'incident_id': incident_id
                }
            
            response.raise_for_status()
            result = response.json()
            
            return {
                'success': True,
                'response': result,
                'result_code': result.get('ResultCode'),
                'result_desc': result.get('ResultDesc')
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Query failed: {e}")
            return {
                'success': False,
                'message': f'Query failed: {str(e)}',
                'error_type': 'query_error'
            }


def format_phone_number(phone):
    """
    Format phone number to 254XXXXXXXXX format
    
    Args:
        phone: Phone number in various formats
    
    Returns:
        str: Formatted phone number or None if invalid
    """
    if not phone:
        return None
    
    # Convert to string and remove all non-digit characters
    phone_str = str(phone).strip()
    phone_digits = ''.join(filter(str.isdigit, phone_str))
    
    if not phone_digits:
        return None
    
    # Handle different formats
    if phone_digits.startswith('254') and len(phone_digits) == 12:
        return phone_digits
    elif phone_digits.startswith('0') and len(phone_digits) == 10:
        return '254' + phone_digits[1:]
    elif phone_digits.startswith('+254') and len(phone_digits) == 13:
        return phone_digits[1:]  # Remove the '+'
    elif phone_digits.startswith('7') and len(phone_digits) == 9:
        return '254' + phone_digits
    elif phone_digits.startswith('1') and len(phone_digits) == 9:
        return '254' + phone_digits
    else:
        return None


def validate_mpesa_phone(phone):
    """
    Validate Kenyan phone number for M-Pesa
    
    Args:
        phone: Phone number to validate
    
    Returns:
        tuple: (is_valid, formatted_phone_or_error_message)
    """
    formatted = format_phone_number(phone)
    
    if not formatted:
        return False, "Invalid phone number format"
    
    if len(formatted) != 12:
        return False, "Phone number must be 12 digits (254XXXXXXXXX)"
    
    # Valid Kenyan mobile prefixes
    valid_prefixes = ['2547', '2541', '2540']  # Safaricom, Airtel, Telkom
    
    if not any(formatted.startswith(prefix) for prefix in valid_prefixes):
        return False, "Invalid Kenyan mobile number - must start with 2547, 2541, or 2540"
    
    return True, formatted


# Django management command helper
def get_mpesa_api():
    """
    Factory function to get MpesaAPI instance with settings from Django
    """
    return MpesaAPI(
        consumer_key=settings.MPESA_CONSUMER_KEY,
        consumer_secret=settings.MPESA_CONSUMER_SECRET,
        business_shortcode=settings.MPESA_BUSINESS_SHORTCODE,
        passkey=settings.MPESA_PASSKEY,
        environment=settings.MPESA_ENVIRONMENT,
        callback_url=settings.MPESA_CALLBACK_URL
    )


# Example usage (for testing)
if __name__ == "__main__":
    # This would typically use settings, but for testing we need to set them
    import os
    from dotenv import load_dotenv
    
    # Load environment variables for testing
    load_dotenv()
    
    # Initialize the API with environment variables
    mpesa = MpesaAPI(
        consumer_key=os.getenv('MPESA_CONSUMER_KEY'),
        consumer_secret=os.getenv('MPESA_CONSUMER_SECRET'),
        business_shortcode=os.getenv('MPESA_BUSINESS_SHORTCODE'),
        passkey=os.getenv('MPESA_PASSKEY'),
        environment=os.getenv('MPESA_ENVIRONMENT', 'sandbox'),
        callback_url=os.getenv('MPESA_CALLBACK_URL')
    )
    
    # Example STK Push
    result = mpesa.stk_push(
        phone_number="254708374149",
        amount=10,
        account_reference="ORDER123",
        transaction_desc="Payment for goods"
    )
    
    if result['success']:
        print(f"STK Push initiated. Checkout ID: {result['checkout_request_id']}")
        print(f"Message: {result.get('customer_message', 'Check your phone for STK prompt')}")
    else:
        print(f"Failed: {result['message']}")
        if 'detail' in result:
            print(f"Details: {result['detail']}")