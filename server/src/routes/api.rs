use utoipa_axum::router::OpenApiRouter;

use crate::state::AppState;

pub fn routes() -> OpenApiRouter<AppState> {
    let auth = OpenApiRouter::new();

    let public = OpenApiRouter::new();

    auth.merge(public)
}
