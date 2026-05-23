#!/bin/bash

# RealVilla Project Setup Script
# This script automates the setup process for the RealVilla Next.js application

set -e  # Exit on any error

echo "=================================="
echo "RealVilla Project Setup"
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20.x or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Check for .env.local file
echo ""
echo "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found!"
    print_info "Please create a .env.local file with the required environment variables."
    print_info "See SETUP.md for the complete list of required variables."
    echo ""
    read -p "Do you want to continue without .env.local? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Setup cancelled. Please create .env.local and run this script again."
        exit 1
    fi
else
    print_success ".env.local file found"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
print_info "This may take a few minutes..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Optional: Build the project
echo ""
read -p "Do you want to build the project now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed. Please check the error messages above."
        exit 1
    fi
fi

# Setup complete
echo ""
echo "=================================="
print_success "Setup completed successfully!"
echo "=================================="
echo ""
print_info "Next steps:"
echo "  1. Ensure your .env.local file has all required variables (see SETUP.md)"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:3000 in your browser"
echo "  4. Access Sanity Studio at http://localhost:3000/studio"
echo ""
print_info "For more information, see SETUP.md"
echo ""