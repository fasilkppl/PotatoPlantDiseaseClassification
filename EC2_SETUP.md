# EC2 Deployment Guide - Plant Disease Detector

## What you must set (your public IP)
Your backend runs on port **8000**, so the frontend must be built with:

```
VITE_API_URL=http://13.60.195.26:8000
```

This is injected at **build time** (Vite), so changing it requires rebuilding the frontend container.

## Where to place your model
Put your model file here:

```
backend/models/potatoes.h5
```

That's the only model location used (no `saved_models/`).

## Step-by-step EC2 deployment (Docker)

### 1) Create EC2 + open ports
- AMI: **Ubuntu 22.04** or **Amazon Linux 2023**
- Instance: **t2.medium+** recommended (TensorFlow can be heavy)
- Security Group inbound rules:
  - TCP **22** from *your IP* (SSH)
  - TCP **80** from `0.0.0.0/0` (frontend)
  - TCP **8000** from `0.0.0.0/0` (backend API)

### 2) SSH into EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@13.60.195.26
# Ubuntu AMI: ssh -i your-key.pem ubuntu@13.60.195.26
```

### 3) Install Docker + Compose
Amazon Linux:
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# log out/in after this
```

Ubuntu:
```bash
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# log out/in after this
```

### 4) Get the project onto EC2
```bash
git clone <YOUR_REPO_URL> plant-disease-detector
cd plant-disease-detector
```

### 5) Copy `potatoes.h5` to the server
From your local machine:
```bash
scp -i your-key.pem potatoes.h5 ec2-user@13.60.195.26:~/plant-disease-detector/backend/models/potatoes.h5
# Ubuntu AMI: replace ec2-user with ubuntu
```

### 6) Deploy
This project includes `deploy.sh` (recommended):
```bash
chmod +x deploy.sh
./deploy.sh 13.60.195.26
```

Or manually:
```bash
echo "VITE_API_URL=http://13.60.195.26:8000" > .env
docker-compose up -d --build
```

### 7) Verify
```bash
# containers
docker-compose ps

# backend health (from EC2)
curl http://localhost:8000/health

# prediction test
curl -X POST -F "file=@test.jpg" http://localhost:8000/predict
```

## Troubleshooting checklist (for "Failed to fetch")
1) **Check backend is reachable from the internet**:
   - `curl http://13.60.195.26:8000/health` from your laptop
   - If it times out → Security Group/Firewall issue.
2) **Check backend logs**:
   - `docker-compose logs -f backend`
3) **Confirm model is present in the container**:
   - `docker-compose exec backend ls -lah /app/models`
4) **Confirm frontend was built with the right API URL**:
   - `cat .env` (must be `VITE_API_URL=http://13.60.195.26:8000`)
   - then: `docker-compose up -d --build`
5) **CORS**:
   - If you see CORS errors in browser console, it should now allow `http://13.60.195.26`.

