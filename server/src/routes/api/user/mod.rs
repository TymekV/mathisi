mod id;

use axum::{Extension, Json};
use chrono::NaiveDateTime;
use serde::Serialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{entity::user, errors::AxumResult, middlewares::UnauthorizedError, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_current_user))
        .nest("/{id}", id::routes())
}

#[derive(Serialize, ToSchema)]
pub struct UserResponse {
    pub id: i32,

    pub username: String,

    pub email: String,
    pub created_at: NaiveDateTime,
    pub has_profile_picture: bool,
}

impl From<user::Model> for UserResponse {
    fn from(user: user::Model) -> Self {
        UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
            has_profile_picture: user.profile_picture.is_some(),
        }
    }
}

/// Get current user info
#[utoipa::path(
    method(get),
    path = "/",
    responses(
        (status = OK, description = "Success", body = UserResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Auth"
)]
async fn get_current_user(
    Extension(user): Extension<user::Model>,
) -> AxumResult<Json<UserResponse>> {
    Ok(Json(user.into()))
}
