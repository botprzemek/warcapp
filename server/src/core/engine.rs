use tokio::sync::broadcast;

use tokio::sync::mpsc::UnboundedSender;
use tokio_tungstenite::tungstenite::Bytes;
use tokio_tungstenite::tungstenite::protocol::Message;

use uuid::Uuid;

use crate::core::managers::UserManager;

use crate::net::protocol;

pub struct Engine {
  user_manager: UserManager,
}

impl Engine {
  pub fn new() -> Self {

    Engine {
      user_manager: UserManager::new(),
    }
  }

  pub fn on_connect(&self, tx: UnboundedSender<Message>) -> (Uuid, broadcast::Receiver<Message>) {
    let (uuid, rx) = self.user_manager.add(tx);
    let message = protocol::write(&protocol::PacketData::PlayerJoin { uuid });

    self.user_manager.send(&uuid, message);
    (uuid, rx)
  }

  pub fn on_disconnect(&self, uuid: &Uuid) {
    self.user_manager.remove(uuid);
  }
  
  pub fn on_message(&self, data: &Bytes) {
    if let Some(data) = protocol::read(data) {
      match data {
        protocol::PacketData::PlayerMove { uuid, position } => {
          self.user_manager.update(&uuid, &position);

          let message = protocol::write(&protocol::PacketData::PlayerMove { uuid, position });

          self.user_manager.broadcast(message);
        }
        _ => {}
      }
    }
  }
}