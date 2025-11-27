output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.resume.name
}

output "primary_web_endpoint" {
  description = "Primary web endpoint URL"
  value       = azurerm_storage_account.resume.primary_web_endpoint
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.resume.name
}

output "function_app_name" {
  description = "Name of the Function App"
  value       = azurerm_linux_function_app.resume_api.name
}

output "function_app_url" {
  description = "URL of the Function App"
  value       = "https://${azurerm_linux_function_app.resume_api.default_hostname}/api/GetVisitorCount"
}

output "function_app_hostname" {
  description = "Hostname of the Function App"
  value       = azurerm_linux_function_app.resume_api.default_hostname
}