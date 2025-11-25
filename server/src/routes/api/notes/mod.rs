mod id;

use axum::{Extension, Json};
use axum_valid::Valid;
use chrono::{DateTime, Utc};
use color_eyre::eyre::Result;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait, ModelTrait,
    PaginatorTrait, QueryFilter, QueryOrder,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{
    entity::{note, save, user},
    errors::AxumResult,
    middlewares::UnauthorizedError,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(create_note, get_notes))
        .routes(routes!(get_bookmarked_notes))
        .nest("/{id}", id::routes())
}

// impl From<note::Model> for NoteResponse {
//     fn from(note: note::Model) -> Self {
//         NoteResponse {
//             id: note.id,
//             user_id: note.user_id,
//             created_at: note.created_at,
//             title: note.title,
//             content: note.content,
//             public: note.public,
//         }
//     }
// }

impl note::Model {
    pub async fn to_response(&self, db: &DatabaseConnection) -> Result<NoteResponse> {
        let saves = self.find_related(save::Entity).count(db).await? as i32;

        Ok(NoteResponse {
            id: self.id,
            user_id: self.user_id,
            created_at: self.created_at,
            title: self.title.clone(),
            content: self.content.clone(),
            public: self.public,
            saves,
        })
    }
}

impl ManyNotesResponse {
    pub async fn response_from_array(
        notes: Vec<note::Model>,
        db: &DatabaseConnection,
    ) -> Result<ManyNotesResponse> {
        let mut responses = vec![];
        for note in notes {
            responses.push(note.to_response(db).await?);
        }
        Ok(ManyNotesResponse { notes: responses })
    }
}

// impl From<Vec<note::Model>> for ManyNotesResponse {
//     fn from(notes: Vec<note::Model>) -> Self {
//         ManyNotesResponse {
//             notes: notes.into_iter().map(|note| NoteResponse::from).collect(),
//         }
//     }
// }

#[derive(Serialize, ToSchema)]
pub struct NoteCreateResponse {
    pub success: bool,
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct NoteCreateRequest {
    pub title: String,
    pub content: String,
    pub public: Option<bool>,
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
        public: Set(body.public.unwrap_or(false)),
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
    pub public: bool,
    pub saves: i32,
}

#[derive(Serialize, ToSchema)]
pub struct ManyNotesResponse {
    pub notes: Vec<NoteResponse>,
}

/// Get all your notes
#[utoipa::path(
    method(get),
    path = "/",
    responses(
        (status = OK, description = "Success", body = ManyNotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_notes(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
) -> AxumResult<Json<ManyNotesResponse>> {
    let notes = note::Entity::find()
        .filter(note::Column::UserId.eq(user.id))
        .order_by_desc(note::Column::CreatedAt)
        .all(&state.db)
        .await?;

    Ok(Json(
        ManyNotesResponse::response_from_array(notes, &state.db).await?,
    ))
}
/// Get all your bookmarked notes
#[utoipa::path(
    method(get),
    path = "/bookmark",
    responses(
        (status = OK, description = "Success", body = ManyNotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_bookmarked_notes(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
) -> AxumResult<Json<Vec<note::Model>>> {
    // Get all saves for this user
    let saves = save::Entity::find()
        .filter(save::Column::UserId.eq(user.id))
        .all(&state.db)
        .await?;

    // Collect note IDs
    let note_ids: Vec<i32> = saves.into_iter().map(|s| s.note_id).collect();

    // Fetch all notes in a single query
    let notes = note::Entity::find()
        .filter(note::Column::Id.is_in(note_ids))
        .all(&state.db)
        .await?;

    Ok(Json(notes))
}
