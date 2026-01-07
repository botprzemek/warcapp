document.body.innerHTML = `
  <h2>WebSocket Engine Test</h2>

  <button id="connect">Connect</button>
  <button id="send">Send Move</button>
  <button id="disconnect">Disconnect</button>
  <button id="clear-log">Clear Log</button>

  <pre id="status">disconnected</pre>
  <ul id="log"></ul>
`;

function updatePlayerPosition(uuid: string, position: [number, number]) {
  const player = players.get(uuid);

  if (!player) return;

  player.position = position;
  players.set(uuid, player);
}

const PLAYER_JOIN = 0x0;
const PLAYER_MOVE = 0x1;
const PLAYER_LEAVE = 0x2;

const players = new Map<
  string,
  {
    position: [number, number];
  }
>();

const user = {
  uuid: null as string | null
};

let ws: null | WebSocket = null;

const status = document.getElementById("status")!;
const log = document.getElementById("log")!;

function logLine(text: string) {
  const li = document.createElement("li");
  li.textContent = text;
  log.appendChild(li);
}

function hexToBytes(hex: string) {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------ CONNECT ------------------ */

document.getElementById("connect")!.onclick = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  ws = new WebSocket("ws://localhost:9001");
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    status.textContent = "connected";
    logLine("CONNECTED");
  };

  ws.onclose = () => {
    status.textContent = "disconnected";
    logLine("DISCONNECTED");
  };

  ws.onmessage = (event) => handleMessage(event.data);
};

/* ------------------ SEND ------------------ */

document.getElementById("send")!.onclick = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (!user.uuid) return;

  const x = Math.floor(Math.random() * 256);
  const y = Math.floor(Math.random() * 256);

  const buffer = new ArrayBuffer(19);
  const view = new DataView(buffer);
  let offset = 0;

  view.setUint8(offset++, PLAYER_MOVE);

  hexToBytes(user.uuid).forEach((b) => view.setUint8(offset++, b));
  view.setUint8(offset++, x);
  view.setUint8(offset++, y);

  ws.send(buffer);
  logLine(`SEND → move ${x},${y}`);
};

/* ------------------ DISCONNECT ------------------ */

document.getElementById("disconnect")!.onclick = () => {
  if (!ws) return;

  ws.close();
};

/* ------------------ CLEAR LOG ------------------ */

document.getElementById("clear-log")!.onclick = () => {
  log.innerHTML = "";
};

/* ------------------ MESSAGE HANDLER ------------------ */

function handleMessage(data: ArrayBuffer) {
  const view = new DataView(data);
  let offset = 0;

  while (offset < data.byteLength) {
    const type = view.getUint8(offset++);

    switch (type) {
      /* ---------- PLAYER JOIN ---------- */
      case PLAYER_JOIN: {
        if (offset + 16 > data.byteLength) return;

        const uuid = bytesToHex(
          new Uint8Array(data.slice(offset, offset + 16))
        );
        offset += 16;

        players.set(uuid, {
          position: [0, 0]
        });

        if (user.uuid === null) {
          user.uuid = uuid;
          logLine(`ASSIGNED UUID: ${uuid}`);
        }

        logLine(`JOIN ← ${uuid}`);
        break;
      }

      /* ---------- PLAYER MOVE ---------- */
      case PLAYER_MOVE: {
        if (offset + 18 > data.byteLength) return;

        const uuid = bytesToHex(
          new Uint8Array(data.slice(offset, offset + 16))
        );
        offset += 16;

        const x = view.getUint8(offset++);
        const y = view.getUint8(offset++);

        const player = players.get(uuid);
        if (player) {
          player.position = [x, y];
        }

        logLine(`MOVE ← ${uuid} @ ${x},${y}`);
        break;
      }

      /* ---------- PLAYER LEAVE ---------- */
      case PLAYER_LEAVE: {
        if (offset + 16 > data.byteLength) return;

        const uuid = bytesToHex(
          new Uint8Array(data.slice(offset, offset + 16))
        );
        offset += 16;

        players.delete(uuid);
        logLine(`LEAVE ← ${uuid}`);
        break;
      }

      /* ---------- UNKNOWN ---------- */
      default:
        logLine(`UNKNOWN PACKET TYPE: ${type}`);
        return; // hard protocol stop
    }
  }
}
