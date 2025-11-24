mod entity;
mod errors;
mod init;
mod middlewares;
mod routes;
mod settings;
mod state;
mod util;

use std::sync::Arc;

use color_eyre::{Result, eyre::Context};
use rustls::crypto::{CryptoProvider, aws_lc_rs};
use tracing::{info, level_filters::LevelFilter};
use utoipa::OpenApi;

use crate::{
    init::{init_ai, init_axum, init_database, init_listener, init_tracing},
    settings::Settings,
    state::AppState,
};

#[derive(OpenApi)]
#[openapi()]
struct ApiDoc;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;

    CryptoProvider::install_default(aws_lc_rs::default_provider())
        .expect("Failed to install default crypto provider");

    dotenvy::dotenv().ok();

    init_tracing(LevelFilter::INFO).wrap_err("failed to set global tracing subscriber")?;

    info!(
        "Starting {} {}...",
        env!("CARGO_PKG_NAME"),
        env!("CARGO_PKG_VERSION"),
    );

    let settings = Arc::new(Settings::try_load()?);

    let db = init_database(&settings).await?;

    let ai = init_ai(&settings);

    let app_state = AppState {
        settings: settings.clone(),
        db,
        ai,
    };

    let app = init_axum(app_state).await?;
    let listener = init_listener(&settings).await?;

    info!(
        "listening on {} ({})",
        listener
            .local_addr()
            .wrap_err("failed to get local address")?,
        settings.general.public_url
    );

    axum::serve(listener, app.into_make_service())
        .await
        .wrap_err("failed to run server")?;

    Ok(())
}
