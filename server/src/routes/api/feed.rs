use axum::{Extension, Json};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    entity::{note, user}, errors::AxumResult, middlewares::UnauthorizedError,
    routes::api::notes::ManyNotesResponse, state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new().routes(routes!(get_feed))
}

/// Get public notes for your feed
#[utoipa::path(
    method(get),
    path = "/",
    responses(
        (status = OK, description = "Success", body = ManyNotesResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Home"
)]
async fn get_feed(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
) -> AxumResult<Json<ManyNotesResponse>> {
    let notes = note::Entity::find()
        .filter(note::Column::Public.eq(true))
        .order_by_desc(note::Column::CreatedAt)
        .all(&state.db)
        .await?;
    Ok(Json(
        ManyNotesResponse::response_from_array(notes, &state.db,user.id).await?,
    ))
}
