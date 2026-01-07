use std::sync::Arc;

use futures_util::{SinkExt, StreamExt};

use tokio::io::{Result as IOResult};
use tokio::net::{TcpListener, TcpStream};

use tokio::sync::mpsc::unbounded_channel;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::{Result as WSResult};
use tokio_tungstenite::tungstenite::protocol::Message;

use crate::core::engine::Engine;

const HOST: &str = "localhost";
const PORT: u16 = 9001;

pub async fn run(engine: Arc<Engine>) -> IOResult<()> {
  let addr = format!("{}:{}", HOST, PORT);
  let listener = TcpListener::bind(&addr).await?;

  loop {
    let (stream, _socket_addr) = listener.accept().await?;
    let engine = engine.clone();

    tokio::spawn(handler(stream, engine));
  }
}

async fn handler(stream: TcpStream, engine: Arc<Engine>) -> WSResult<()> {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();

    let (private_tx, mut private_rx) = unbounded_channel::<Message>();
    let (id, mut public_rx) = engine.on_connect(private_tx);

    let writer = tokio::spawn(async move {
      loop {
        tokio::select! {
          Some(message) = private_rx.recv() => {
            if write.send(message).await.is_err() {
              break;
            }
          },
          Ok(message) = public_rx.recv() => {
            if write.send(message).await.is_err() {
              break;
            }
          },
          else => break,
        }
      }
    });

    while let Some(result) = read.next().await {
      match result {
        Ok(Message::Binary(data)) if data.len() >= 3 => {
          engine.on_message(&data);
        }
        Ok(Message::Close(_)) => {
          break;
        }
        _ => {}
      }
    }
    
    writer.abort();
    engine.on_disconnect(&id);
    Ok(())
}