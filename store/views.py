from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum, Count, Q
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST
import json
import random
import string
from datetime import datetime, timedelta
from decimal import Decimal
from .models import (
    Product, Category, Order, OrderItem, Wishlist, 
    Address, Profile, ContactMessage, SiteSettings
)
from django.contrib.auth.models import User


# ========== PUBLIC VIEWS ==========

# Home Page View
def home(request):

    products_list = Product.objects.all().order_by('-created_at')
    
    featured_products = Product.objects.filter(is_featured=True)[:4]
    
    categories = Category.objects.annotate(
        product_count=Count('products')
    ).order_by('name')
    
    paginator = Paginator(products_list, 16)
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)
    
    def get_cart_count(request):
        cart = request.session.get('cart', {})
        return sum(cart.values()) if cart else 0
    
    context = {
        'products': products,
        'featured_products': featured_products,
        'categories': categories,
        'cart_items_count': get_cart_count(request),
        'site_settings': SiteSettings.objects.first(),
    }
    return render(request, 'store/home.html', context)
    products = Product.objects.all().order_by('-created_at')
    featured_products = Product.objects.filter(is_featured=True)
    categories = Category.objects.all()
    
    paginator = Paginator(products_list, 16)
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)
    
    # Get categories for footer
    categories = Category.objects.annotate(
        product_count=Count('products')
    ).order_by('name')
    
    context = {
        'products': products,
        'categories': categories,
        'cart_items_count': get_cart_count(request),
        'site_settings': SiteSettings.objects.first(),
    }
    return render(request, 'store/home.html', context)




# Products Page View
def products(request):
    products_list = Product.objects.all()
    
    # Filtering
    category = request.GET.get('category')
    if category:
        products_list = products_list.filter(category__slug=category)
    
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        products_list = products_list.filter(price__gte=min_price)
    if max_price:
        products_list = products_list.filter(price__lte=max_price)
    
    # Sorting
    sort = request.GET.get('sort')
    if sort == 'price_low':
        products_list = products_list.order_by('price')
    elif sort == 'price_high':
        products_list = products_list.order_by('-price')
    elif sort == 'name':
        products_list = products_list.order_by('name')
    elif sort == 'newest':
        products_list = products_list.order_by('-created_at')
    
    # Pagination
    paginator = Paginator(products_list, 12)
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)
    
    categories = Category.objects.annotate(product_count=Count('products'))
    
    context = {
        'products': products,
        'categories': categories,
    }
    return render(request, 'store/products.html', context)


# Categories Page View
def categories(request):
    """View to display all categories"""
    categories_list = []
    for category in Category.objects.all():
        categories_list.append({
            'name': category.name,
            'slug': category.name.lower(), 
            'count': Product.objects.filter(category=category).count(),
            'id': category.id,
        })
    
    context = {
        'categories': categories_list,
    }
    return render(request, 'store/categories.html', context)


# Category Detail View
def category_detail(request, category_name):
    category = get_object_or_404(Category, name__iexact=category_name.replace('-', ' '))
    products = Product.objects.filter(category=category)
    
    categories = Category.objects.annotate(
        product_count=Count('products')
    ).order_by('name')

    context = {
        'selected_category': category_name,
        'category_name': category.name,
        'products': products,
        'product_count': products.count(),
    }
    return render(request, 'store/categories.html', context)


# Product Detail View
def product_detail(request, pk):
    product = get_object_or_404(Product, id=pk)
    related_products = Product.objects.filter(category=product.category).exclude(id=pk)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'store/product_detail.html', context)


# Deals Page View
def deals(request):
    products = Product.objects.filter(discount_percentage__gt=0).order_by('-discount_percentage')
    
    # Filter by category if requested
    category_id = request.GET.get('category')
    selected_category = None
    
    if category_id:
        try:
            selected_category = Category.objects.get(id=category_id)
            products = products.filter(category=selected_category)
        except Category.DoesNotExist:
            pass
    
    # Get all categories for filter sidebar
    categories = Category.objects.all()
    
    context = {
        'products': products,
        'categories': categories,
        'selected_category': selected_category,
    }
    return render(request, 'store/deals.html', context)
    # Get products with discounts
    products = Product.objects.filter(discount_percentage__gt=0).order_by('-discount_percentage')
    
    # Get all categories for the filter dropdown
    categories = Category.objects.annotate(
        product_count=Count('products')
    ).exclude(
        slug__isnull=True
    ).exclude(
        slug__exact=''
    ).order_by('name')
    
    # Get selected category from request
    selected_category_id = request.GET.get('category')
    if selected_category_id:
        products = products.filter(category__id=selected_category_id)
    
    # Get sort parameter
    sort = request.GET.get('sort', '')
    if sort == 'price_low':
        products = products.order_by('price')
    elif sort == 'price_high':
        products = products.order_by('-price')
    elif sort == 'discount_high':
        products = products.order_by('-discount_percentage')
    # Add other sorting options as needed
    
    context = {
        'products': products,
        'categories': categories,
        'selected_category': selected_category,
    }
    return render(request, 'store/deals.html', context)


# About Page View
def about(request):
    context = {
        'team_members': [
            {'name': 'John Mary', 'position': 'Founder & CEO', 'bio': 'Plumber (Data Engineer)', 'image': 'team/john.jpg'},
            {'name': 'Sarah Odhiambo', 'position': 'Operations Manager', 'bio': 'Business student', 'image': 'team/sarah.jpg'},
            {'name': 'David Kimani', 'position': 'Tech Lead', 'bio': 'Software Engineering student', 'image': 'team/david.jpg'},
            {'name': 'Grace Achieng', 'position': 'Customer Relations', 'bio': 'Marketing student', 'image': 'team/grace.jpg'},
        ]
    }
    return render(request, 'store/about.html', context)


# Contact Page View
def contact(request):
    if request.method == 'POST':
        name = request.POST.get('first_name') + ' ' + request.POST.get('last_name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        
        messages.success(request, 'Message sent successfully! We\'ll get back to you soon.')
        return redirect('contact')
    
    settings = SiteSettings.objects.first()
    context = {
        'contact_info': {
            'address': settings.contact_address if settings else 'Mama Ngina University',
            'phone': settings.contact_phone if settings else '+2547 4387 4690',
            'email': settings.contact_email if settings else 'info@mnustore.ac.ke',
            'hours': settings.business_hours if settings else 'Mon-Fri: 8am - 6pm',
        }
    }
    return render(request, 'store/contact.html', context)


# FAQ Page
def faq(request):
    return render(request, 'store/faq.html')


# Shipping Info Page
def shipping(request):
    return render(request, 'store/shipping.html')


# Returns Policy Page
def returns(request):
    return render(request, 'store/returns.html')


# Terms and Conditions Page
def terms(request):
    return render(request, 'store/terms.html')


# ========== USER ACCOUNT VIEWS ==========

# Account Page View
@login_required
def account(request):
    user = request.user
    
    # Get user's orders
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    all_orders = Order.objects.filter(user=user).order_by('-created_at')
    orders_count = all_orders.count()
    
    # Calculate total spent
    total_spent = all_orders.aggregate(total=Sum('total'))['total'] or 0
    
    # Get wishlist items
    wishlist_items = Wishlist.objects.filter(user=user).select_related('product')
    wishlist_count = wishlist_items.count()
    
    # Get addresses
    addresses = Address.objects.filter(user=user)
    addresses_count = addresses.count()
    
    # Get cart count from session
    cart = request.session.get('cart', {})
    cart_items_count = sum(cart.values())
    
    context = {
        'user': user,
        'recent_orders': recent_orders,
        'all_orders': all_orders,
        'orders_count': orders_count,
        'total_spent': total_spent,
        'wishlist_items': wishlist_items,
        'wishlist_count': wishlist_count,
        'addresses': addresses,
        'addresses_count': addresses_count,
        'cart_items_count': cart_items_count,
    }
    return render(request, 'store/account.html', context)


# Update Profile View
@login_required
@require_POST
def update_profile(request):
    user = request.user
    
    user.first_name = request.POST.get('first_name', user.first_name)
    user.last_name = request.POST.get('last_name', user.last_name)
    user.save()
    
    user.profile.phone = request.POST.get('phone', user.profile.phone)
    user.profile.date_of_birth = request.POST.get('date_of_birth') or None
    user.profile.save()
    
    messages.success(request, 'Profile updated successfully!')
    return redirect('store:account')


# Change Password View
@login_required
@require_POST
def change_password(request):
    user = request.user
    current = request.POST.get('current_password')
    new = request.POST.get('new_password')
    confirm = request.POST.get('confirm_password')
    
    if not user.check_password(current):
        messages.error(request, 'Current password is incorrect.')
    elif new != confirm:
        messages.error(request, 'New passwords do not match.')
    elif len(new) < 8:
        messages.error(request, 'Password must be at least 8 characters long.')
    else:
        user.set_password(new)
        user.save()
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        messages.success(request, 'Password changed successfully!')
    
    return redirect('store:account')


# Upload Avatar View
@login_required
@require_POST
def upload_avatar(request):
    if 'avatar' in request.FILES:
        request.user.profile.avatar = request.FILES['avatar']
        request.user.profile.save()
        messages.success(request, 'Avatar updated successfully!')
    return redirect('store:account')


# Update Settings View
@login_required
@require_POST
def update_settings(request):
    profile = request.user.profile
    
    profile.email_orders = request.POST.get('email_orders') == 'on'
    profile.email_promotions = request.POST.get('email_promotions') == 'on'
    profile.sms_notifications = request.POST.get('sms_notifications') == 'on'
    profile.keep_logged_in = request.POST.get('keep_logged_in') == 'on'
    profile.public_profile = request.POST.get('public_profile') == 'on'
    profile.save()
    
    messages.success(request, 'Settings updated successfully!')
    return redirect('store:account')


# Delete Account View
@login_required
@require_POST
def delete_account(request):
    user = request.user
    user.delete()
    logout(request)
    messages.success(request, 'Your account has been permanently deleted.')
    return JsonResponse({'success': True})


# ========== CART VIEWS ==========

# Cart View
def cart(request):
    cart_items = []
    cart = request.session.get('cart', {})
    total = 0
    
    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            subtotal = product.price * quantity
            total += subtotal
            cart_items.append({
                'product': product,
                'quantity': quantity,
                'subtotal': subtotal
            })
        except Product.DoesNotExist:
            pass
    
    context = {
        'cart_items': cart_items,
        'total': total,
    }
    return render(request, 'store/cart.html', context)


# Add to Cart AJAX View
@require_POST
def add_to_cart(request):
    data = json.loads(request.body)
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    cart = request.session.get('cart', {})
    cart[str(product_id)] = cart.get(str(product_id), 0) + quantity
    request.session['cart'] = cart
    
    return JsonResponse({
        'success': True,
        'cart_count': sum(cart.values())
    })


@require_POST
def update_cart(request):
    """Update cart item quantity via AJAX"""
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))
        
        if quantity < 1:
            return JsonResponse({'success': False, 'error': 'Invalid quantity'})
        
        cart = request.session.get('cart', {})
        cart[str(product_id)] = quantity
        request.session['cart'] = cart
        request.session.modified = True
        
        # Calculate new totals
        total = 0
        for prod_id, qty in cart.items():
            product = Product.objects.get(id=prod_id)
            total += product.discounted_price * qty
        
        return JsonResponse({
            'success': True,
            'cart_total': float(total),
            'cart_count': sum(cart.values())
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@require_POST
def remove_cart_item(request):
    """Remove item from cart via AJAX"""
    try:
        data = json.loads(request.body)
        product_id = str(data.get('product_id'))
        
        cart = request.session.get('cart', {})
        
        if product_id in cart:
            del cart[product_id]
            request.session['cart'] = cart
            request.session.modified = True
            
            # Calculate new totals
            total = 0
            for prod_id, qty in cart.items():
                product = Product.objects.get(id=prod_id)
                total += product.discounted_price * qty
            
            return JsonResponse({
                'success': True,
                'cart_total': float(total),
                'cart_count': sum(cart.values()),
                'message': 'Item removed from cart'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Item not in cart'
            })
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

# Checkout View
@login_required
def checkout(request):
    cart = request.session.get('cart', {})
    
    if not cart:
        messages.warning(request, 'Your cart is empty.')
        return redirect('store:cart')
    
    cart_items = []
    subtotal = 0
    
    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            item_total = product.discounted_price * quantity
            subtotal += item_total
            cart_items.append({
                'product': product,
                'quantity': quantity,
                'subtotal': item_total
            })
        except Product.DoesNotExist:
            pass
    
    # Get user's addresses
    addresses = Address.objects.filter(user=request.user)
    default_address = addresses.filter(is_default=True).first()
    
    # Calculate totals
    tax = subtotal * Decimal('0.16')
    shipping = Decimal('200') if subtotal < Decimal('5000') else Decimal('0')
    total = subtotal + tax + shipping
    
    payment_method = request.GET.get('payment', 'cod')
    
    context = {
        'cart_items': cart_items,
        'addresses': addresses,
        'default_address': default_address,
        'subtotal': subtotal,
        'tax': tax,
        'shipping': shipping,
        'total': total,
        'payment_method': payment_method,
    }
    
    return render(request, 'store/checkout.html', context)

    cart = request.session.get('cart', {})
    
    if not cart:
        messages.warning(request, 'Your cart is empty.')
        return redirect('store:cart')
    
    cart_items = []
    subtotal = 0
    
    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            item_total = product.discounted_price * quantity
            subtotal += item_total
            cart_items.append({
                'product': product,
                'quantity': quantity,
                'subtotal': item_total
            })
        except Product.DoesNotExist:
            pass
    
    # Get user's addresses
    addresses = Address.objects.filter(user=request.user)
    default_address = addresses.filter(is_default=True).first()
    
    # Calculate totals
    tax = subtotal * Decimal('0.16')
    shipping = Decimal('200') if subtotal < Decimal('5000') else Decimal('0')
    total = subtotal + tax + shipping
    
    payment_method = request.GET.get('payment', 'cod')
    
    context = {
        'cart_items': cart_items,
        'addresses': addresses,
        'default_address': default_address,
        'subtotal': subtotal,
        'tax': tax,
        'shipping': shipping,
        'total': total,
        'payment_method': payment_method,
    }
    
    return render(request, 'store/checkout.html', context)


# ========== WISHLIST VIEWS ==========

@login_required
@require_POST
def add_to_wishlist(request):
    data = json.loads(request.body)
    product_id = data.get('product_id')
    product = get_object_or_404(Product, id=product_id)
    
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )
    
    return JsonResponse({
        'success': True,
        'added': created,
        'wishlist_count': Wishlist.objects.filter(user=request.user).count()
    })


@login_required
def remove_from_wishlist(request, item_id):
    wishlist_item = get_object_or_404(Wishlist, id=item_id, user=request.user)
    wishlist_item.delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'new_count': Wishlist.objects.filter(user=request.user).count()
        })
    
    messages.success(request, 'Item removed from wishlist.')
    return redirect('store:account')


# ========== ADDRESS VIEWS ==========

@login_required
def add_address(request):
    if request.method == 'POST':
        address = Address.objects.create(
            user=request.user,
            address_name=request.POST.get('address_name'),
            full_name=request.POST.get('full_name'),
            phone=request.POST.get('phone'),
            address_line1=request.POST.get('address_line1'),
            address_line2=request.POST.get('address_line2', ''),
            city=request.POST.get('city'),
            state=request.POST.get('state'),
            postal_code=request.POST.get('postal_code'),
            is_default=request.POST.get('is_default') == 'on'
        )
        messages.success(request, 'Address added successfully!')
        return redirect('store:account')
    
    return render(request, 'store/add_address.html')


@login_required
def edit_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    if request.method == 'POST':
        address.address_name = request.POST.get('address_name')
        address.full_name = request.POST.get('full_name')
        address.phone = request.POST.get('phone')
        address.address_line1 = request.POST.get('address_line1')
        address.address_line2 = request.POST.get('address_line2', '')
        address.city = request.POST.get('city')
        address.state = request.POST.get('state')
        address.postal_code = request.POST.get('postal_code')
        address.is_default = request.POST.get('is_default') == 'on'
        address.save()
        
        messages.success(request, 'Address updated successfully!')
        return redirect('store:account')
    
    context = {'address': address}
    return render(request, 'store/edit_address.html', context)


@login_required
@require_POST
def delete_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    address.delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'new_count': Address.objects.filter(user=request.user).count()
        })
    
    messages.success(request, 'Address deleted successfully!')
    return redirect('store:account')


# ========== ORDER VIEWS ==========

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    context = {
        'order': order,
    }
    return render(request, 'store/order_detail.html', context)


# ========== CONTEXT PROCESSOR ==========

def common_context(request):
    categories = Category.objects.all()
    settings = SiteSettings.objects.first()
    
    cart = request.session.get('cart', {})
    cart_items_count = sum(cart.values())
    
    return {
        'categories': categories,
        'contact_info': {
            'address': settings.contact_address if settings else 'Mama Ngina University',
            'phone': settings.contact_phone if settings else '+2547 4387 4690',
            'email': settings.contact_email if settings else 'info@mnustore.ac.ke',
            'hours': settings.business_hours if settings else 'Mon-Fri: 8am - 6pm',
        },
        'cart_items_count': cart_items_count,
    }


# ========== ADMIN DASHBOARD VIEWS ==========

@login_required
@staff_member_required
def admin_dashboard(request):
    """Main admin dashboard with overview stats"""
    
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_orders = Order.objects.count()
    total_messages = ContactMessage.objects.filter(is_read=False).count()
    
    recent_orders = Order.objects.order_by('-created_at')[:10]
    low_stock = Product.objects.filter(stock__lt=5).count()
    
    today = datetime.now().date()
    today_orders = Order.objects.filter(created_at__date=today).count()
    today_revenue = Order.objects.filter(created_at__date=today).aggregate(Sum('total'))['total__sum'] or 0
    
    month_start = today.replace(day=1)
    monthly_orders = Order.objects.filter(created_at__date__gte=month_start).count()
    monthly_revenue = Order.objects.filter(created_at__date__gte=month_start).aggregate(Sum('total'))['total__sum'] or 0
    
    context = {
        'total_products': total_products,
        'total_categories': total_categories,
        'total_orders': total_orders,
        'total_messages': total_messages,
        'recent_orders': recent_orders,
        'low_stock': low_stock,
        'today_orders': today_orders,
        'today_revenue': today_revenue,
        'monthly_orders': monthly_orders,
        'monthly_revenue': monthly_revenue,
    }
    return render(request, 'store/admin/dashboard.html', context)


# ========== ADMIN PRODUCT MANAGEMENT ==========

@login_required
@staff_member_required
def admin_products(request):
    """List all products with search and filter"""
    products_list = Product.objects.all().select_related('category')
    
    search = request.GET.get('search', '')
    if search:
        products_list = products_list.filter(
            Q(name__icontains=search) | 
            Q(description__icontains=search)
        )
    
    category_id = request.GET.get('category', '')
    if category_id:
        products_list = products_list.filter(category_id=category_id)
    
    stock_status = request.GET.get('stock', '')
    if stock_status == 'low':
        products_list = products_list.filter(stock__lt=5)
    elif stock_status == 'out':
        products_list = products_list.filter(stock=0)
    
    paginator = Paginator(products_list, 20)
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)
    
    categories = Category.objects.all()
    
    context = {
        'products': products,
        'categories': categories,
        'search': search,
        'selected_category': category_id,
        'stock_status': stock_status,
    }
    return render(request, 'store/admin/products/list.html', context)


@login_required
@staff_member_required
def admin_product_add(request):
    """Add new product"""
    if request.method == 'POST':
        name = request.POST.get('name')
        category_id = request.POST.get('category')
        description = request.POST.get('description')
        price = request.POST.get('price')
        stock = request.POST.get('stock')
        is_featured = request.POST.get('is_featured') == 'on'
        is_new = request.POST.get('is_new') == 'on'
        discount_percentage = request.POST.get('discount_percentage', 0)
        image = request.FILES.get('image')
        
        if not all([name, category_id, description, price, stock]):
            messages.error(request, 'Please fill all required fields.')
            return redirect('store:admin_product_add')
        
        category = get_object_or_404(Category, id=category_id)
        product = Product.objects.create(
            name=name,
            category=category,
            description=description,
            price=price,
            stock=stock,
            is_featured=is_featured,
            is_new=is_new,
            discount_percentage=discount_percentage,
            image=image
        )
        
        messages.success(request, f'Product "{product.name}" added successfully!')
        return redirect('store:admin_products')
    
    categories = Category.objects.all()
    return render(request, 'store/admin/products/add.html', {'categories': categories})


@login_required
@staff_member_required
def admin_product_edit(request, product_id):
    """Edit existing product"""
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        product.name = request.POST.get('name')
        product.category_id = request.POST.get('category')
        product.description = request.POST.get('description')
        product.price = request.POST.get('price')
        product.stock = request.POST.get('stock')
        product.is_featured = request.POST.get('is_featured') == 'on'
        product.is_new = request.POST.get('is_new') == 'on'
        product.discount_percentage = request.POST.get('discount_percentage', 0)
        
        if request.FILES.get('image'):
            product.image = request.FILES['image']
        
        product.save()
        messages.success(request, f'Product "{product.name}" updated successfully!')
        return redirect('store:admin_products')
    
    categories = Category.objects.all()
    context = {
        'product': product,
        'categories': categories,
    }
    return render(request, 'store/admin/products/edit.html', context)


@login_required
@staff_member_required
def admin_product_delete(request, product_id):
    """Delete product"""
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        product_name = product.name
        product.delete()
        messages.success(request, f'Product "{product_name}" deleted successfully!')
        return redirect('store:admin_products')
    
    return render(request, 'store/admin/products/delete.html', {'product': product})


@login_required
@staff_member_required
def admin_product_bulk_action(request):
    """Handle bulk actions on products"""
    if request.method == 'POST':
        action = request.POST.get('action')
        product_ids = request.POST.getlist('product_ids')
        
        if not product_ids:
            messages.warning(request, 'No products selected.')
            return redirect('store:admin_products')
        
        if action == 'delete':
            Product.objects.filter(id__in=product_ids).delete()
            messages.success(request, f'{len(product_ids)} products deleted successfully.')
        elif action == 'feature':
            Product.objects.filter(id__in=product_ids).update(is_featured=True)
            messages.success(request, f'{len(product_ids)} products marked as featured.')
        elif action == 'unfeature':
            Product.objects.filter(id__in=product_ids).update(is_featured=False)
            messages.success(request, f'{len(product_ids)} products unmarked as featured.')
        
    return redirect('store:admin_products')


# ========== ADMIN CATEGORY MANAGEMENT ==========

@login_required
@staff_member_required
def admin_categories(request):
    """List all categories"""
    categories = Category.objects.annotate(product_count=Count('products'))
    return render(request, 'store/admin/categories/list.html', {'categories': categories})


@login_required
@staff_member_required
def admin_category_add(request):
    """Add new category"""
    if request.method == 'POST':
        name = request.POST.get('name')
        # icon = request.POST.get('icon')
        description = request.POST.get('description')
        
        if not name:
            messages.error(request, 'Category name is required.')
            return redirect('store:admin_category_add')
        
        from django.utils.text import slugify
        slug = slugify(name)
        
        original_slug = slug
        counter = 1
        while Category.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        category = Category.objects.create(
            name=name,
            slug=slug,
            # icon=icon,
            description=description
        )
        
        messages.success(request, f'Category "{category.name}" added successfully!')
        return redirect('store:admin_categories')
    
    return render(request, 'store/admin/categories/add.html')


@login_required
@staff_member_required
def admin_category_edit(request, category_id):
    """Edit category"""
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        category.name = request.POST.get('name')
        # category.icon = request.POST.get('icon')
        category.description = request.POST.get('description')
        category.save()
        
        messages.success(request, f'Category "{category.name}" updated successfully!')
        return redirect('store:admin_categories')
    
    return render(request, 'store/admin/categories/edit.html', {'category': category})


@login_required
@staff_member_required
def admin_category_delete(request, category_id):
    """Delete category"""
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        category_name = category.name
        category.delete()
        messages.success(request, f'Category "{category_name}" deleted successfully!')
        return redirect('store:admin_categories')
    
    return render(request, 'store/admin/categories/delete.html', {'category': category})


# ========== ADMIN ORDER MANAGEMENT ==========

@login_required
@staff_member_required
def admin_orders(request):
    """List all orders"""
    orders_list = Order.objects.all().select_related('user').order_by('-created_at')
    
    status = request.GET.get('status', '')
    if status:
        orders_list = orders_list.filter(status=status)
    
    search = request.GET.get('search', '')
    if search:
        orders_list = orders_list.filter(
            Q(order_number__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__username__icontains=search)
        )
    
    paginator = Paginator(orders_list, 20)
    page_number = request.GET.get('page')
    orders = paginator.get_page(page_number)
    
    context = {
        'orders': orders,
        'status_choices': Order.STATUS_CHOICES,
        'current_status': status,
        'search': search,
    }
    return render(request, 'store/admin/orders/list.html', context)


@login_required
@staff_member_required
def admin_order_detail(request, order_id):
    """View order details"""
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'store/admin/orders/detail.html', {'order': order})


@login_required
@staff_member_required
def admin_order_update_status(request, order_id):
    """Update order status"""
    order = get_object_or_404(Order, id=order_id)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            messages.success(request, f'Order #{order.order_number} status updated to {order.get_status_display()}')
    
    return redirect('store:admin_order_detail', order_id=order.id)


# ========== ADMIN DEALS MANAGEMENT ==========

@login_required
@staff_member_required
def admin_deals(request):
    """Manage discounted products"""
    products = Product.objects.filter(discount_percentage__gt=0).order_by('-discount_percentage')
    
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        discount = request.POST.get('discount_percentage')
        
        product = get_object_or_404(Product, id=product_id)
        product.discount_percentage = discount
        product.save()
        
        messages.success(request, f'Discount updated for "{product.name}"')
        return redirect('store:admin_deals')
    
    return render(request, 'store/admin/deals/list.html', {'products': products})


@login_required
@staff_member_required
def admin_deals_add(request):
    """Add new deal to product"""
    if request.method == 'POST':
        product_id = request.POST.get('product')
        discount = request.POST.get('discount_percentage')
        
        product = get_object_or_404(Product, id=product_id)
        product.discount_percentage = discount
        product.save()
        
        messages.success(request, f'Deal added to "{product.name}"')
        return redirect('store:admin_deals')
    
    products = Product.objects.filter(discount_percentage=0)
    return render(request, 'store/admin/deals/add.html', {'products': products})


@login_required
@staff_member_required
def admin_deals_remove(request, product_id):
    """Remove deal from product"""
    product = get_object_or_404(Product, id=product_id)
    product.discount_percentage = 0
    product.save()
    
    messages.success(request, f'Deal removed from "{product.name}"')
    return redirect('store:admin_deals')


# ========== ADMIN MESSAGES MANAGEMENT ==========

@login_required
@staff_member_required
def admin_messages(request):
    """View contact messages"""
    messages_list = ContactMessage.objects.all().order_by('-created_at')
    
    if request.GET.get('mark_read'):
        msg_id = request.GET.get('mark_read')
        msg = get_object_or_404(ContactMessage, id=msg_id)
        msg.is_read = True
        msg.save()
        return redirect('store:admin_messages')
    
    paginator = Paginator(messages_list, 20)
    page_number = request.GET.get('page')
    messages_page = paginator.get_page(page_number)
    
    return render(request, 'store/admin/messages/list.html', {'messages': messages_page})


@login_required
@staff_member_required
def admin_message_detail(request, message_id):
    """View single message"""
    message = get_object_or_404(ContactMessage, id=message_id)
    
    if not message.is_read:
        message.is_read = True
        message.save()
    
    return render(request, 'store/admin/messages/detail.html', {'message': message})


@login_required
@staff_member_required
def admin_message_delete(request, message_id):
    """Delete message"""
    message = get_object_or_404(ContactMessage, id=message_id)
    
    if request.method == 'POST':
        message.delete()
        messages.success(request, 'Message deleted successfully!')
        return redirect('store:admin_messages')
    
    return render(request, 'store/admin/messages/delete.html', {'message': message})


# ========== ADMIN SETTINGS MANAGEMENT ==========

@login_required
@staff_member_required
def admin_settings(request):
    """Manage site settings"""
    settings = SiteSettings.objects.first()
    if not settings:
        settings = SiteSettings.objects.create()
    
    if request.method == 'POST':
        settings.site_name = request.POST.get('site_name')
        settings.contact_email = request.POST.get('contact_email')
        settings.contact_phone = request.POST.get('contact_phone')
        settings.contact_address = request.POST.get('contact_address')
        settings.business_hours = request.POST.get('business_hours')
        settings.facebook = request.POST.get('facebook')
        settings.instagram = request.POST.get('instagram')
        settings.twitter = request.POST.get('twitter')
        settings.whatsapp = request.POST.get('whatsapp')
        settings.save()
        
        messages.success(request, 'Settings updated successfully!')
        return redirect('store:admin_settings')
    
    return render(request, 'store/admin/settings/index.html', {'settings': settings})


# ========== ADMIN REPORTS ==========

@login_required
@staff_member_required
def admin_reports(request):
    """View sales reports"""
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    date_from = request.GET.get('from', start_date.strftime('%Y-%m-%d'))
    date_to = request.GET.get('to', end_date.strftime('%Y-%m-%d'))
    
    orders = Order.objects.filter(created_at__date__gte=date_from, created_at__date__lte=date_to)
    
    total_orders = orders.count()
    total_revenue = orders.aggregate(Sum('total'))['total__sum'] or 0
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    top_products = OrderItem.objects.filter(
        order__in=orders
    ).values(
        'product__name'
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('price')
    ).order_by('-total_sold')[:10]
    
    context = {
        'date_from': date_from,
        'date_to': date_to,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'avg_order_value': avg_order_value,
        'top_products': top_products,
    }
    return render(request, 'store/admin/reports/index.html', context)

User = get_user_model()

# ========== ADMIN USER MANAGEMENT ==========
@login_required
@staff_member_required
def admin_users(request):
    """List all admin/staff users"""
    users_list = User.objects.filter(is_staff=True).order_by('-date_joined')
    
    # Search functionality
    search = request.GET.get('search', '')
    if search:
        users_list = users_list.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Pagination
    paginator = Paginator(users_list, 20)
    page_number = request.GET.get('page')
    users = paginator.get_page(page_number)
    
    context = {
        'users': users,
        'search': search,
    }
    return render(request, 'store/admin/users/list.html', context)


@login_required
@staff_member_required
def admin_user_add(request):
    """Add a new admin user"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        is_superuser = request.POST.get('is_superuser') == 'on'
        
        # Validation
        if not all([username, email, password, confirm_password]):
            messages.error(request, 'Please fill all required fields.')
            return redirect('store:admin_user_add')
        
        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('store:admin_user_add')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return redirect('store:admin_user_add')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return redirect('store:admin_user_add')
        
        # Create user
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=is_superuser,
            is_active=True
        )
        user.set_password(password)
        user.save()
        
        messages.success(request, f'Admin user "{username}" created successfully!')
        return redirect('store:admin_users')
    
    return render(request, 'store/admin/users/add.html')


@login_required
@staff_member_required
def admin_user_edit(request, user_id):
    """Edit an admin user"""
    user = get_object_or_404(User, id=user_id, is_staff=True)
    
    if request.method == 'POST':
        user.username = request.POST.get('username')
        user.email = request.POST.get('email')
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.is_superuser = request.POST.get('is_superuser') == 'on'
        user.is_active = request.POST.get('is_active') == 'on'
        
        # Check if username is taken
        if User.objects.filter(username=user.username).exclude(id=user.id).exists():
            messages.error(request, 'Username already exists.')
            return redirect('store:admin_user_edit', user_id=user.id)
        
        # Check if email is taken
        if User.objects.filter(email=user.email).exclude(id=user.id).exists():
            messages.error(request, 'Email already exists.')
            return redirect('store:admin_user_edit', user_id=user.id)
        
        # Update password if provided
        password = request.POST.get('password')
        if password:
            confirm_password = request.POST.get('confirm_password')
            if password == confirm_password:
                user.set_password(password)
            else:
                messages.error(request, 'Passwords do not match.')
                return redirect('store:admin_user_edit', user_id=user.id)
        
        user.save()
        messages.success(request, f'User "{user.username}" updated successfully!')
        return redirect('store:admin_users')
    
    context = {
        'edit_user': user,
    }
    return render(request, 'store/admin/users/edit.html', context)


@login_required
@staff_member_required
def admin_user_delete(request, user_id):
    """Delete an admin user (cannot delete yourself)"""
    user = get_object_or_404(User, id=user_id)
    
    # Prevent deleting yourself
    if user.id == request.user.id:
        messages.error(request, 'You cannot delete your own account.')
        return redirect('store:admin_users')
    
    if request.method == 'POST':
        username = user.username
        user.delete()
        messages.success(request, f'User "{username}" deleted successfully!')
        return redirect('store:admin_users')
    
    context = {
        'delete_user': user,
    }
    return render(request, 'store/admin/users/delete.html', context)


@login_required
@staff_member_required
def admin_user_toggle_status(request, user_id):
    """Toggle admin status (activate/deactivate)"""
    user = get_object_or_404(User, id=user_id)
    
    # Prevent toggling yourself
    if user.id == request.user.id:
        messages.error(request, 'You cannot modify your own status.')
        return redirect('store:admin_users')
    
    user.is_active = not user.is_active
    user.save()
    
    status = "activated" if user.is_active else "deactivated"
    messages.success(request, f'User "{user.username}" {status} successfully!')
    return redirect('store:admin_users')

def csrf_failure(request, reason=""):
    return render(request, 'store/csrf_failure.html', {'reason': reason}, status=403)