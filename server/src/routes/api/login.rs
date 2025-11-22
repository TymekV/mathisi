use argon2::{Argon2, PasswordHash, PasswordVerifier};
use axum::{Extension, Json};
use axum_valid::Valid;
use chrono::Utc;
use color_eyre::eyre::eyre;
use sea_orm::{ActiveModelTrait, ActiveValue::Set};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{
    entity::{token, user},
    errors::{AxumError, AxumResult},
    state::AppState,
    util::tokens::{generate_token, hash_token},
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(login))
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct LoginRequest {
    #[validate(length(min = 1, max = 128))]
    pub username: String,

    #[validate(length(min = 1, max = 128))]
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
}

/// Log in
#[utoipa::path(
    method(post),
    path = "/",
    responses(
        (status = OK, description = "Success", body = LoginResponse)
    ),
    tag = "Auth"
)]
async fn login(
    Extension(state): Extension<AppState>,
    Valid(Json(body)): Valid<Json<LoginRequest>>,
) -> AxumResult<Json<LoginResponse>> {
    // TODO: Validate user
    let user = user::Entity::find_by_username(body.username.clone())
        .one(&state.db)
        .await?;
    let Some(user) = user else {
        return Err(AxumError::unauthorized(eyre!(
            "Invalid username or password"
        )));
    };

    let argon2 = Argon2::default();
    let hash = PasswordHash::new(&user.password)
        .map_err(|_| AxumError::unauthorized(eyre!("Invalid username or password")))?;

    let is_valid = argon2
        .verify_password(body.password.as_bytes(), &hash)
        .is_ok();

    if !is_valid {
        return Err(AxumError::unauthorized(eyre!(
            "Invalid username or password"
        )));
    }

    let token = generate_token();
    let hashed_token = hash_token(&token);

    let token_entry = token::ActiveModel {
        user_id: Set(user.id),
        token_hash: Set(hashed_token),
        created_at: Set(Utc::now()),
        ..Default::default()
    };

    token_entry.insert(&state.db).await?;

    Ok(Json(LoginResponse { token }))
}
