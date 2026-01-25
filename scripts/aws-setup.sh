#!/bin/bash

# AWS Setup Script for Staff Management Client
# This script automates the AWS infrastructure setup

set -e

echo "🚀 Staff Management Client - AWS Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with AWS. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI is configured${NC}"
echo ""

# Get configuration
read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

read -p "Enter VPC ID (press Enter to create new): " VPC_ID
read -p "Enter Subnet ID 1 (press Enter to use default): " SUBNET_1
read -p "Enter Subnet ID 2 (press Enter to use default): " SUBNET_2

echo ""
echo "Configuration:"
echo "  Region: $AWS_REGION"
echo "  VPC: ${VPC_ID:-'Will use default'}"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Starting setup..."
echo ""

# 1. Create ECR Repository
echo -e "${YELLOW}📦 Creating ECR Repository...${NC}"
ECR_REPO=$(aws ecr create-repository \
    --repository-name staff-management-client \
    --region $AWS_REGION \
    2>/dev/null || echo "exists")

if [ "$ECR_REPO" != "exists" ]; then
    ECR_URI=$(echo $ECR_REPO | jq -r '.repository.repositoryUri')
    echo -e "${GREEN}✅ ECR Repository created: $ECR_URI${NC}"
else
    ECR_URI=$(aws ecr describe-repositories \
        --repository-names staff-management-client \
        --region $AWS_REGION \
        --query 'repositories[0].repositoryUri' \
        --output text)
    echo -e "${YELLOW}ℹ️  ECR Repository already exists: $ECR_URI${NC}"
fi

# 2. Create CloudWatch Log Group
echo -e "${YELLOW}📊 Creating CloudWatch Log Group...${NC}"
aws logs create-log-group \
    --log-group-name /ecs/staff-management-client \
    --region $AWS_REGION \
    2>/dev/null && echo -e "${GREEN}✅ Log group created${NC}" || echo -e "${YELLOW}ℹ️  Log group already exists${NC}"

# 3. Create ECS Cluster
echo -e "${YELLOW}🏗️  Creating ECS Cluster...${NC}"
aws ecs create-cluster \
    --cluster-name staff-management-cluster \
    --region $AWS_REGION \
    2>/dev/null && echo -e "${GREEN}✅ ECS Cluster created${NC}" || echo -e "${YELLOW}ℹ️  Cluster already exists${NC}"

# 4. Create IAM Roles
echo -e "${YELLOW}🔑 Setting up IAM Roles...${NC}"

# Execution Role
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://trust-policy.json \
    2>/dev/null && echo -e "${GREEN}✅ Execution role created${NC}" || echo -e "${YELLOW}ℹ️  Execution role already exists${NC}"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null

# Task Role
aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document file://trust-policy.json \
    2>/dev/null && echo -e "${GREEN}✅ Task role created${NC}" || echo -e "${YELLOW}ℹ️  Task role already exists${NC}"

rm trust-policy.json

# Get Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 5. Create Security Group
if [ -z "$VPC_ID" ]; then
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=isDefault,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region $AWS_REGION)
fi

echo -e "${YELLOW}🔒 Creating Security Group...${NC}"
SG_ID=$(aws ec2 create-security-group \
    --group-name staff-management-sg \
    --description "Security group for staff management client" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=staff-management-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo -e "${GREEN}✅ Security Group: $SG_ID${NC}"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION \
    2>/dev/null && echo -e "${GREEN}✅ Security group rule added${NC}" || echo -e "${YELLOW}ℹ️  Security group rule already exists${NC}"

# Get Subnets
if [ -z "$SUBNET_1" ]; then
    SUBNETS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --region $AWS_REGION)
    SUBNET_ARRAY=($SUBNETS)
    SUBNET_1=${SUBNET_ARRAY[0]}
    SUBNET_2=${SUBNET_ARRAY[1]:-$SUBNET_1}
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "============================================"
echo "📝 Summary"
echo "============================================"
echo "ECR Repository: $ECR_URI"
echo "ECS Cluster: staff-management-cluster"
echo "Security Group: $SG_ID"
echo "Subnets: $SUBNET_1, $SUBNET_2"
echo "Account ID: $ACCOUNT_ID"
echo ""
echo "============================================"
echo "🔐 GitHub Secrets (Add these to your repo)"
echo "============================================"
echo "AWS_ACCESS_KEY_ID: <your-access-key>"
echo "AWS_SECRET_ACCESS_KEY: <your-secret-key>"
echo "NEXT_PUBLIC_API_URL: <your-backend-url>"
echo ""
echo "============================================"
echo "📋 Next Steps"
echo "============================================"
echo "1. Add GitHub secrets to your repository"
echo "2. Update task-definition.json with ECR URI"
echo "3. Push to main branch to trigger deployment"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
