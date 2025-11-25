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
    entity::{note, save, upvote, user},
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

impl note::Model {
    pub async fn to_response(&self, db: &DatabaseConnection, user_id: i32) -> Result<NoteResponse> {
        let saves = self.find_related(save::Entity).count(db).await? as i32;

        let user_vote = upvote::Entity::find()
            .filter(upvote::Column::NoteId.eq(self.id))
            .filter(upvote::Column::UserId.eq(user_id))
            .one(db)
            .await?
            .into_iter()
            .map(|v| if v.is_upvote { 1 } else { -1 })
            .sum::<i32>();

        // Fixed: swapped the filter conditions
        let is_bookmarked = save::Entity::find()
            .filter(save::Column::UserId.eq(user_id))
            .filter(save::Column::NoteId.eq(self.id))
            .one(db)
            .await?
            .is_some();

        Ok(NoteResponse {
            id: self.id,
            user_id: self.user_id,
            created_at: self.created_at,
            title: self.title.clone(),
            content: self.content.clone(),
            public: self.public,
            saves,
            user_vote,
            user_bookmark: is_bookmarked,
        })
    }
}

impl ManyNotesResponse {
    pub async fn response_from_array(
        notes: Vec<note::Model>,
        db: &DatabaseConnection,
        user_id: i32, // Added user_id parameter
    ) -> Result<ManyNotesResponse> {
        let mut responses = vec![];
        for note in notes {
            responses.push(note.to_response(db, user_id).await?);
        }
        Ok(ManyNotesResponse { notes: responses })
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
    pub user_bookmark: bool,
    pub user_vote: i32,
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
        ManyNotesResponse::response_from_array(notes, &state.db, user.id).await?,
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
) -> AxumResult<Json<ManyNotesResponse>> {
    let saves = save::Entity::find()
        .filter(save::Column::UserId.eq(user.id))
        .all(&state.db)
        .await?;

    let note_ids: Vec<i32> = saves.into_iter().map(|s| s.note_id).collect();

    let notes = note::Entity::find()
        .filter(note::Column::Id.is_in(note_ids))
        .all(&state.db)
        .await?;

    Ok(Json(
        ManyNotesResponse::response_from_array(notes, &state.db, user.id).await?,
    ))
}