use axum::{Extension, extract::Request, middleware::Next, response::Response};
use color_eyre::eyre::eyre;
use http::header::AUTHORIZATION;
use serde::Serialize;
use utoipa::ToSchema;

use crate::{
    entity::{token, user},
    errors::{AxumError, AxumResult},
    state::AppState,
    util::tokens::hash_token,
};

pub async fn with_auth(
    Extension(state): Extension<AppState>,
    mut request: Request,
    next: Next,
) -> AxumResult<Response> {
    let headers = request.headers();
    let auth_header = headers
        .get(AUTHORIZATION)
        .ok_or_else(|| AxumError::unauthorized(eyre!("Unauthorized")))?;

    let token = auth_header
        .to_str()
        .map_err(|_| AxumError::bad_request(eyre!("Unauthorized")))?;

    let hashed_token = hash_token(token);

    let (token, user) = token::Entity::find_by_token_hash(hashed_token)
        .find_also_related(user::Entity)
        .one(&state.db)
        .await
        .map_err(|_| AxumError::unauthorized(eyre!("Unauthorized")))?
        .ok_or_else(|| AxumError::unauthorized(eyre!("Unauthorized")))?;

    let Some(user) = user else {
        return Err(AxumError::unauthorized(eyre!("Unauthorized")));
    };

    request.extensions_mut().insert(user);
    request.extensions_mut().insert(token);

    Ok(next.run(request).await)
}

#[derive(Serialize, ToSchema)]
#[schema(example = json!({"error": "Unauthorized"}))]
pub struct UnauthorizedError {
    error: String,
}
