use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, serde::Serialize)]
#[sea_orm(table_name = "questions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    pub quiz_id: i32,
    #[sea_orm(belongs_to, from = "quiz_id", to = "id")]
    pub quiz: HasOne<super::quiz::Entity>,

    pub title: String,
    pub answers: Vec<String>,
    pub correct: i32,
}

impl ActiveModelBehavior for ActiveModel {}
