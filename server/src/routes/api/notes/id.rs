use axum::{Extension, Json, body, extract::Path};
use color_eyre::eyre::eyre;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait};
use serde::Deserialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::{note, user},
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    routes::api::notes::NoteResponse,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_note))
        .routes(routes!(edit_note))
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

#[derive(Deserialize, ToSchema)]
pub struct EditNote {
    pub title: Option<String>,
    pub content: Option<String>,
    pub public: Option<bool>,
}

/// Edit note
#[utoipa::path(
    method(patch),
    path = "/",
    params(
        ("id" = i32, Path, description = "Note id")
    ),
    responses(
        (status = OK, description = "Success", body = NoteResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn edit_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
    Json(payload): Json<EditNote>,
) -> AxumResult<Json<NoteResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    if note.user_id != user.id {
        return Err(AxumError::unauthorized(eyre!(
            "You do not have permission to edit this note"
        )));
    }

    let mut note: note::ActiveModel = note.into();

    if let Some(content) = payload.content {
        note.content = Set(content);
    }

    if let Some(title) = payload.title {
        note.title = Set(title);
    }

    if let Some(public) = payload.public {
        note.public = Set(public);
    }

    let note = note.update(&state.db).await?;

    Ok(Json(note.into()))
}
