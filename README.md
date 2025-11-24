# Cloud Resume Challenge - Frontend Infrastructure

[![Deploy Cloud Resume](https://github.com/nvastola/cloud-resume-frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/nvastola/cloud-resume-frontend/actions/workflows/deploy.yml)

> My implementation of the [Cloud Resume Challenge](https://cloudresumechallenge.dev/), featuring a fully automated CI/CD pipeline with Infrastructure as Code.

🌐 **Live Site**: [nvastola.com](https://nvastola.com)

---

## Overview

This repository contains the frontend infrastructure and deployment automation for my cloud resume website. The project demonstrates modern DevOps practices including Infrastructure as Code, automated deployments, and cost optimization strategies.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   GitHub    │────▶│GitHub Actions│────▶│  Azure Storage  │
│ (Code Repo) │     │   (CI/CD)    │     │ (Static Website)│
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ CloudFlare CDN  │
                                          │  (Global Edge)  │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                            [ nvastola.com ]
```

## Tech Stack

### Infrastructure & Cloud
- **Azure Storage** - Static website hosting
- **CloudFlare** - Global CDN, SSL/TLS, DDoS protection
- **Terraform** - Infrastructure as Code
- **Azure Resource Manager** - Cloud resource management

### CI/CD & Automation
- **GitHub Actions** - Automated deployment pipeline
- **Cypress** - End-to-end testing
- **Git** - Version control

### Cost Optimization
- Migrated from Azure Front Door ($35/month) to CloudFlare Free ($0/month)
- **97% cost reduction** while maintaining global performance
- Monthly hosting cost: < $2

## Features

### 🚀 Automated Deployment Pipeline
Every push to `main` triggers:
1. **Build** - Prepares website files
2. **Infrastructure Deployment** - Terraform provisions/updates Azure resources
3. **Website Deployment** - Syncs files to Azure Storage
4. **Cache Purge** - Clears CloudFlare cache for instant updates
5. **Smoke Tests** - Automated verification with Cypress

### 📦 Infrastructure as Code
All infrastructure defined in Terraform:
- Reproducible across environments
- Version controlled
- Self-documenting
- Easy to audit and review

### 🧪 Automated Testing
- Cypress end-to-end tests verify site functionality
- HTTP status checks ensure availability
- Runs automatically after each deployment

### 🔒 Security Best Practices
- Service Principal authentication (no personal credentials in CI/CD)
- Secrets stored in GitHub Secrets (encrypted)
- HTTPS enforced via CloudFlare
- Least-privilege IAM roles

## Project Structure

```
cloud-resume-frontend/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline configuration
├── infrastructure/
│   ├── main.tf                 # Terraform main configuration
│   ├── variables.tf            # Configurable variables
│   ├── outputs.tf              # Output values
│   └── .gitignore              # Ignore sensitive Terraform files
├── website/
│   ├── index.html              # Resume website
│   ├── styles.css
│   └── script.js
├── cypress/
│   ├── e2e/
│   │   └── resume.cy.js        # Automated tests
│   └── support/
│       ├── e2e.js
│       └── commands.js
├── cypress.config.js           # Cypress configuration
└── README.md
```

## Deployment Workflow

### Manual Deployment (Local Testing)
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Automated Deployment (Production)
```bash
git add .
git commit -m "Update resume"
git push origin main
# GitHub Actions handles the rest!
```

## CI/CD Pipeline Details

The deployment pipeline consists of four jobs:

### 1. Build
- Checks out repository code
- Prepares website files
- Creates artifact for deployment

### 2. Deploy Infrastructure
- Authenticates with Azure via Service Principal
- Initializes Terraform with remote state backend
- Plans and applies infrastructure changes
- Outputs resource information

### 3. Deploy Website
- Downloads website artifact from Build job
- Uploads files to Azure Storage `$web` container
- Initiates CloudFlare cache purge

### 4. Smoke Test
- Installs Cypress testing framework
- Runs automated end-to-end tests
- Performs HTTP status check
- Uploads test results and videos

## CloudFlare Worker

Azure Storage requires specific Host headers. A CloudFlare Worker rewrites the header:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'staticwebsite23456.z13.web.core.windows.net';
    
    const modifiedRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return fetch(modifiedRequest);
  }
};
```

This enables custom domain support without Azure Front Door's $35/month cost.

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Azure Storage (Standard LRS) | ~$0.50 |
| Azure Bandwidth | ~$0.10 |
| CloudFlare (Free Tier) | $0.00 |
| **Total** | **~$0.60** |

*Previously: Azure Front Door at $35/month*

## Setup Instructions

### Prerequisites
- Azure account with active subscription
- CloudFlare account
- Custom domain
- GitHub account
- Terraform installed locally

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nvastola/cloud-resume-frontend.git
   cd cloud-resume-frontend
   ```

2. **Configure Terraform backend**
   Create Azure Storage for Terraform state:
   ```bash
   az storage account create \
     --name <unique-name> \
     --resource-group terraform-state-rg \
     --location eastus \
     --sku Standard_LRS
   
   az storage container create \
     --name tfstate \
     --account-name <unique-name>
   ```

3. **Create Azure Service Principal**
   ```bash
   az ad sp create-for-rbac \
     --name "github-actions-cloud-resume" \
     --role contributor \
     --scopes /subscriptions/<subscription-id> \
     --sdk-auth
   ```

4. **Configure GitHub Secrets**
   Add these secrets to your GitHub repository:
   - `AZURE_CREDENTIALS` - Full JSON output from service principal
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_TENANT_ID`
   - `AZURE_STORAGE_ACCOUNT`
   - `AZURE_RESOURCE_GROUP`

5. **Update Terraform variables**
   Edit `infrastructure/variables.tf` with your values

6. **Deploy**
   ```bash
   git push origin main
   ```

## Skills Demonstrated

- ✅ Infrastructure as Code (Terraform)
- ✅ CI/CD Pipeline Development (GitHub Actions)
- ✅ Cloud Platform Management (Azure)
- ✅ CDN Configuration (CloudFlare)
- ✅ Automated Testing (Cypress)
- ✅ Version Control (Git)
- ✅ Cost Optimization
- ✅ DNS Management
- ✅ Security Best Practices (Service Principals, Secrets Management)
- ✅ DevOps Methodologies

## Lessons Learned

### Technical Challenges
1. **Azure Storage + CloudFlare Integration** - Solved Host header mismatch with CloudFlare Workers
2. **Terraform State Management** - Implemented remote backend for team collaboration
3. **CI/CD Authentication** - Configured service principal with proper IAM roles

### Cost Optimization
- Analyzed Azure cost breakdown
- Identified Front Door as primary cost driver
- Migrated to CloudFlare free tier
- Achieved 97% cost reduction

### Best Practices Implemented
- Separated infrastructure code from application code
- Used remote state for Terraform
- Implemented automated testing in deployment pipeline
- Followed principle of least privilege for service accounts

## Future Enhancements

- [ ] Add backend API (Azure Functions)
- [ ] Implement visitor counter with database
- [ ] Add monitoring and alerting (Azure Monitor)
- [ ] Implement blue-green deployments
- [ ] Add infrastructure for staging environment
- [ ] Implement automated rollback on test failure

## Resources

- [Cloud Resume Challenge](https://cloudresumechallenge.dev/)
- [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CloudFlare Workers Documentation](https://developers.cloudflare.com/workers/)

## Contact

**Noah Vastola**
- Website: [nvastola.com](https://nvastola.com)
- GitHub: [@nvastola](https://github.com/nvastola)
- LinkedIn: [Noah Vastola](https://www.linkedin.com/in/noahvastola/)

---

*This project is part of the [Cloud Resume Challenge](https://cloudresumechallenge.dev/) - a hands-on project designed to help you build skills in cloud computing, infrastructure as code, and DevOps practices.*