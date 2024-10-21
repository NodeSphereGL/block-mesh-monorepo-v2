use database_utils::utils::connection::get_pg_pool;
use sqlx::PgPool;
use tokio::sync::OnceCell;

static DB_POOL: OnceCell<PgPool> = OnceCell::const_new();

pub async fn get_pool() -> &'static PgPool {
    DB_POOL.get_or_init(|| async { get_pg_pool().await }).await
}
