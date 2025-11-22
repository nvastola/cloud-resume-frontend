terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0, < 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Commenting out backend for local testing
  # backend "azurerm" {
  #   resource_group_name  = "terraform-state-rg"
  #   storage_account_name = "noahterraformstate"
  #   container_name       = "tfstate"
  #   key                  = "cloud-resume.tfstate"
  # }
}

provider "azurerm" {
  features {}
}

# Generate random string for unique storage account name
resource "random_string" "storage_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "resume" {
  name     = "CCR"
  location = var.location
}

# Storage Account
resource "azurerm_storage_account" "resume" {
  name                     = "staticwebsite23456"
  resource_group_name      = azurerm_resource_group.resume.name
  location                 = azurerm_resource_group.resume.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Azure Front Door (CDN) Profile
resource "azurerm_cdn_frontdoor_profile" "resume" {
  name                     = "cdn-noah-123"
  resource_group_name      = azurerm_resource_group.resume.name
  sku_name                 = "Standard_AzureFrontDoor"
  response_timeout_seconds = 60

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Front Door Endpoint
resource "azurerm_cdn_frontdoor_endpoint" "resume" {
  name                     = "staticwebsite"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.resume.id

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Front Door Origin Group
resource "azurerm_cdn_frontdoor_origin_group" "resume" {
  name                     = "default-origin-group"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.resume.id
  session_affinity_enabled = false

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 3
  }

  health_probe {
    path                = "/index.html"
    request_type        = "HEAD"
    protocol            = "Https"
    interval_in_seconds = 100
  }
}

# Front Door Origin
resource "azurerm_cdn_frontdoor_origin" "resume" {
  name                          = "default-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.resume.id

  enabled                        = true
  host_name                      = azurerm_storage_account.resume.primary_web_host
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = azurerm_storage_account.resume.primary_web_host
  priority                       = 1
  weight                         = 1000
  certificate_name_check_enabled = true
}

# Front Door Route
resource "azurerm_cdn_frontdoor_route" "resume" {
  name                            = "default-route"
  cdn_frontdoor_endpoint_id       = azurerm_cdn_frontdoor_endpoint.resume.id
  cdn_frontdoor_origin_group_id   = azurerm_cdn_frontdoor_origin_group.resume.id
  cdn_frontdoor_origin_ids        = [azurerm_cdn_frontdoor_origin.resume.id]
  cdn_frontdoor_custom_domain_ids = [
    azurerm_cdn_frontdoor_custom_domain.nvastola.id,
    azurerm_cdn_frontdoor_custom_domain.www_nvastola.id
  ]

  supported_protocols    = ["Http", "Https"]
  patterns_to_match      = ["/*"]
  forwarding_protocol    = "HttpsOnly"
  link_to_default_domain = true
  https_redirect_enabled = true

  depends_on = [
    azurerm_cdn_frontdoor_origin.resume
  ]
}

# Custom Domain - nvastola.com
resource "azurerm_cdn_frontdoor_custom_domain" "nvastola" {
  name                     = "nvastola-com-eaa7"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.resume.id
  host_name                = "nvastola.com"

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

# Custom Domain - www.nvastola.com
resource "azurerm_cdn_frontdoor_custom_domain" "www_nvastola" {
  name                     = "www-nvastola-com-b7d6"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.resume.id
  host_name                = "www.nvastola.com"

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}