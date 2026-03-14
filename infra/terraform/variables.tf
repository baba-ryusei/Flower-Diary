variable "project_id" {
  type        = string
  description = "GCPプロジェクトID"
}

variable "region" {
  type        = string
  description = "asia-northeast1"
}

variable "environment" {
  type        = string
  description = "環境名(dev, prod)"
  default     = "dev"
}

variable "gcs_bucket_name" {
  type        = string
  description = "画像保存用のバケット名"
}
