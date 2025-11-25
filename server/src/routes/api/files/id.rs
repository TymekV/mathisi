use axum::{Extension, Json, extract::Path};
use color_eyre::eyre::eyre;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait};
use serde::Deserialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::{file, user},
    errors::{AxumError, AxumResult, NotFoundError},
    middlewares::UnauthorizedError,
    routes::api::files::UploadedFile,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_file, edit_file))
}

/// Get file contents
#[utoipa::path(
    method(get),
    path = "/",
    params(
        ("id" = i32, Path, description = "File ID")
    ),
    responses(
        (status = OK, description = "Success", content_type = "application/octet-stream"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Files"
)]
async fn get_file(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<Vec<u8>> {
    let file = file::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("File not found")))?;

    Ok(file.data)
}

#[derive(Deserialize, ToSchema)]
pub struct EditFile {
    pub filename: Option<String>,
    pub ocr: Option<String>,
}

/// Edit file metadata
#[utoipa::path(
    method(patch),
    path = "/",
    params(
        ("id" = i32, Path, description = "File ID")
    ),
    responses(
        (status = OK, description = "Success", body = UploadedFile),
        (status = NOT_FOUND, description = "Not found", body = NotFoundError),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Files"
)]
async fn edit_file(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
    Json(payload): Json<EditFile>,
) -> AxumResult<Json<UploadedFile>> {
    let file = file::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("File not found")))?;

    if file.user_id != user.id {
        return Err(AxumError::unauthorized(eyre!(
            "You do not have permission to edit this file"
        )));
    }

    let mut file: file::ActiveModel = file.into();

    if let Some(filename) = payload.filename {
        file.filename = Set(filename);
    }

    if let Some(ocr) = payload.ocr {
        file.ocr = Set(Some(ocr));
    }

    let file = file.update(&state.db).await?;

    Ok(Json(file.into()))
}
