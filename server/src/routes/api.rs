mod login;
mod register;

use utoipa_axum::router::OpenApiRouter;

use crate::state::AppState;

pub fn routes() -> OpenApiRouter<AppState> {
    let auth = OpenApiRouter::new();

    let public = OpenApiRouter::new()
        .nest("/login", login::routes())
        .nest("/register", register::routes());

    auth.merge(public)
}
