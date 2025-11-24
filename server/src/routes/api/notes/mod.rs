mod id;

use axum::{Extension, Json};
use axum_valid::Valid;
use chrono::{DateTime, Utc};
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{
    entity::{note, user},
    errors::AxumResult,
    middlewares::UnauthorizedError,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(create_note, get_notes))
        .nest("/{id}", id::routes())
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
impl From<Vec<note::Model>> for ManyNotesResponse {
    fn from(notes: Vec<note::Model>) -> Self {
        ManyNotesResponse {
            notes: notes.into_iter().map(NoteResponse::from).collect(),
        }
    }
}

#[derive(Serialize, ToSchema)]
pub struct NoteCreateResponse {
    pub success: bool,
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct NoteCreateRequest {
    pub title: String,
    pub content: String,
}

/// Create note
#[utoipa::path(
    method(post),
    path = "/",
    responses(
        (status = OK, description = "Success", body = NoteCreateResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn create_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Valid(Json(body)): Valid<Json<NoteCreateRequest>>,
) -> AxumResult<Json<NoteCreateResponse>> {
    let model = note::ActiveModel {
        user_id: Set(user.id),
        title: Set(body.title),
        content: Set(body.content),
        created_at: Set(Utc::now()),
        ..Default::default()
    };

    model.insert(&state.db).await?;

    Ok(Json(NoteCreateResponse { success: true }))
}

#[derive(Serialize, ToSchema)]
pub struct NoteResponse {
    pub id: i32,
    pub user_id: i32,
    pub created_at: DateTime<Utc>,
    pub title: String,
    pub content: String,
}

#[derive(Serialize, ToSchema)]
pub struct ManyNotesResponse {
    pub notes: Vec<NoteResponse>,
}

/// Get all notes
#[utoipa::path(
    method(get),
    path = "/",
    responses(
        (status = OK, description = "Success", body = ManyNotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_notes(Extension(state): Extension<AppState>) -> AxumResult<Json<ManyNotesResponse>> {
    let notes = note::Entity::find().all(&state.db).await?;
    Ok(Json(notes.into()))
}
