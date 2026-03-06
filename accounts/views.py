from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from .forms import CustomUserCreationForm


def login_view(request):
    return render(request, 'accounts/login.html')


def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Explicitly specify the backend for login
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            messages.success(request, 'Registration successful!')
            
            # Try getting the 'next' parameter or default to home
            next_url = request.GET.get('next') or request.POST.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('store:home')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'accounts/register.html', {'form': form})