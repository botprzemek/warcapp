use dashmap::DashMap;

use tokio::sync::broadcast;
use tokio::sync::mpsc::UnboundedSender;
use tokio_tungstenite::tungstenite::protocol::Message;

use uuid::Uuid;

pub struct User {
  position: [u8; 2],
  tx: UnboundedSender<Message>,
}

impl User {
  pub fn new(tx: UnboundedSender<Message>) -> Self {
    User {
      position: [50, 50],
      tx
    }
  }

  pub fn set_position(&mut self, position: &[u8; 2]) {
    self.position = *position;
  }
}

pub struct UserManager {
  users: DashMap<Uuid, User>,
  tx: broadcast::Sender<Message>,
}

impl UserManager {
  pub fn new() -> Self {
    let (tx, _rx) = broadcast::channel(1024);

    UserManager {
      users: DashMap::new(),
      tx,
    }
  }

  pub fn add(&self, tx: UnboundedSender<Message>) -> (Uuid, broadcast::Receiver<Message>) {
    let uuid = Uuid::new_v4();
    let rx = self.tx.subscribe();

    self.users.insert(uuid, User::new(tx) );
    
    (uuid, rx)
  }

  pub fn update(&self, uuid: &Uuid, position: &[u8; 2]) {
    if let Some(mut user) = self.users.get_mut(uuid) {
      user.value_mut().set_position(position);
    }
  }

  pub fn remove(&self, uuid: &Uuid) {
    self.users.remove(uuid);
  }

  pub fn send(&self, uuid: &Uuid, message: Message) {
    if let Some(user) = self.users.get(uuid) {
      let _ = user.value().tx.send(message);
    }
  }

  pub fn broadcast(&self, message: Message) {
    let user_amount = self.users.len();
    if user_amount == 0 {
      return;
    }

    let _ = self.tx.send(message);
  }
}