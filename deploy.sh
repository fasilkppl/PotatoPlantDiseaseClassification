#!/bin/bash

# Plant Disease Detector - EC2 Deployment Script
# Run this script on your EC2 instance after cloning the repository

set -e

echo "Plant Disease Detector - Deployment Script"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum update -y 2>/dev/null || sudo apt-get update -y
    sudo yum install -y docker 2>/dev/null || sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "Docker installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed"
fi

# Determine public IP (priority: arg1 -> PUBLIC_IP env -> EC2 metadata)
PUBLIC_IP="${1:-${PUBLIC_IP:-}}"

if [ -z "$PUBLIC_IP" ]; then
  # Try IMDSv2 (works when EC2 enforces token)
  TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
  if [ -n "$TOKEN" ]; then
    PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 || true)
  fi
fi

if [ -z "$PUBLIC_IP" ]; then
  # Fallback (IMDSv1 or non-EC2 environments)
  PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
fi

if [ -z "$PUBLIC_IP" ]; then
  echo "⚠️  Could not auto-detect EC2 public IP."
  echo "   Re-run as: ./deploy.sh YOUR_PUBLIC_IP"
  exit 1
fi

echo "Public IP: $PUBLIC_IP"

# Create .env file for docker-compose variable substitution
echo "Creating .env file..."
echo "VITE_API_URL=http://${PUBLIC_IP}:8000" > .env

echo "Using VITE_API_URL=$(cat .env)"

# Check if model exists
if [ ! -f "backend/models/potatoes.h5" ]; then
    echo "⚠️  WARNING: Model not found at backend/models/potatoes.h5"
    echo "   Place your model file here:"
    echo "   backend/models/potatoes.h5"
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose down 2>/dev/null || true

docker-compose up -d --build

echo ""
echo "=============================================="
echo "Deployment Complete!"
echo ""
echo "Frontend:    http://${PUBLIC_IP}"
echo "Backend API: http://${PUBLIC_IP}:8000"
echo "Health:      http://${PUBLIC_IP}:8000/health"
echo ""
echo "Useful Commands:"
echo "  docker-compose logs -f        # View logs"
echo "  docker-compose restart        # Restart services"
echo "  docker-compose down           # Stop services"
echo "=============================================="

