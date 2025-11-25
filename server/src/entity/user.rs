use sea_orm::entity::prelude::*;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
#[derive(serde::Serialize)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    
    #[sea_orm(unique)]
    pub username: String,

    #[sea_orm(unique)]
    pub email: String,

    pub password: String,

    #[sea_orm(column_type = "DateTime")]
    pub created_at: DateTime,
}
impl ActiveModelBehavior for ActiveModel {}
