use crate::{
    entity::{note, user},
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    routes::api::notes::{self, ManyNotesResponse},
    state::AppState,
};
use axum::{Extension, Json, extract::Path};
use chrono::NaiveDateTime;
use color_eyre::eyre::eyre;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Serialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_user))
        .routes(routes!(get_user_notes))
}

#[derive(Serialize, ToSchema)]
pub struct PublicUserResponse {
    pub id: i32,

    pub username: String,

    pub created_at: NaiveDateTime,
}

impl From<user::Model> for PublicUserResponse {
    fn from(user: user::Model) -> Self {
        PublicUserResponse {
            id: user.id,
            username: user.username,
            created_at: user.created_at,
        }
    }
}
/// Get user public info
#[utoipa::path(
    method(get),
    path = "/",
    params(
        ("id" = i32, Path, description = "User ID")
    ),
    responses(
        (status = OK, description = "Success", body = PublicUserResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]

async fn get_user(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<Json<PublicUserResponse>> {
    let user = user::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("User not found")))?;

    Ok(Json(user.into()))
}

/// Get user public info
#[utoipa::path(
    method(get),
    path = "/notes",
    params(
        ("id" = i32, Path, description = "User ID")
    ),
    responses(
        (status = OK, description = "Success", body = ManyNotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Notes"
)]
async fn get_user_notes(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<Json<ManyNotesResponse>> {
    let notes = note::Entity::find()
        .filter(note::Column::UserId.eq(id))
        .all(&state.db)
        .await?;

    Ok(Json(notes.into()))
}
