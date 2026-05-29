from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Sum, Q
from django.shortcuts import get_object_or_404
from decimal import Decimal
import random
from datetime import datetime

from .models import (
    Product, Category, Order, OrderItem,
    Wishlist, Address, Profile, ContactMessage, SiteSettings
)
from .serializers import (
    ProductSerializer, CategorySerializer, OrderSerializer,
    WishlistSerializer, AddressSerializer, UserSerializer,
    ContactMessageSerializer, SiteSettingsSerializer, ProfileSerializer
)

User = get_user_model()


# ========== AUTH ==========

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not all([username, email, password]):
            return Response({'error': 'Username, email and password are required.'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=400)

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials.'}, status=401)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=400)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()

        profile = user.profile
        profile_data = request.data.get('profile', {})
        for field in ['phone', 'biker_id', 'date_of_birth']:
            if field in profile_data:
                setattr(profile, field, profile_data[field])
        profile.save()

        return Response(UserSerializer(user).data)


# ========== PRODUCTS ==========

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Product.objects.select_related('category').all()

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(is_featured=True)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        sort = self.request.query_params.get('sort', '-created_at')
        sort_map = {
            'price_low': 'price',
            'price_high': '-price',
            'name': 'name',
            'newest': '-created_at',
        }
        qs = qs.order_by(sort_map.get(sort, '-created_at'))

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


# ========== CATEGORIES ==========

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.annotate(product_count=Count('products')).order_by('name')


# ========== CART ==========

class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = request.session.get('cart', {})
        cart_items = []
        total = Decimal('0')

        for product_id, quantity in cart.items():
            try:
                product = Product.objects.get(id=product_id)
                subtotal = product.discounted_price * quantity
                total += subtotal
                cart_items.append({
                    'product': ProductSerializer(product, context={'request': request}).data,
                    'quantity': quantity,
                    'subtotal': float(subtotal),
                })
            except Product.DoesNotExist:
                pass

        return Response({
            'items': cart_items,
            'total': float(total),
            'count': sum(cart.values()),
        })

    def post(self, request):
        product_id = str(request.data.get('product_id'))
        quantity = int(request.data.get('quantity', 1))

        cart = request.session.get('cart', {})
        cart[product_id] = cart.get(product_id, 0) + quantity
        request.session['cart'] = cart
        request.session.modified = True

        return Response({'success': True, 'count': sum(cart.values())})

    def patch(self, request):
        product_id = str(request.data.get('product_id'))
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response({'error': 'Invalid quantity.'}, status=400)

        cart = request.session.get('cart', {})
        cart[product_id] = quantity
        request.session['cart'] = cart
        request.session.modified = True

        return Response({'success': True, 'count': sum(cart.values())})

    def delete(self, request):
        product_id = str(request.data.get('product_id'))
        cart = request.session.get('cart', {})

        if product_id in cart:
            del cart[product_id]
            request.session['cart'] = cart
            request.session.modified = True
            return Response({'success': True, 'count': sum(cart.values())})

        return Response({'error': 'Item not in cart.'}, status=404)


# ========== CHECKOUT ==========

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart = request.session.get('cart', {})
        if not cart:
            return Response({'error': 'Cart is empty.'}, status=400)

        cart_items = []
        subtotal = Decimal('0')

        for product_id, quantity in cart.items():
            try:
                product = Product.objects.get(id=product_id)
                item_total = product.discounted_price * quantity
                subtotal += item_total
                cart_items.append({'product': product, 'quantity': quantity, 'subtotal': item_total})
            except Product.DoesNotExist:
                pass

        tax = subtotal * Decimal('0.16')
        shipping = Decimal('200.00')
        total = subtotal + tax + shipping

        data = request.data
        required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'payment_method']
        for field in required:
            if not data.get(field):
                return Response({'error': f'{field} is required.'}, status=400)

        order_number = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100,999)}"

        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total=total,
            shipping_address=f"{data['address']}, {data['city']}",
            shipping_phone=data['phone'],
            status='processing',
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['product'].price,
            )

        payment_method = data.get('payment_method')

        if payment_method == 'cash':
            order.status = 'processing'
            order.save()
            request.session['cart'] = {}
            request.session.modified = True
            return Response({'success': True, 'order_id': order.id, 'order_number': order.order_number})

        if payment_method == 'mpesa':
            # M-Pesa STK push stays as-is, wire it in later
            return Response({'success': True, 'order_id': order.id, 'message': 'M-Pesa integration pending.'})

        order.delete()
        return Response({'error': 'Invalid payment method.'}, status=400)


# ========== ORDERS ==========

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# ========== WISHLIST ==========

class WishlistView(APIView):
    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('product')
        return Response(WishlistSerializer(items, many=True, context={'request': request}).data)

    def post(self, request):
        product = get_object_or_404(Product, id=request.data.get('product_id'))
        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({'success': True, 'added': created})

    def delete(self, request):
        product = get_object_or_404(Product, id=request.data.get('product_id'))
        Wishlist.objects.filter(user=request.user, product=product).delete()
        return Response({'success': True})


# ========== ADDRESSES ==========

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ========== CONTACT ==========

class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})
        return Response(serializer.errors, status=400)


# ========== SITE SETTINGS ==========

class SiteSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            return Response({})
        return Response(SiteSettingsSerializer(settings).data)