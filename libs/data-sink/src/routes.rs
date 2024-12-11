use crate::data_sink::DataSink;
use crate::database::get_user_and_api_token_by_email;
use crate::errors::Error;
use crate::DataSinkAppState;
use anyhow::anyhow;
use axum::extract::State;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use block_mesh_common::interfaces::server_api::DigestDataRequest;
use dash_with_expiry::dash_set_with_expiry::DashSetWithExpiry;
use database_utils::utils::health_check::health_check;
use database_utils::utils::instrument_wrapper::{commit_txn, create_txn};
use reqwest::StatusCode;
use tokio::sync::OnceCell;
use validator::validate_email;

#[tracing::instrument(name = "db_health", skip_all)]
pub async fn db_health(State(state): State<DataSinkAppState>) -> Result<impl IntoResponse, Error> {
    let data_sink_db_pool = &state.data_sink_db_pool;
    let mut transaction = create_txn(data_sink_db_pool).await?;
    health_check(&mut *transaction).await?;
    commit_txn(transaction).await?;
    Ok((StatusCode::OK, "OK"))
}

#[tracing::instrument(name = "follower_health", skip_all)]
pub async fn follower_health(
    State(state): State<DataSinkAppState>,
) -> Result<impl IntoResponse, Error> {
    let follower_db_pool = &state.follower_db_pool;
    let mut transaction = create_txn(follower_db_pool).await?;
    health_check(&mut *transaction).await?;
    commit_txn(transaction).await?;
    Ok((StatusCode::OK, "OK"))
}

#[tracing::instrument(name = "server_health", skip_all)]
pub async fn server_health() -> Result<impl IntoResponse, Error> {
    Ok((StatusCode::OK, "OK"))
}

static CACHE: OnceCell<DashSetWithExpiry<(String, String)>> = OnceCell::const_new();

pub async fn digest_data(
    State(state): State<DataSinkAppState>,
    Json(body): Json<DigestDataRequest>,
) -> Result<impl IntoResponse, Error> {
    if !validate_email(&body.email) {
        return Err(Error::from(anyhow!("BadEmail")));
    }
    let follower_db_pool = &state.follower_db_pool;
    let mut transaction = create_txn(follower_db_pool).await?;
    let user = get_user_and_api_token_by_email(&mut transaction, &body.email)
        .await?
        .ok_or_else(|| anyhow!("UserNotFound"))?;
    if user.token.as_ref() != &body.api_token {
        commit_txn(transaction).await?;
        return Err(Error::from(anyhow!("ApiTokenNotFound")));
    }
    commit_txn(transaction).await?;
    if state.use_clickhouse {
        let cache = CACHE
            .get_or_init(|| async { DashSetWithExpiry::new() })
            .await;
        let key = (body.data.origin.clone(), body.data.id.clone());
        if cache.get(&key).is_some() {
            return Ok((StatusCode::ALREADY_REPORTED, "Already reported"));
        }

        let result = DataSink::dup_exists_clickhouse(
            &state.clickhouse_client,
            &body.data.origin,
            &body.data.id,
        )
        .await?;
        if result {
            cache.insert(key, None);
            return Ok((StatusCode::ALREADY_REPORTED, "Already reported"));
        }
        let _ = DataSink::create_data_sink_clickhouse(
            &state.clickhouse_client,
            &user.user_id,
            body.data,
        )
        .await;
        cache.insert(key, None);
    } else {
        let data_sink_db_pool = &state.data_sink_db_pool;
        let mut transaction = create_txn(data_sink_db_pool).await?;
        let result = DataSink::create_data_sink(&mut transaction, &user.user_id, body.data).await;
        if let Err(error) = result {
            if error
                .to_string()
                .contains("duplicate key value violates unique constraint")
            {
                return Ok((StatusCode::ALREADY_REPORTED, "Already reported"));
            }
        }
        commit_txn(transaction).await?;
    }
    Ok((StatusCode::OK, "OK"))
}

#[tracing::instrument(name = "version", skip_all)]
pub async fn version() -> impl IntoResponse {
    (StatusCode::OK, env!("CARGO_PKG_VERSION"))
}
pub fn get_router(state: DataSinkAppState) -> Router {
    Router::new()
        .route("/", get(server_health))
        .route("/server_health", get(server_health))
        .route("/db_health", get(db_health))
        .route("/follower_health", get(follower_health))
        .route("/version", get(version))
        .route("/digest_data", post(digest_data))
        .with_state(state)
}
