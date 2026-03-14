output "bucket_name" {
  value       = google_storage_bucket.flower_images.name
  description = "作成されたGCSバケット名"
}

output "bucket_url" {
  value       = google_storage_bucket.flower_images.url
  description = "GCSバケットのURL"
}

output "project_id" {
  value       = var.project_id
  description = "GCPプロジェクトID"
}

output "region" {
  value       = var.region
  description = "デプロイされたリージョン"
}

