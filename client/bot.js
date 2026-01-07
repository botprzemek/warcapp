// --- Network Manager (same protocol as game.ts) ---
class NetworkManager extends EventTarget {
  static PLAYER_JOIN = 0x00;
  static PLAYER_MOVE = 0x01;
  static PLAYER_LEAVE = 0x02;

  ws;

  constructor(url) {
    super();
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";

    this.ws.addEventListener("open", () =>
      this.dispatchEvent(new Event("connected"))
    );

    this.ws.addEventListener("message", (e) => this.handleMessage(e.data));

    this.ws.addEventListener("close", () =>
      this.dispatchEvent(new Event("disconnected"))
    );
  }

  handleMessage(data) {
    const view = new DataView(data);
    let offset = 0;

    while (offset < data.byteLength) {
      const type = view.getUint8(offset++);

      switch (type) {
        case NetworkManager.PLAYER_JOIN: {
          const uuid = readUUID(data, offset);
          offset += 16;
          this.dispatchEvent(
            new CustomEvent("playerJoin", { detail: { uuid } })
          );
          break;
        }

        case NetworkManager.PLAYER_MOVE: {
          const uuid = readUUID(data, offset);
          offset += 16;
          const x = view.getUint8(offset++);
          const y = view.getUint8(offset++);
          this.dispatchEvent(
            new CustomEvent("playerMove", { detail: { uuid, x, y } })
          );
          break;
        }

        case NetworkManager.PLAYER_LEAVE: {
          const uuid = readUUID(data, offset);
          offset += 16;
          this.dispatchEvent(
            new CustomEvent("playerLeave", { detail: { uuid } })
          );
          break;
        }

        default:
          console.warn("Unknown packet:", type);
          return;
      }
    }
  }

  sendMove(uuid, x, y) {
    if (this.ws.readyState !== WebSocket.OPEN) return;

    const buffer = new ArrayBuffer(19);
    const view = new DataView(buffer);

    view.setUint8(0, NetworkManager.PLAYER_MOVE);
    hexToBytes(uuid).forEach((b, i) => view.setUint8(1 + i, b));
    view.setUint8(17, x);
    view.setUint8(18, y);

    this.ws.send(buffer);
  }
}

// --- Helpers ---
function readUUID(buffer, offset) {
  return [...new Uint8Array(buffer.slice(offset, offset + 16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

// --- Bot ---
class Bot {
  uuid = null;
  x = Math.floor(Math.random() * 256);
  y = Math.floor(Math.random() * 256);
  ready = false;

  constructor(url) {
    this.net = new NetworkManager(url);

    this.net.addEventListener("playerJoin", (e) => {
      // First join packet = us
      if (!this.uuid) {
        this.uuid = e.detail.uuid;
        this.ready = true;
        this.start();
      }
    });
  }

  start() {
    const tick = () => {
      if (!this.ready) return;

      this.x = (this.x + (Math.random() > 0.5 ? 1 : -1) + 256) % 256;
      this.y = (this.y + (Math.random() > 0.5 ? 1 : -1) + 256) % 256;

      this.net.sendMove(this.uuid, this.x, this.y);

      setTimeout(tick, 30 + Math.random() * 50);
    };
    tick();
  }
}

// --- Launch bot army ---
const BOTS = 20;
const URL = "ws://localhost:9001";
const army = [];

console.log(`Spawning ${BOTS} bots`);

for (let i = 0; i < BOTS; i++) {
  setTimeout(() => {
    army.push(new Bot(URL));
    if (i % 10 === 0) console.log(`Spawned ${i}`);
  }, i * 20);
}

setInterval(() => {
  const active = army.filter((b) => b.ready).length;
  console.log(`Active bots: ${active}/${BOTS}`);
}, 5000);
