#!/usr/bin/env python
"""
Helper script to start ngrok and update Django settings
Run this alongside your Django server
"""

import subprocess
import requests
import time
import json
import os
import sys

def start_ngrok():
    """
    Start ngrok and get the public URL
    """
    print("Starting ngrok...")
    
    # Kill any existing ngrok processes
    subprocess.run(["pkill", "-f", "ngrok"], capture_output=True)
    
    # Start ngrok in the background
    ngrok_process = subprocess.Popen(
        ["ngrok", "http", "8000", "--log=stdout"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    time.sleep(3)
    
    try:
        response = requests.get("http://localhost:4040/api/tunnels")
        tunnels = response.json()
        public_url = tunnels['tunnels'][0]['public_url']
        print(f"\n{'='*50}")
        print(f" ngrok started successfully!")
        print(f" Public URL: {public_url}")
        print(f"{'='*50}\n")
        
        with open('.env.ngrok', 'w') as f:
            f.write(f"NGROK_URL={public_url}\n")
            f.write(f"MPESA_CALLBACK_URL={public_url}/mpesa/callback/\n")
        
        print("ℹ Callback URL for M-Pesa:")
        print(f"   {public_url}/mpesa/callback/\n")
        
        return public_url
        
    except Exception as e:
        print(f" Error getting ngrok URL: {e}")
        print("Make sure ngrok is installed and running")
        return None

def show_instructions():
    """
    Show setup instructions
    """
    print("\n" + "="*50)
    print("M-PESA SANDBOX SETUP INSTRUCTIONS")
    print("="*50)
    print("""
1. Install ngrok if not installed:
   $ curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   $ echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   $ sudo apt update && sudo apt install ngrok

   OR download from: https://ngrok.com/download

2. Start Django server in one terminal:
   $ python manage.py runserver

3. Run this script in another terminal:
   $ python start_ngrok.py

4. Use the displayed ngrok URL in your M-Pesa requests
    """)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        show_instructions()
    else:
        start_ngrok()