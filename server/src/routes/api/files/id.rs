use axum::{Extension, extract::Path};
use color_eyre::eyre::eyre;
use sea_orm::EntityTrait;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::file,
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_file))
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
