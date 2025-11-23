// OSTROŻNIE, PONIZSZY KOD BYL MOCNO ZROBIONY PRZEZ IDOTY KTORY CZYTAL KOD WZORCOWY I ODPOWIRDZI AI, POWODZENIA

use axum::{ Extension, Json, extract::Path};
use chrono::{DateTime, Utc};
use color_eyre::eyre::eyre;
use http::StatusCode;
use sea_orm::{ EntityTrait};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{entity::note, errors::{AxumError, AxumResult}, middlewares::UnauthorizedError, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_note))
}
#[derive(Serialize, ToSchema)]
pub struct NoteResponse {
    pub id: i32,
    pub user_id: i32,

    pub created_at: DateTime<Utc>,

    pub title: String,
    pub content: String,
}
#[derive(Deserialize, ToSchema, Validate)]
pub struct NoteRequest {
    //#[validate(value(min=0))]
    pub id : i32,
}
impl From<note::Model> for NoteResponse {
    fn from(note: note::Model) -> Self {
        NoteResponse {
            id: note.id,
            user_id: note.user_id,
            created_at: note.created_at,
            title: note.title,
            content: note.content,
        }
    }
}

// Single note data
#[utoipa::path(
    method(get),
    path = "/{id}",
    responses(
        (status = OK, description = "Success", body = NoteResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Auth"
)]
#[axum::debug_handler]
async fn get_note(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<Json<note::Model>> { // Changed return type for simplicity

    let note_option = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;
        
        Ok(Json(note_option))
}