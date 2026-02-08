#!/bin/bash
# Brief Writer 2026 - One-click setup and run script
# Just run: bash setup_and_run.sh

set -e

echo ""
echo "=========================================="
echo "  Brief Writer 2026 - Setup"
echo "=========================================="
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "ERROR: Python not found. Install Python 3.11+ from https://python.org"
    exit 1
fi

echo "Using: $($PYTHON --version)"

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON -m venv venv
fi

# Activate
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create .env if missing
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "=========================================="
    echo "  NVIDIA API KEY NEEDED"
    echo "=========================================="
    echo ""
    echo "Open .env in a text editor and add your key:"
    echo ""
    echo "  nano .env"
    echo ""
    echo "Replace the placeholder on the NVIDIA_API_KEY line"
    echo "with your key from https://build.nvidia.com"
    echo ""
    echo "Then re-run this script."
    exit 0
fi

# Check if key is still placeholder
if grep -q "nvapi-xxxx" .env; then
    echo ""
    echo "Your .env file still has the placeholder API key."
    echo "Edit .env and add your real key, then re-run."
    echo ""
    echo "  nano .env"
    echo ""
    exit 0
fi

echo ""
echo "=========================================="
echo "  Ready! How would you like to run it?"
echo "=========================================="
echo ""
echo "  1) Web UI    - Modern browser interface (recommended)"
echo "  2) Terminal   - Command-line interactive mode"
echo ""
read -p "Enter 1 or 2 (default: 1): " choice

case "$choice" in
    2)
        echo ""
        echo "Launching terminal mode..."
        echo ""
        python main.py
        ;;
    *)
        echo ""
        echo "Starting web server..."
        echo ""
        echo "=========================================="
        echo "  Open your browser to:"
        echo ""
        echo "    http://localhost:5000"
        echo ""
        echo "  Press Ctrl+C to stop the server."
        echo "=========================================="
        echo ""
        python web.py
        ;;
esac
