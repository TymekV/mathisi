use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use utoipa::ToSchema;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, serde::Serialize, ToSchema)]
#[sea_orm(table_name = "files")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(indexed)]
    pub user_id: i32,
    #[schema(value_type = ())]
    #[sea_orm(belongs_to, from = "user_id", to = "id")]
    pub user: HasOne<super::user::Entity>,

    #[sea_orm(has_many, via = "note_files")]
    #[schema(value_type = ())]
    pub notes: HasMany<super::note::Entity>,

    pub created_at: DateTime<Utc>,

    pub filename: String,

    pub ocr: Option<String>,

    pub data: Vec<u8>,
}

impl ActiveModelBehavior for ActiveModel {}
