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