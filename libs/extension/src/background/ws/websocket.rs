use super::{
    on_close_handler, on_error_handler, on_message_handler, on_open_handler, WebSocketReadyState,
};
use crate::background::ws::channel::get_tx;
use crate::utils::log::log;
use crate::utils::{connectors::set_panic_hook, extension_wrapper_state::ExtensionWrapperState};
use block_mesh_common::constants::DeviceType;
use block_mesh_common::interfaces::ws_api::WsServerMessage;
use futures::{SinkExt, StreamExt};
// use js_sys::{ArrayBuffer, Function, JsString, Reflect, Uint8Array};
use leptos::SignalGetUntracked;
use logger_leptos::leptos_tracing::setup_leptos_tracing;
use once_cell::sync::OnceCell;
use std::env;
use std::sync::{Arc, RwLock};
use tokio::net::TcpStream;
use tokio_socks5::Socks5Stream;
use tokio_tungstenite::{connect_async, tungstenite::Message, WebSocketStream};
use url::Url;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
// use web_sys::WebSocket;

pub static WEB_SOCKET_STATUS: OnceCell<Arc<RwLock<WebSocketReadyState>>> = OnceCell::new();

#[wasm_bindgen]
pub fn get_ws_status() -> WebSocketReadyState {
    let ws_status =
        WEB_SOCKET_STATUS.get_or_init(|| Arc::new(RwLock::new(WebSocketReadyState::CLOSED)));
    ws_status.read().unwrap().clone()
}

pub fn set_ws_status(status: &WebSocketReadyState) {
    let ws_status =
        WEB_SOCKET_STATUS.get_or_init(|| Arc::new(RwLock::new(WebSocketReadyState::CLOSED)));
    *ws_status.write().unwrap() = status.clone();
}

#[wasm_bindgen]
pub async fn stop_websocket() {
    if let Some(tx) = get_tx() {
        let _ = tx.read().unwrap().send(WsServerMessage::CloseConnection);
    }
}

#[wasm_bindgen]
pub async fn ping_with_twitter_creds() -> bool {
    match get_ws_status() {
        WebSocketReadyState::OPEN => {
            if let Some(tx) = get_tx() {
                let _ = tx
                    .read()
                    .unwrap()
                    .send(WsServerMessage::RequestTwitterCreds);
            }
            true
        }
        _ => false,
    }
}

// A struct to mimic the web_sys::WebSocket API
#[wasm_bindgen]
pub struct BridgedWebSocket {
    tx: futures::channel::mpsc::Sender<tungstenite::Message>,
}

#[wasm_bindgen]
impl BridgedWebSocket {
    #[wasm_bindgen(constructor)]
    pub fn new(tx: futures::channel::mpsc::Sender<tungstenite::Message>) -> Self {
        BridgedWebSocket { tx }
    }

    pub fn send_with_str(&self, data: &str) -> Result<(), JsValue> {
        let mut tx = self.tx.clone();
        spawn_local(async move {
            if let Err(e) = tx.send(Message::Text(data.to_string())).await {
                log(&format!("Error sending message: {:?}", e));
            }
        });
        Ok(())
    }

    pub fn ready_state(&self) -> u16 {
        // This is a simplification, as we don't have direct access to the WebSocket state
        //  You might need to manage the state more explicitly.
        1 // Assuming OPEN
    }

    // Placeholder functions for setting callbacks - These won't actually be called
    pub fn set_onopen(&self, _callback: Option<&js_sys::Function>) {}
    pub fn set_onmessage(&self, _callback: Option<&js_sys::Function>) {}
    pub fn set_onerror(&self, _callback: Option<&js_sys::Function>) {}
    pub fn set_onclose(&self, _callback: Option<&js_sys::Function>) {}

    pub fn set_binary_type(&self, _type: web_sys::BinaryType) {
        // Placeholder - We're handling binary types directly
    }
}

#[wasm_bindgen]
pub async fn start_websocket() -> Result<(), JsValue> {
    set_panic_hook();
    setup_leptos_tracing(None, DeviceType::Extension);
    log!("start_websocket");

    let app_state = ExtensionWrapperState::default();
    app_state.init_with_storage().await;
    if !app_state.has_api_token() {
        return Err(JsValue::from_str("Missing Api Token"));
    }
    let email = app_state.email.get_untracked();
    let api_token = app_state.api_token.get_untracked();
    let blockmesh_url = app_state
        .blockmesh_ws_url
        .get_untracked()
        .replace("http://", "ws://")
        .replace("https://", "wss://");
    let api_token = api_token.to_string();
    let websocket_url = format!("{blockmesh_url}/ws?email={email}&api_token={api_token}");

    match get_ws_status() {
        WebSocketReadyState::CLOSED => {}
        WebSocketReadyState::CLOSING => {}
        WebSocketReadyState::OPEN => return Ok(()),
        WebSocketReadyState::CONNECTING => return Ok(()),
        WebSocketReadyState::INVALID => return Ok(()),
    }
    log!("connecting websocket {}", websocket_url);

    // Get the SOCKS5 proxy URL from the environment
    let proxy_url = match env::var("SOCKS5_PROXY") {
        Ok(url) => url,
        Err(_) => {
            return Err(JsValue::from_str(
                "SOCKS5_PROXY environment variable not set",
            ))
        }
    };

    let url = match Url::parse(&websocket_url) {
        Ok(u) => u,
        Err(e) => return Err(JsValue::from_str(&format!("Invalid WebSocket URL: {}", e))),
    };

    // 1. Connect to the SOCKS5 proxy
    let proxy_addr = proxy_url.trim_start_matches("socks5h://"); // Remove the scheme for tokio-socks5
    proxy_addr = proxy_addr.trim_start_matches("socks5://");

    let tcp_stream = match TcpStream::connect(proxy_addr).await {
        Ok(stream) => stream,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to connect to SOCKS5 proxy: {}",
                e
            )))
        }
    };

    let socks5_stream = match Socks5Stream::connect(
        tcp_stream,
        url.host_str().unwrap(),
        url.port().unwrap_or(80),
    )
    .await
    {
        Ok(stream) => stream,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to establish SOCKS5 tunnel: {}",
                e
            )))
        }
    };

    // 2. Upgrade to WebSocket
    let websocket_stream_result = connect_async(websocket_url.clone(), socks5_stream).await;

    let (mut websocket_stream, _) = match websocket_stream_result {
        Ok(result) => result,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "WebSocket handshake failed: {}",
                e
            )))
        }
    };

    // Create a channel to send messages to the WebSocket
    let (tx, mut rx) = futures::channel::mpsc::channel::<tungstenite::Message>(100);

    // Create a BridgedWebSocket instance
    let bridged_ws = BridgedWebSocket::new(tx);

    // Set WebSocket state
    set_ws_status(&WebSocketReadyState::OPEN);

    // Clone the BridgedWebSocket for the handlers
    let bridged_ws_clone = bridged_ws.clone();

    // Create the callbacks
    let onopen_callback = on_open_handler(bridged_ws_clone);
    let onmessage_callback = on_message_handler(bridged_ws.clone(), app_state); // Pass bridged_ws
    let onerror_callback = on_error_handler(bridged_ws.clone());
    let onclose_callback = on_close_handler(bridged_ws);

    // Spawn a task to handle incoming messages from the WebSocket
    spawn_local(async move {
        while let Some(msg) = websocket_stream.next().await {
            match msg {
                Ok(message) => {
                    // Process the message and call the onmessage handler
                    //  You'll need to adapt your handlers to work with the async-tungstenite stream
                    //  For example:
                    //  on_message_handler(websocket_stream.clone(), app_state.clone(), message);
                    //  For now, let's just log the message
                    log(&format!("Received message: {:?}", message));
                }
                Err(e) => {
                    log(&format!("WebSocket error: {}", e));
                    break;
                }
            }
        }
    });

    Ok(())
}
