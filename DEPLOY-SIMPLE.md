# Simple Server Deployment Guide

## 🚀 Deploy to Your Own Server (No Docker)

This guide shows you how to deploy the Staff Management Client to your own server using GitHub Actions CI/CD.

---

## 📋 Prerequisites

- **Server**: Linux server (Ubuntu 20.04+ recommended)
- **GitHub Repository**: Your code on GitHub
- **SSH Access**: SSH access to your server
- **Domain** (Optional): For production deployment

---

## Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
ssh your-username@your-server-ip
```

### 1.2 Run Setup Script

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/staff-management-client/main/scripts/server-setup.sh -o server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

This script will install:
- ✅ Node.js 20
- ✅ Bun (JavaScript runtime)
- ✅ PM2 (Process manager)
- ✅ Nginx (Optional - Reverse proxy)

---

## Step 2: Setup SSH Key for GitHub Actions

### 2.1 Generate SSH Key on Your Server

```bash
# Generate new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -f ~/github-deploy -C "github-actions"

# Press Enter for all prompts (no passphrase)
```

### 2.2 Add Public Key to Authorized Keys

```bash
# Add the public key to allow GitHub Actions to connect
cat ~/github-deploy.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 2.3 Copy Private Key for GitHub

```bash
# Display private key
cat ~/github-deploy

# Copy the entire output (including BEGIN and END lines)
```

---

## Step 3: GitHub Secrets Setup

### 3.1 Go to GitHub Repository

1. Navigate to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 3.2 Add Required Secrets

| Secret Name | Value | Example |
|------------|-------|---------|
| `SSH_PRIVATE_KEY` | Private key from `cat ~/github-deploy` | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST` | Your server IP or domain | `123.456.789.0` or `server.example.com` |
| `SERVER_USER` | Your SSH username | `ubuntu` or `your-username` |
| `SERVER_PORT` | SSH port (default: 22) | `22` |
| `DEPLOY_PATH` | Deployment directory on server | `/home/ubuntu/apps/staff-management-client` |
| `APP_PORT` | Application port | `3000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` or `http://backend-ip:5000` |

### 3.3 How to Add Each Secret

For each secret above:
1. Click "New repository secret"
2. Enter the **Name** (e.g., `SSH_PRIVATE_KEY`)
3. Paste the **Value**
4. Click "Add secret"

---

## Step 4: Deploy

### 4.1 Push to Main Branch

```bash
git add .
git commit -m "Setup CI/CD deployment"
git push origin main
```

### 4.2 Monitor Deployment

1. Go to GitHub → **Actions** tab
2. Click on the latest workflow run
3. Watch the progress:
   - ✅ Install Dependencies
   - ✅ Lint & Type Check
   - ✅ Build Application
   - ✅ Deploy to Server

### 4.3 Check Deployment Status

```bash
# SSH to your server
ssh your-username@your-server-ip

# Check PM2 status
pm2 status

# Check application logs
pm2 logs staff-management-client

# Restart if needed
pm2 restart staff-management-client
```

---

## Step 5: Access Your Application

### Without Domain (Direct IP)

```
http://YOUR_SERVER_IP:3000
```

### With Nginx Reverse Proxy

If you installed Nginx during setup:

```
http://YOUR_DOMAIN
```

### With SSL (HTTPS)

If you installed Let's Encrypt SSL:

```
https://YOUR_DOMAIN
```

---

## 🔧 Common Operations

### View Application Logs

```bash
ssh your-username@your-server-ip
pm2 logs staff-management-client
```

### Restart Application

```bash
ssh your-username@your-server-ip
pm2 restart staff-management-client
```

### Stop Application

```bash
ssh your-username@your-server-ip
pm2 stop staff-management-client
```

### Manual Deployment (Without GitHub Actions)

```bash
# On your local machine
cd staff-management-client

# Build
bun install
bun run build

# Deploy to server
rsync -avz --exclude 'node_modules' ./ your-username@your-server-ip:/path/to/deploy/

# On server
ssh your-username@your-server-ip
cd /path/to/deploy
bun install --production
pm2 restart staff-management-client
```

---

## 🌐 Setup Custom Domain (Optional)

### With Nginx

1. **Point your domain to server IP** (in your domain registrar DNS settings)
   - Add A record: `@` → `YOUR_SERVER_IP`
   - Add CNAME record: `www` → `YOUR_DOMAIN`

2. **Configure Nginx** (if not done during setup)

```bash
sudo nano /etc/nginx/sites-available/staff-management
```

Add:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/staff-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Install SSL Certificate**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 Security Best Practices

### 1. Firewall Setup

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 2. Change SSH Port (Optional)

```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd

# Update GitHub secret SERVER_PORT to 2222
```

### 3. Disable Password Authentication

```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

---

## 🐛 Troubleshooting

### Deployment Fails with SSH Error

**Problem**: `Permission denied (publickey)`

**Solution**:
```bash
# Verify SSH key is in authorized_keys
cat ~/.ssh/authorized_keys

# Check file permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Application Not Accessible

**Problem**: Can't access `http://server-ip:3000`

**Solution**:
```bash
# Check if app is running
pm2 status

# Check firewall
sudo ufw status

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000
```

### PM2 Shows App Errored

**Problem**: PM2 status shows "errored"

**Solution**:
```bash
# Check logs
pm2 logs staff-management-client --lines 100

# Common issues:
# 1. Missing .env file - check NEXT_PUBLIC_API_URL
# 2. Build files missing - redeploy
# 3. Port already in use - change APP_PORT
```

### Build Fails

**Problem**: GitHub Actions build step fails

**Solution**:
```bash
# Check if NEXT_PUBLIC_API_URL secret is set
# Check package.json for correct scripts
# Ensure all dependencies are in package.json
```

---

## 📊 Monitoring

### Check Application Health

```bash
# CPU and Memory usage
pm2 monit

# Application logs
pm2 logs

# System resources
htop
```

### Setup Log Rotation

PM2 automatically handles logs, but for custom rotation:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Rollback

If deployment breaks:

```bash
# SSH to server
ssh your-username@your-server-ip

# View PM2 history
pm2 list

# Rollback by redeploying previous version from GitHub
# Or manually restore from backup

# Restart
pm2 restart staff-management-client
```

---

## 💡 Tips

1. **Test Locally First**: Always test `bun run build` locally before pushing
2. **Staging Environment**: Use a separate branch (e.g., `develop`) for testing
3. **Backup**: Keep backups of your deployment directory
4. **Monitoring**: Use PM2's monitoring features
5. **Updates**: Keep Node.js, Bun, and PM2 updated

---

## 📞 Quick Reference

### Server Commands

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart staff-management-client

# Stop app
pm2 stop staff-management-client

# View Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Local Commands

```bash
# Build locally
bun run build

# Deploy manually
rsync -avz ./ user@server:/path/to/app

# Test production build locally
bun run start
```

---

## 📝 GitHub Secrets Checklist

- [ ] `SSH_PRIVATE_KEY` - Private key from server
- [ ] `SERVER_HOST` - Server IP or domain
- [ ] `SERVER_USER` - SSH username
- [ ] `SERVER_PORT` - SSH port (usually 22)
- [ ] `DEPLOY_PATH` - Deployment directory path
- [ ] `APP_PORT` - Application port (usually 3000)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL

---

**Need Help?** Check GitHub Actions logs for detailed error messages.
