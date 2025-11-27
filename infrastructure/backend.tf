# Azure Function App Infrastructure

# Service Plan for Functions (Consumption/Serverless)
resource "azurerm_service_plan" "function_plan" {
  name                = "${var.prefix}-function-plan"
  location            = "centralus"  # Try different region for quota
  resource_group_name = azurerm_resource_group.resume.name
  os_type             = "Linux"
  sku_name            = "Y1"  # Y1 = Consumption (serverless, pay-per-execution)

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Storage Account for Function App (separate from website storage)
resource "azurerm_storage_account" "function_storage" {
  name                     = "${var.prefix}funcsa${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.resume.name
  location                 = "centralus"  # Match function plan region
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Application Insights for monitoring
resource "azurerm_application_insights" "function_insights" {
  name                = "${var.prefix}-function-insights"
  location            = "centralus"  # Match function plan region
  resource_group_name = azurerm_resource_group.resume.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.function_workspace.id

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Log Analytics Workspace for Application Insights
resource "azurerm_log_analytics_workspace" "function_workspace" {
  name                = "${var.prefix}-function-workspace"
  location            = "centralus"
  resource_group_name = azurerm_resource_group.resume.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Linux Function App
resource "azurerm_linux_function_app" "resume_api" {
  name                       = "${var.prefix}-resume-api"
  location                   = "centralus"  # Match function plan region
  resource_group_name        = azurerm_resource_group.resume.name
  service_plan_id            = azurerm_service_plan.function_plan.id
  storage_account_name       = azurerm_storage_account.function_storage.name
  storage_account_access_key = azurerm_storage_account.function_storage.primary_access_key

  site_config {
    application_stack {
      python_version = "3.11"
    }

    cors {
      allowed_origins = [
        "https://nvastola.com",
        "https://www.nvastola.com",
        "http://localhost:8000"  # For local testing
      ]
      support_credentials = false
    }
  }

  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"       = "python"
    "AzureWebJobsStorage"            = azurerm_storage_account.resume.primary_connection_string
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.function_insights.instrumentation_key
    "WEBSITE_RUN_FROM_PACKAGE"       = "1"
  }

  tags = {
    environment = "production"
    project     = "cloud-resume-challenge"
  }
}

# Azure Table for visitor count
resource "azurerm_storage_table" "visitor_count" {
  name                 = "VisitorCount"
  storage_account_name = azurerm_storage_account.resume.name
}