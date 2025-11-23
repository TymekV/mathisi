use axum::{Extension, Json};
use serde::Serialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{entity::user, errors::AxumResult, middlewares::UnauthorizedError, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_current_user))
}

#[derive(Serialize, ToSchema)]
pub struct UserResponse {
    pub id: i32,

    pub username: String,

    pub email: String,
}

impl From<user::Model> for UserResponse {
    fn from(user: user::Model) -> Self {
        UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
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
