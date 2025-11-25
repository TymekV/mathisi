use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[derive(serde::Serialize)]
#[sea_orm(table_name = "upvotes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    pub is_upvote: bool,

    #[sea_orm(unique_key = "user_note")]
    pub user_id: i32,
    #[sea_orm(belongs_to, from = "user_id", to = "id")]
    pub user: HasOne<super::user::Entity>,

    #[sea_orm(unique_key = "user_note")]
    pub note_id: i32,
    #[sea_orm(belongs_to, from = "note_id", to = "id")]
    pub note: HasOne<super::note::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}
