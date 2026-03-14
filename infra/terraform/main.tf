#GCP APIsの有効化

resource "google_project_service" "storage" {
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "aiplatform" {
  service            = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

#GCSバケット
resource "google_storage_bucket" "flower_images" {
  name          = var.gcs_bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true
  public_access_prevention = "inherited"

  cors {
    origin          = ["http://localhost:3000", "http://localhost:3005"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    project     = "flower-diary"
  }

  depends_on = [google_project_service.storage]
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.flower_images.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

