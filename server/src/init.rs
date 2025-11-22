use std::net::SocketAddr;

use axum::{Extension, Json, Router, response::IntoResponse, routing::get};
use color_eyre::Result;
use http::StatusCode;
use sea_orm::Database;
use tokio::net::TcpListener;
use tracing::{instrument, level_filters::LevelFilter};
use tracing_error::ErrorLayer;
use tracing_subscriber::{fmt::format::FmtSpan, layer::SubscriberExt, util::SubscriberInitExt};
use utoipa_rapidoc::RapiDoc;
use utoipa_redoc::{Redoc, Servable};
use utoipa_scalar::{Scalar, Servable as _};

use crate::{settings::Settings, state::AppState};

pub fn init_tracing(filter: LevelFilter) -> Result<()> {
    tracing_subscriber::Registry::default()
        .with(tracing_subscriber::fmt::layer().with_span_events(FmtSpan::NEW | FmtSpan::CLOSE))
        .with(ErrorLayer::default())
        .with(
            tracing_subscriber::EnvFilter::builder()
                .with_default_directive(filter.into())
                .with_env_var("RUST_LOG")
                .from_env()?,
        )
        .try_init()?;

    Ok(())
}

#[instrument(skip(state))]
pub async fn init_axum(state: AppState) -> Result<Router> {
    let router = crate::routes::routes();

    let (router, api) = router.with_state(state.clone()).split_for_parts();

    let openapi_prefix = "/apidoc";
    let spec_name = "/openapi.json";

    let docs = Router::new()
        .merge(Redoc::with_url("/redoc", api.clone()))
        .merge(RapiDoc::new(format!("{openapi_prefix}{spec_name}")).path("/rapidoc"))
        .merge(Scalar::with_url("/scalar", api.clone()))
        .route(spec_name, get(|| async move { Json(api) }));

    let router = router
        .nest(openapi_prefix, docs)
        .layer(Extension(state))
        .fallback(|| async { (StatusCode::NOT_FOUND, "Not found").into_response() });

    Ok(router)
}

pub async fn init_listener(settings: &Settings) -> Result<TcpListener> {
    let addr: Vec<SocketAddr> = settings.general.listen_address.clone().into();

    Ok(TcpListener::bind(addr.as_slice()).await?)
}

pub async fn init_database(settings: &Settings) -> Result<sea_orm::DatabaseConnection> {
    let db = Database::connect(settings.db.connection_string.clone()).await?;
    db.get_schema_registry("server::entity::*")
        .sync(&db)
        .await?;

    Ok(db)
}
