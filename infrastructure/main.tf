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

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "noahterraformstate"
    container_name       = "tfstate"
    key                  = "cloud-resume.tfstate"
  }
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