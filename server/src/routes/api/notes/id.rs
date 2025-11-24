use axum::{Extension, Json, extract::Path};
use color_eyre::eyre::eyre;
use sea_orm::EntityTrait;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::note,
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    routes::api::notes::NoteResponse,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_note))
}

/// Get single note
#[utoipa::path(
    method(get),
    path = "/",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_note(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    Ok(Json(note.into()))
}
