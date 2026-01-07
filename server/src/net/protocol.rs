use bytes::{Bytes, BufMut, BytesMut};

use tokio_tungstenite::tungstenite::protocol::Message;

use uuid::Uuid;

#[repr(u8)]
pub enum PacketType {
  PlayerJoin = 0x0,
  PlayerMove = 0x1,
  PlayerLeave = 0x2,
}

pub enum PacketData {
  PlayerJoin {
    uuid: Uuid,
  },
  PlayerMove {
    uuid: Uuid,
    position: [u8; 2],
  },
  PlayerLeave {
    uuid: Uuid,
  },
}

pub fn read(data: &Bytes) -> Option<PacketData> {
  let mut offset = 0;

  let packet_type = *data.get(offset)?;
  offset += 1;
  
  let uuid = Uuid::from_slice(&data[offset..offset + size_of::<Uuid>()]).ok()?;
  offset += size_of::<Uuid>();

  match packet_type {
    packet_type if packet_type == PacketType::PlayerJoin as u8 => {
      Some(PacketData::PlayerJoin {
        uuid,
      })
    },
    packet_type if packet_type == PacketType::PlayerMove as u8 => {
      if data.len() < offset + 2 {
        return None;
      }

      let position: [u8; 2] = [ *data.get(offset)?, *data.get(offset + 1)? ];

      Some(PacketData::PlayerMove {
        uuid,
        position,
      })
    },
    packet_type if packet_type == PacketType::PlayerLeave as u8 => {
      Some(PacketData::PlayerLeave {
        uuid,
      })
    },
    _ => None,
  }
}

pub fn write(data: &PacketData) -> Message {
  let mut buf = BytesMut::with_capacity(size_of::<u8>() + 63);

  match data {
    PacketData::PlayerJoin { uuid } => {
      buf.put_u8(PacketType::PlayerJoin as u8);
      buf.put_slice(uuid.as_bytes());
    },
    PacketData::PlayerMove { uuid, position } => {
      buf.put_u8(PacketType::PlayerMove as u8);
      buf.put_slice(uuid.as_bytes());
      buf.put_slice(position);
    },
    PacketData::PlayerLeave { uuid } => {
      buf.put_u8(PacketType::PlayerLeave as u8);
      buf.put_slice(uuid.as_bytes());
    },
  }

  Message::Binary(buf.freeze())
}