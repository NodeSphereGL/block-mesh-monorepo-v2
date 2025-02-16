use crate::background::ws::channel::get_tx;
use crate::background::ws::websocket::{set_ws_status, BridgedWebSocket}; // Import BridgedWebSocket
use crate::utils::extension_wrapper_state::ExtensionWrapperState;
use crate::utils::log::{log, log_error};
use block_mesh_common::interfaces::ws_api::WsServerMessage;
use js_sys::{ArrayBuffer, JsString, Uint8Array};
use serde::{Deserialize, Serialize};
use std::cmp::PartialEq;
use std::fmt::{Display, Formatter};
use wasm_bindgen::convert::IntoWasmAbi;
use wasm_bindgen::describe::WasmDescribe;
use wasm_bindgen::prelude::*;
use web_sys::{CloseEvent, ErrorEvent, MessageEvent}; // Import necessary types

pub fn on_message_handler(
    ws: BridgedWebSocket, // Use BridgedWebSocket
    _app_state: ExtensionWrapperState,
) -> Closure<dyn FnMut(MessageEvent)> {
    Closure::<dyn FnMut(_)>::new(move |e: MessageEvent| {
        log!("on_message_handle e.data() => {:#?}", e.data());

        // Attempt to convert the message data to a string or binary data
        let message_text = e
            .data()
            .dyn_into::<JsString>()
            .map(|js_string| js_string.as_string());
        let message_binary = e.data().dyn_into::<ArrayBuffer>().map(|array_buffer| {
            let array = Uint8Array::new(&array_buffer);
            array.to_vec()
        });

        if let Some(txt) = message_text {
            if txt == "ping" {
                let _ = ws.send_with_str("pong");
            }
            match WsServerMessage::try_from(txt.unwrap_or_default()) {
                Ok(msg) => {
                    log!("on_message msg => {:#?}", msg);
                    if let Some(tx) = get_tx() {
                        if let Ok(tx) = tx.read() {
                            let _ = tx.try_send(msg);
                        }
                    }
                }
                Err(error) => {
                    log_error!("on_message_handle js error => {:#?} | txt = {}", error, txt);
                }
            }
        } else if let Some(binary_data) = message_binary {
            // Handle binary data
            log!("Received binary data: {:?}", binary_data);
            // You can process the binary data here
        } else {
            log_error!("message event, received Unknown: {:?}", e.data());
        }
    })
}

pub fn on_error_handler(ws: BridgedWebSocket) -> Closure<dyn FnMut(ErrorEvent)> {
    // Use BridgedWebSocket
    Closure::<dyn FnMut(_)>::new(move |e: ErrorEvent| {
        let state: WebSocketReadyState = WebSocketReadyState::INVALID; // Can't get ready state
        set_ws_status(&state);
        log_error!(
            "on_error_handler:: closing ws with error error event: {:?} | {:?}",
            e.error().as_string(),
            state
        );
    })
}

pub fn on_open_handler(ws: BridgedWebSocket) -> Closure<dyn FnMut()> {
    // Use BridgedWebSocket
    Closure::<dyn FnMut()>::new(move || match ws.send_with_str("ping") {
        Ok(_) => {
            log!("Sent a ping message.");
            //setup_channels(ws.clone()); // You might need to adapt setup_channels
            let state: WebSocketReadyState = WebSocketReadyState::OPEN;
            set_ws_status(&state);
        }
        Err(err) => log_error!("error sending message: {:?}", err),
    })
}

pub fn on_close_handler(ws: BridgedWebSocket) -> Closure<dyn FnMut(CloseEvent)> {
    // Use BridgedWebSocket
    Closure::<dyn FnMut(_)>::new(move |e: CloseEvent| {
        let state: WebSocketReadyState = WebSocketReadyState::CLOSED; // Can't get ready state
        set_ws_status(&state);
        log_error!(
            "on_close_handler:: closing ws with error error event: {:?} | {:?} | {:?}",
            e.code(),
            e.reason(),
            state
        );
    })
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
#[allow(clippy::upper_case_acronyms)]
#[repr(C)]
pub enum WebSocketReadyState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED,
    INVALID,
}

impl WasmDescribe for WebSocketReadyState {
    fn describe() {
        JsValue::describe()
    }
}

impl Display for WebSocketReadyState {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CONNECTING => write!(f, "CONNECTING"),
            Self::OPEN => write!(f, "OPEN"),
            Self::CLOSING => write!(f, "CLOSING"),
            Self::CLOSED => write!(f, "CLOSED"),
            Self::INVALID => write!(f, "INVALID"),
        }
    }
}
impl IntoWasmAbi for WebSocketReadyState {
    type Abi = <JsValue as IntoWasmAbi>::Abi;

    fn into_abi(self) -> Self::Abi {
        JsValue::from_str(&self.to_string()).into_abi()
    }
}

impl From<u16> for WebSocketReadyState {
    fn from(value: u16) -> Self {
        match value {
            0 => Self::CONNECTING,
            1 => Self::OPEN,
            2 => Self::CLOSING,
            3 => Self::CLOSED,
            _ => Self::INVALID,
        }
    }
}
