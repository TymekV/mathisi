use std::sync::Arc;

use sea_orm::DatabaseConnection;

use crate::settings::Settings;

#[derive(Clone)]
pub struct AppState {
    pub settings: Arc<Settings>,
    pub db: DatabaseConnection,
}
