use std::sync::Arc;

use async_openai::config::OpenAIConfig;
use sea_orm::DatabaseConnection;

use crate::settings::Settings;

#[derive(Clone)]
pub struct AppState {
    pub settings: Arc<Settings>,
    pub db: DatabaseConnection,
    pub ai: async_openai::Client<OpenAIConfig>,
}
