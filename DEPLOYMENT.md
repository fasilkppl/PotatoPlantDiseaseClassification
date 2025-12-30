# 🌿 Plant Disease Detector - AWS EC2 Deployment Guide

This guide walks you through deploying the Plant Disease Detector frontend to Amazon EC2.

## Prerequisites

- AWS Account with EC2 access
- AWS CLI configured (optional, for CLI deployment)
- Your FastAPI backend running and accessible

---

## Step 1: Launch an EC2 Instance

### Via AWS Console:

1. Go to **EC2 Dashboard** → **Launch Instance**
2. Configure:
   - **Name**: `plant-disease-detector`
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type**: `t2.micro` (free tier) or `t3.small`
   - **Key Pair**: Create or select existing
   - **Security Group**: Create new with rules:
     - SSH (port 22) - Your IP
     - HTTP (port 80) - Anywhere (0.0.0.0/0)
     - HTTPS (port 443) - Anywhere (0.0.0.0/0)
3. Click **Launch Instance**

---

## Step 2: Connect to Your Instance

```bash
# Replace with your key file and instance public IP
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# For Ubuntu AMI:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

---

## Step 3: Install Docker on EC2

### For Amazon Linux 2023:
```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
```

### For Ubuntu 22.04:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ubuntu

# Log out and back in
exit
```

---

## Step 4: Clone and Deploy the Application

### Option A: Using Git (Recommended)

```bash
# Reconnect to EC2
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# Install git
sudo dnf install git -y  # Amazon Linux
# OR
sudo apt install git -y  # Ubuntu

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Create environment file
echo "VITE_API_URL=http://YOUR_BACKEND_IP:8000" > .env

# Build and run with Docker Compose
docker-compose up -d --build
```

### Option B: Transfer Files via SCP

```bash
# From your local machine
scp -i "your-key.pem" -r ./plant-disease-detector ec2-user@your-ec2-public-ip:~/app

# Connect and deploy
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
cd ~/app
docker-compose up -d --build
```

---

## Step 5: Configure Environment Variables

Before building, update the API URL:

```bash
# Create .env file with your backend URL
echo "VITE_API_URL=http://YOUR_BACKEND_PUBLIC_IP:8000" > .env

# Rebuild the container
docker-compose down
docker-compose up -d --build
```

---

## Step 6: Verify Deployment

```bash
# Check container status
docker ps

# View logs
docker-compose logs -f

# Test locally
curl http://localhost
```

Visit `http://YOUR_EC2_PUBLIC_IP` in your browser.

---

## Step 7: (Optional) Set Up a Domain with SSL

### Using Certbot for free SSL:

```bash
# Install Certbot
sudo dnf install certbot python3-certbot-nginx -y  # Amazon Linux
# OR
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu

# Point your domain to EC2 IP first, then:
sudo certbot --nginx -d yourdomain.com
```

---

## Step 8: (Optional) Set Up Auto-Restart

```bash
# Create systemd service
sudo nano /etc/systemd/system/plant-detector.service
```

Add:
```ini
[Unit]
Description=Plant Disease Detector
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/YOUR_REPO
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable plant-detector
sudo systemctl start plant-detector
```

---

## Quick Reference Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Check container status
docker ps

# Enter container shell
docker exec -it plant-disease-detector-plant-disease-detector-1 sh
```

---

## Troubleshooting

### Container not starting?
```bash
docker-compose logs
```

### Port 80 in use?
```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

### Cannot connect to backend?
- Ensure backend security group allows traffic from frontend EC2
- Check CORS settings in FastAPI backend
- Verify `VITE_API_URL` is correct

---

## Architecture Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   User Browser  │──────▶│  EC2 (Frontend) │
│                 │       │   Nginx:80      │
└─────────────────┘       │   Docker        │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  EC2 (Backend)  │
                          │  FastAPI:8000   │
                          │  ML Model       │
                          └─────────────────┘
```

---

## Cost Estimate

- **t2.micro**: ~$8.50/month (free tier eligible)
- **t3.small**: ~$15/month
- **Data transfer**: First 100GB free

---

Happy deploying! 🌱
