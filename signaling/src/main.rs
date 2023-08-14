use std::sync::Arc;

use axum::{
    body,
    extract::ws::{WebSocket, WebSocketUpgrade},
    http::response::Builder,
    response::Response,
    routing::get,
    Extension, Router,
};
use client::ClientState;
use handshake::perform_handshake;
use rooms::RoomRegistry;
use tracing::{error, Level};
use tracing_subscriber::EnvFilter;
use users::UserRegistry;

mod client;
mod dashutil;
mod handshake;
mod protocol;
mod rooms;
mod users;

pub struct Config {
    arbitrary_name_room: bool,
    self_signed_room: bool,
}

pub struct ServerState {
    config: Config,
    rooms: RoomRegistry,
    users: UserRegistry,
}

async fn handler(
    ws: Option<WebSocketUpgrade>,
    Extension(state): Extension<Arc<ServerState>>,
) -> Response {
    if let Some(ws) = ws {
        ws.protocols(["dndme-hermes"])
            .on_upgrade(|socket| handle_socket(socket, state))
    } else {
        let rooms = state.rooms.registry_size();
        let users = state.users.registry_size();
        Builder::new()
            .body(body::boxed(format!(
                "Hosting {users} users and {rooms} rooms!"
            )))
            .unwrap()
    }
}

async fn handle_socket(mut socket: WebSocket, state: Arc<ServerState>) {
    let client_id = match perform_handshake(&mut socket).await {
        Ok(id) => id,
        Err(e) => {
            error!("Error during handshake: {e}");
            return;
        }
    };

    ClientState::new(state, socket, client_id)
        .handle_socket()
        .await
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(Level::TRACE)
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let state = Arc::new(ServerState {
        config: Config {
            arbitrary_name_room: true,
            self_signed_room: true,
        },
        rooms: RoomRegistry::new(),
        users: UserRegistry::new(),
    });
    // build our application with a single route
    let app = Router::new()
        .route("/", get(handler))
        .layer(Extension(state));

    let addr = &"0.0.0.0:3000".parse().unwrap();

    tracing::debug!("Listening on {addr}");
    // run it with hyper on localhost:3000
    axum::Server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
