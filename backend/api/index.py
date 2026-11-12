# Serverless entrypoint for Vercel
import sys
import os

# Ensure backend root is in Python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
