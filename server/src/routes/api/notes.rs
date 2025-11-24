// OSTROŻNIE, PONIZSZY KOD BYL MOCNO ZROBIONY PRZEZ IDOTY KTORY CZYTAL KOD WZORCOWY I ODPOWIRDZI AI, POWODZENIA

use axum::{ Extension, Json};
use axum_valid::Valid;
use chrono::{DateTime, Utc};
use color_eyre::eyre::eyre;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{entity::{note, user}, errors::{AxumError, AxumResult}, middlewares::UnauthorizedError, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(create_note)).routes(routes!(get_notes))
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
pub struct NoteCreateResponse {
    pub success: bool,
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct NoteCreateRequest {
    //#[validate(value(min=0))]
    pub title: String,
    pub content: String,
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

/// Create note 
#[utoipa::path(
    method(post),
    path = "/",
    responses(
    (status = OK, description = "Success", body = NoteCreateResponse),
    (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Auth"
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

/// Get notes
#[utoipa::path(
    method(get),
    path = "/",
    responses(
    (status = OK, description = "Success", body = NoteCreateResponse),
    (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Auth"
)]
async fn get_notes(
    Extension(state): Extension<AppState>,
)
->AxumResult<Json<Vec<note::Model>>>{
    let notes =  note::Entity::find()
    .all(&state.db)
    .await?;

    Ok(Json(notes))
}