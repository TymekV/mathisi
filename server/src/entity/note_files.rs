use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "note_tags")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub note_id: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub file_id: i32,
    #[sea_orm(belongs_to, from = "note_id", to = "id")]
    pub note: Option<super::note::Entity>,
    #[sea_orm(belongs_to, from = "file_id", to = "id")]
    pub file: Option<super::file::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}
