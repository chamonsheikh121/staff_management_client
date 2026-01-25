#!/bin/bash

# Server Setup Script for Staff Management Client
# Run this script on your server to prepare it for deployment

set -e

echo "🚀 Staff Management Client - Server Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}⚠️  Please don't run as root. Run as your deployment user.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running as user: $(whoami)${NC}"
echo ""

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
sudo apt-get install -y curl git build-essential

# Install Node.js 20
echo -e "${YELLOW}📦 Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Install Bun
echo -e "${YELLOW}📦 Installing Bun...${NC}"
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    echo -e "${GREEN}✅ Bun installed: $(bun --version)${NC}"
else
    echo -e "${GREEN}✅ Bun already installed: $(bun --version)${NC}"
fi

# Install PM2
echo -e "${YELLOW}📦 Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

# Setup PM2 startup
echo -e "${YELLOW}⚙️  Setting up PM2 startup...${NC}"
pm2 startup systemd -u $(whoami) --hp $HOME | grep -E '^sudo' | bash || true
echo -e "${GREEN}✅ PM2 startup configured${NC}"

# Create deployment directory
read -p "Enter deployment directory path (default: ~/apps/staff-management-client): " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-~/apps/staff-management-client}

echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
mkdir -p $DEPLOY_DIR
echo -e "${GREEN}✅ Directory created: $DEPLOY_DIR${NC}"

# Setup firewall
echo -e "${YELLOW}🔥 Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 3000/tcp  # Application port (adjust if needed)
    sudo ufw --force enable
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall setup${NC}"
fi

# Setup Nginx (optional reverse proxy)
read -p "Do you want to install Nginx as reverse proxy? (y/n): " INSTALL_NGINX
if [ "$INSTALL_NGINX" = "y" ]; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    sudo apt-get install -y nginx
    
    # Create Nginx config
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter application port (default: 3000): " APP_PORT
    APP_PORT=${APP_PORT:-3000}
    
    sudo tee /etc/nginx/sites-available/staff-management <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/staff-management /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
    
    echo -e "${GREEN}✅ Nginx installed and configured${NC}"
    
    # Optional: Install SSL with Let's Encrypt
    read -p "Do you want to install SSL certificate with Let's Encrypt? (y/n): " INSTALL_SSL
    if [ "$INSTALL_SSL" = "y" ]; then
        sudo apt-get install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d ${DOMAIN}
        echo -e "${GREEN}✅ SSL certificate installed${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "============================================"
echo "📝 Summary"
echo "============================================"
echo "Node.js: $(node --version)"
echo "Bun: $(bun --version)"
echo "PM2: Installed"
echo "Deployment Directory: $DEPLOY_DIR"
echo ""
echo "============================================"
echo "🔐 GitHub Secrets Setup"
echo "============================================"
echo "Add these secrets to your GitHub repository:"
echo ""
echo "SSH_PRIVATE_KEY:"
echo "  - Generate with: ssh-keygen -t ed25519 -C 'github-actions'"
echo "  - Copy private key and add to GitHub secrets"
echo "  - Add public key to server: ssh-copy-id user@server"
echo ""
echo "SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "SERVER_USER: $(whoami)"
echo "SERVER_PORT: 22"
echo "DEPLOY_PATH: $DEPLOY_DIR"
echo "APP_PORT: 3000 (or your custom port)"
echo "NEXT_PUBLIC_API_URL: <your-backend-api-url>"
echo ""
echo "============================================"
echo "📋 Next Steps"
echo "============================================"
echo "1. Generate SSH key pair for GitHub Actions"
echo "2. Add public key to ~/.ssh/authorized_keys"
echo "3. Add GitHub secrets to your repository"
echo "4. Push to main branch to trigger deployment"
echo ""
echo "To generate SSH key for GitHub Actions:"
echo "  ssh-keygen -t ed25519 -f github-deploy -C 'github-actions'"
echo "  cat github-deploy.pub >> ~/.ssh/authorized_keys"
echo "  cat github-deploy  # Copy this to GitHub secrets as SSH_PRIVATE_KEY"
echo ""
