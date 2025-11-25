use crate::{
    entity::{note, user},
    errors::{AxumError, AxumResult},
    middlewares::UnauthorizedError,
    routes::api::notes::ManyNotesResponse,
    state::AppState,
};
use axum::{Extension, Json, extract::Path, response::IntoResponse};
use chrono::NaiveDateTime;
use color_eyre::eyre::eyre;
use http::{HeaderMap, StatusCode, header};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use serde::Serialize;
use axum::body::Bytes;
use sea_orm::{ActiveModelTrait, ActiveValue::Set};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_user))
        .routes(routes!(get_user_notes))
        .routes(routes!(get_user_profile_picture))
        .routes(routes!(set_user_profile_picture))
}

#[derive(Serialize, ToSchema)]
pub struct PublicUserResponse {
    pub id: i32,
    pub username: String,
    pub created_at: NaiveDateTime,
    pub has_profile_picture: bool,
}

impl From<user::Model> for PublicUserResponse {
    fn from(user: user::Model) -> Self {
        PublicUserResponse {
            id: user.id,
            username: user.username,
            created_at: user.created_at,
            has_profile_picture: user.profile_picture.is_some(),
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

/// Get user public notes
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
    Extension(user): Extension<user::Model>,
) -> AxumResult<Json<ManyNotesResponse>> {
    let notes = note::Entity::find()
        .filter(note::Column::UserId.eq(id))
        .filter(note::Column::Public.eq(true))
        .order_by_desc(note::Column::CreatedAt)
        .all(&state.db)
        .await?;

    Ok(Json(
        ManyNotesResponse::response_from_array(notes, &state.db,user.id).await?,
    ))
}


#[utoipa::path(
    method(get),
    path = "/avatar",
    params(
        ("id" = i32, Path, description = "User ID")
    ),
    responses(
        // OpenAPI can't easily express "raw bytes", we document `string` here
        (status = OK, description = "Profile picture", content_type = "image/png", body = String),
        (status = NOT_FOUND, description = "User or picture not found"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Users"
)]
async fn get_user_profile_picture(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
) -> AxumResult<impl IntoResponse> {
    let user = user::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("User not found")))?;

    let bytes = match user.profile_picture {
        Some(bytes) => bytes,
        None => return Err(AxumError::not_found(eyre!("User has no profile picture"))),
    };

    // If you store mime type separately, use that instead of hard-coding.
    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, "image/png".parse().unwrap());

    Ok((StatusCode::OK, headers, bytes))
}


#[utoipa::path(
    method(put),
    path = "/avatar",
    params(
        ("id" = i32, Path, description = "User ID")
    ),
    request_body(
        description = "Raw image bytes",
        content_type = "image/png"
    ),
    responses(
        (status = NO_CONTENT, description = "Profile picture updated"),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError),
        (status = NOT_FOUND, description = "User not found")
    ),
    tag = "Users"
)]
async fn set_user_profile_picture(
    Extension(state): Extension<AppState>,
    Path(id): Path<i32>,
    // authenticated user injected by middleware
    Extension(current_user): Extension<user::Model>,
    bytes: Bytes,
) -> AxumResult<StatusCode> {
    // simple ownership check; adapt to your auth logic
    if current_user.id != id {
        return Err(AxumError::unauthorized(eyre!(
            "You cannot change another user's profile picture"
        )));
    }

    // Optional: size limit to avoid abuse
    const MAX_SIZE: usize = 2 * 1024 * 1024; // 2 MB
    if bytes.len() > MAX_SIZE {
        return Err(AxumError::bad_request(eyre!("Image too large")));
    }

    let user_model = user::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("User not found")))?;

    let mut active: user::ActiveModel = user_model.into();
    active.profile_picture = Set(Some(bytes.to_vec()));
    active.update(&state.db).await?;

    Ok(StatusCode::NO_CONTENT)
}