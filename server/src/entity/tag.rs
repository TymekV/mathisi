use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(has_many, via = "note_tags")]
    pub notes: HasMany<super::note::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}
