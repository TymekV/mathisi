use axum::{Extension, Json, extract::Path};
use color_eyre::eyre::eyre;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, ModelTrait, QueryFilter,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::{note, save, upvote, user},
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    routes::api::notes::NoteResponse,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_note))
        .routes(routes!(edit_note))
        .routes(routes!(bookmark_note))
        .routes(routes!(is_bookmark_on_note))
        .routes(routes!(upvote_note))
        .routes(routes!(downvote_note))
        .routes(routes!(get_note_votes))
        .routes(routes!(get_note_vote))
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
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    Ok(Json(note.to_response(&state.db, user.id).await?))
}

#[derive(Deserialize, ToSchema)]
pub struct EditNote {
    pub title: Option<String>,
    pub content: Option<String>,
    pub public: Option<bool>,
}

#[derive(Serialize, ToSchema)]
pub struct NoteBookmarkResponse {
    pub success: bool,
    pub marked: bool,
}

#[derive(Serialize, ToSchema)]
pub struct NoteUpvoteResponse {
    pub success: bool,
    pub is_upvoted: i32,
}
#[derive(Serialize, ToSchema)]
pub struct NoteVotesResponse {
    pub success: bool,
    pub votes: i32,
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

    Ok(Json(note.to_response(&state.db,user.id).await?))
}

#[utoipa::path(
    method(get),
    path = "/bookmark",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteBookmarkResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn is_bookmark_on_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteBookmarkResponse>> {
    // Ensure note exists
    note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    // Check if a save exists
    let is_bookmarked = save::Entity::find()
        .filter(save::Column::UserId.eq(user.id))
        .filter(save::Column::NoteId.eq(id))
        .one(&state.db)
        .await?
        .is_some();

    Ok(Json(NoteBookmarkResponse {
        success: true,
        marked: is_bookmarked,
    }))
}

/// Bookmark note (toggle)
#[utoipa::path(
    method(post),
    path = "/bookmark",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteBookmarkResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn bookmark_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteBookmarkResponse>> {
    let mut created: bool = false;
    // Ensure note exists
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    // Check if a save already exists
    if let Some(existing_save) = save::Entity::find()
        .filter(save::Column::UserId.eq(user.id))
        .filter(save::Column::NoteId.eq(id))
        .one(&state.db)
        .await?
    {
        // Bookmark exists → remove it
        existing_save.delete(&state.db).await?;
    } else {
        // Bookmark does NOT exist → create it
        let new_save = save::ActiveModel {
            user_id: Set(user.id),
            note_id: Set(id),
            ..Default::default()
        };
        new_save.insert(&state.db).await?;
        created = true;
    }

    // Return updated note
    Ok(Json(NoteBookmarkResponse {
        success: true,
        marked: created,
    }))
}

/// Upvote note (toggle)
#[utoipa::path(
    method(post),
    path = "/upvote",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteUpvoteResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn upvote_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteUpvoteResponse>> {
    let mut value: i32 = 0;
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    if let Some(existing_save) = upvote::Entity::find()
        .filter(upvote::Column::UserId.eq(user.id))
        .filter(upvote::Column::NoteId.eq(id))
        .one(&state.db)
        .await?
    {
        existing_save.delete(&state.db).await?;
    } else {
        let new_save = upvote::ActiveModel {
            user_id: Set(user.id),
            note_id: Set(id),
            is_upvote: Set(true),
            ..Default::default()
        };
        new_save.insert(&state.db).await?;
        value = 1;
    }

    // Return updated note
    Ok(Json(NoteUpvoteResponse {
        success: true,
        is_upvoted: value,
    }))
}

/// Downvote note (toggle)
#[utoipa::path(
    method(post),
    path = "/downvote",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteBookmarkResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn downvote_note(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteUpvoteResponse>> {
    let mut value: i32 = 0;
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    if let Some(existing_save) = upvote::Entity::find()
        .filter(upvote::Column::UserId.eq(user.id))
        .filter(upvote::Column::NoteId.eq(id))
        .one(&state.db)
        .await?
    {
        existing_save.delete(&state.db).await?;
    } else {
        let new_save = upvote::ActiveModel {
            user_id: Set(user.id),
            note_id: Set(id),
            is_upvote: Set(false),
            ..Default::default()
        };
        new_save.insert(&state.db).await?;
        value = -1;
    }

    // Return updated note
    Ok(Json(NoteUpvoteResponse {
        success: true,
        is_upvoted: value,
    }))
}

#[utoipa::path(
    method(get),
    path = "/votes",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteVotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_note_votes(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteVotesResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    let votes = upvote::Entity::find()
        .filter(upvote::Column::NoteId.eq(id))
        .all(&state.db)
        .await?
        .into_iter()
        .map(|v| if v.is_upvote { 1 } else { -1 })
        .sum::<i32>();

    Ok(Json(NoteVotesResponse {
        success: true,
        votes: votes,
    }))
}

#[utoipa::path(
    method(get),
    path = "/vote",
    params(
        ("id" = i32, Path, description = "Note ID")
    ),
    responses(
        (status = OK, description = "Success", body = NoteVotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_note_vote(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<NoteUpvoteResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    let votes = upvote::Entity::find()
        .filter(upvote::Column::NoteId.eq(id))
        .filter(upvote::Column::UserId.eq(user.id))
        .one(&state.db)
        .await?
        .into_iter()
        .map(|v| if v.is_upvote { 1 } else { -1 })
        .sum::<i32>();

    Ok(Json(NoteUpvoteResponse {
        success: true,
        is_upvoted: votes,
    }))
}
