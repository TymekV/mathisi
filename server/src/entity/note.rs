use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use serde::Serialize;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[derive(serde::Serialize)]
#[sea_orm(table_name = "notes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(indexed)]
    pub user_id: i32,
    #[sea_orm(belongs_to, from = "user_id", to = "id")]
    pub user: HasOne<super::user::Entity>,

    pub created_at: DateTime<Utc>,

    pub title: String,

    pub content: String,

    #[sea_orm(has_many, via = "note_tags")]
    pub tags: HasMany<super::tag::Entity>,

    #[sea_orm(has_many)]
    pub files: HasMany<super::file::Entity>,

    #[sea_orm(has_many)]
    pub saves: HasMany<super::save::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}