mod login;
mod register;
mod user;
mod notes;
mod note;

use axum::middleware;
use utoipa_axum::router::OpenApiRouter;

use crate::{middlewares::with_auth, state::AppState};

pub fn routes() -> OpenApiRouter<AppState> {
    let auth = OpenApiRouter::new()
        .nest("/user", user::routes())
        .nest("/notes", notes::routes())
        .layer(middleware::from_fn(with_auth));

    let public = OpenApiRouter::new()
        .nest("/login", login::routes())
        .nest("/register", register::routes());

    auth.merge(public)
}
