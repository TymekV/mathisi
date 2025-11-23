use argon2::Argon2;
use password_hash::{PasswordHasher, SaltString, rand_core::OsRng};

use axum::{Extension, Json};
use axum_valid::Valid;
use color_eyre::eyre::eyre;
use sea_orm::{ActiveModelTrait, ActiveValue::Set};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{entity::user, errors::AxumResult, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(login))
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 1, max = 128))]
    pub username: String,

    #[validate(email, length(max = 128))]
    pub email: String,

    #[validate(length(min = 1, max = 128))]
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct RegisterResponse {
    pub success: bool,
}

/// Register
#[utoipa::path(
    method(post),
    path = "/",
    responses(
        (status = OK, description = "Success", body = RegisterResponse)
    ),
    tag = "Auth"
)]
async fn login(
    Extension(state): Extension<AppState>,
    Valid(Json(body)): Valid<Json<RegisterRequest>>,
) -> AxumResult<Json<RegisterResponse>> {
    let salt = SaltString::generate(&mut OsRng);

    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(body.password.as_bytes(), &salt)
        .map_err(|e| eyre!("Failed to hash password: {}", e))?;

    let model = user::ActiveModel {
        username: Set(body.username),
        email: Set(body.email),
        password: Set(password_hash.to_string()),
        ..Default::default()
    };

    model.insert(&state.db).await?;

    Ok(Json(RegisterResponse { success: true }))
}
