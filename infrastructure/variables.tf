variable "prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "noah"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "custom_domain" {
  description = "Custom domain name for CDN endpoint"
  type        = string
  default     = "nvastola.com"
}