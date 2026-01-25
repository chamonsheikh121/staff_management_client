# AWS Deployment Guide - Staff Management Client

This guide will help you deploy the Staff Management Client to AWS using the CI/CD pipeline.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- GitHub Account
- Docker installed locally (for testing)
- AWS CLI installed and configured

## 🚀 Quick Setup

### Step 1: AWS Infrastructure Setup

#### 1.1 Create ECR Repository

```bash
# Login to AWS
aws configure

# Create ECR repository
aws ecr create-repository \
    --repository-name staff-management-client \
    --region us-east-1

# Output will show repository URI - save this!
```

#### 1.2 Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster \
    --cluster-name staff-management-cluster \
    --region us-east-1
```

#### 1.3 Create Task Definition

Create a file `task-definition.json`:

```json
{
  "family": "staff-management-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "staff-management-client",
      "image": "YOUR_ECR_REPOSITORY_URI:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://your-backend-api.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/staff-management-client",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskRole"
}
```

Register the task definition:

```bash
aws ecs register-task-definition \
    --cli-input-json file://task-definition.json
```

#### 1.4 Create ECS Service

```bash
# Create a security group first
aws ec2 create-security-group \
    --group-name staff-management-sg \
    --description "Security group for staff management client" \
    --vpc-id YOUR_VPC_ID

# Add inbound rule for port 3000
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0

# Create ECS service
aws ecs create-service \
    --cluster staff-management-cluster \
    --service-name staff-management-service \
    --task-definition staff-management-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[YOUR_SUBNET_1,YOUR_SUBNET_2],securityGroups=[YOUR_SECURITY_GROUP_ID],assignPublicIp=ENABLED}"
```

#### 1.5 Create CloudWatch Log Group

```bash
aws logs create-log-group \
    --log-group-name /ecs/staff-management-client \
    --region us-east-1
```

### Step 2: GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |

### Step 3: Update CI/CD Configuration

The pipeline is already configured in `.github/workflows/ci-cd.yml`. Make sure to update these values if needed:

```yaml
env:
  AWS_REGION: us-east-1  # Your AWS region
  ECR_REPOSITORY: staff-management-client
  ECS_SERVICE: staff-management-service
  ECS_CLUSTER: staff-management-cluster
  ECS_TASK_DEFINITION: staff-management-task
  CONTAINER_NAME: staff-management-client
```

### Step 4: Deploy

1. **Push to main branch to trigger deployment:**

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

2. **Monitor the deployment:**
   - Go to GitHub → Actions tab
   - Watch the pipeline progress
   - All steps should turn green ✅

3. **Verify deployment:**

```bash
# Get service details
aws ecs describe-services \
    --cluster staff-management-cluster \
    --services staff-management-service

# Get task public IP
aws ecs list-tasks \
    --cluster staff-management-cluster \
    --service-name staff-management-service

# Describe task to get ENI
aws ecs describe-tasks \
    --cluster staff-management-cluster \
    --tasks TASK_ARN

# Access your application
# http://PUBLIC_IP:3000
```

## 🧪 Local Testing

### Test Docker Build Locally

```bash
# Build Docker image
docker build -t staff-management-client:local .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  staff-management-client:local

# Access: http://localhost:3000
```

### Test with Docker Compose

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Troubleshooting

### Pipeline Fails at Docker Build

**Issue:** Docker build fails with memory errors

**Solution:**
```yaml
# In .github/workflows/ci-cd.yml, add:
- name: Free Disk Space
  run: |
    sudo rm -rf /usr/share/dotnet
    sudo rm -rf /opt/ghc
```

### ECS Task Fails to Start

**Issue:** Task stops immediately after starting

**Solution:**
1. Check CloudWatch logs:
```bash
aws logs tail /ecs/staff-management-client --follow
```

2. Common issues:
   - Missing environment variables
   - Incorrect port mapping
   - Invalid task definition

### Cannot Access Application

**Issue:** Public IP doesn't respond

**Solution:**
1. Verify security group allows port 3000
2. Check if task is running:
```bash
aws ecs describe-tasks --cluster staff-management-cluster --tasks TASK_ARN
```

3. Ensure public IP is assigned:
```yaml
assignPublicIp=ENABLED
```

## 🌐 Production Setup with Load Balancer (Recommended)

### Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name staff-management-alb \
    --subnets YOUR_SUBNET_1 YOUR_SUBNET_2 \
    --security-groups YOUR_SECURITY_GROUP_ID \
    --scheme internet-facing

# Create Target Group
aws elbv2 create-target-group \
    --name staff-management-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id YOUR_VPC_ID \
    --target-type ip \
    --health-check-path /

# Create Listener
aws elbv2 create-listener \
    --load-balancer-arn YOUR_ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=YOUR_TARGET_GROUP_ARN
```

### Update ECS Service with ALB

```bash
aws ecs update-service \
    --cluster staff-management-cluster \
    --service staff-management-service \
    --load-balancers targetGroupArn=YOUR_TARGET_GROUP_ARN,containerName=staff-management-client,containerPort=3000
```

## 📊 Monitoring

### CloudWatch Metrics

Monitor these key metrics in CloudWatch:
- CPU Utilization
- Memory Utilization
- Request Count
- Target Response Time

### Set Up Alarms

```bash
aws cloudwatch put-metric-alarm \
    --alarm-name high-cpu-utilization \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

## 🔐 Security Best Practices

1. **Use IAM Roles:** Don't use root credentials
2. **Rotate Secrets:** Regularly rotate AWS access keys
3. **Enable VPC:** Use private subnets with NAT Gateway
4. **SSL/TLS:** Use HTTPS with ACM certificates
5. **Secrets Manager:** Store sensitive data in AWS Secrets Manager

## 💰 Cost Optimization

1. **Right-size Tasks:** Start with minimal CPU/memory
2. **Use Spot Instances:** For non-critical environments
3. **Enable Auto Scaling:** Scale based on demand
4. **Set up Budgets:** Monitor and alert on costs

```bash
aws budgets create-budget \
    --account-id YOUR_ACCOUNT_ID \
    --budget file://budget.json \
    --notifications-with-subscribers file://notifications.json
```

## 🔄 Rollback Strategy

If deployment fails:

```bash
# Rollback to previous task definition
aws ecs update-service \
    --cluster staff-management-cluster \
    --service staff-management-service \
    --task-definition staff-management-task:PREVIOUS_REVISION

# Force new deployment
aws ecs update-service \
    --cluster staff-management-cluster \
    --service staff-management-service \
    --force-new-deployment
```

## 📝 Environment Variables

### Required

- `NEXT_PUBLIC_API_URL` - Backend API endpoint

### Optional

- `NODE_ENV` - Environment (production/development)
- `PORT` - Application port (default: 3000)

## 🚦 Pipeline Stages

1. **Install** - Install dependencies
2. **Lint** - Run ESLint and type checking
3. **Test** - Run unit tests
4. **Build** - Build Next.js application
5. **Docker** - Build and push Docker image to ECR
6. **Deploy** - Deploy to ECS (main branch only)

## 📞 Support

For issues:
1. Check CloudWatch logs
2. Review GitHub Actions logs
3. Verify AWS service status
4. Check security group rules

## 🎯 Next Steps

- [ ] Set up custom domain with Route 53
- [ ] Configure SSL/TLS with ACM
- [ ] Set up auto-scaling policies
- [ ] Configure CloudFront for CDN
- [ ] Implement blue-green deployment
- [ ] Set up monitoring dashboards
