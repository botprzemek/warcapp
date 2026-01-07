mod core;
mod net;

use std::sync::Arc;

use crate::core::engine::Engine;
use crate::net::websocket::run;

#[tokio::main]
async fn main() {
    let engine = Arc::new(Engine::new());
    run(engine).await.expect("ws_panic");
}