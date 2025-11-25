use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, serde::Serialize)]
#[sea_orm(table_name = "quizes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(has_many)]
    pub questions: HasMany<super::question::Entity>,

    #[sea_orm(unique)]
    pub note_id: i32,
    #[sea_orm(belongs_to, from = "note_id", to = "id")]
    pub note: HasOne<super::note::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}
