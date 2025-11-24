use axum::{
    Extension, Json,
    extract::{DefaultBodyLimit, Multipart},
};
use chrono::Utc;
use color_eyre::eyre::eyre;
use infer::is_image;
use sanitize_filename::sanitize;
use sea_orm::{ActiveModelTrait, ActiveValue::Set};
use serde::Serialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::{file, user},
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(upload_files))
        .layer(DefaultBodyLimit::max(1024 * 1024 * 10)) // 10 MB
}

#[derive(Serialize, ToSchema)]
pub struct UploadedFile {
    pub id: i32,
    pub filename: String,
}

impl From<file::Model> for UploadedFile {
    fn from(file: file::Model) -> Self {
        UploadedFile {
            id: file.id,
            filename: file.filename,
        }
    }
}

#[derive(Serialize, ToSchema)]
pub struct UploadResponse {
    pub files: Vec<UploadedFile>,
}

/// Upload files
#[utoipa::path(
    method(post),
    path = "/",
    responses(
        (status = OK, description = "Success", body = UploadResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Files"
)]
async fn upload_files(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    mut multipart: Multipart,
) -> AxumResult<Json<UploadResponse>> {
    let mut files = Vec::new();

    while let Some(field) = multipart.next_field().await? {
        let filename = field.file_name().unwrap_or("image");
        let filename = sanitize(filename);

        let bytes = field.bytes().await?;

        if !is_image(&bytes) {
            return Err(AxumError::bad_request(eyre!(
                "Only image files are allowed"
            )));
        }

        let file = file::ActiveModel {
            user_id: Set(user.id),
            created_at: Set(Utc::now()),
            filename: Set(filename),
            data: Set(bytes.to_vec()),
            ..Default::default()
        };

        let inserted = file.insert(&state.db).await?;
        files.push(inserted.into());
    }

    Ok(Json(UploadResponse { files }))
}
