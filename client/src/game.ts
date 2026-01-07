class NetworkManager extends EventTarget {
  private ws: WebSocket;

  // Packet Types based on your test script
  public static PLAYER_JOIN = 0x00;
  public static PLAYER_MOVE = 0x01;
  public static PLAYER_LEAVE = 0x02;

  constructor(url: string) {
    super();
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";

    this.ws.addEventListener("open", () =>
      this.dispatchEvent(new Event("connected"))
    );
    this.ws.addEventListener("message", (event) =>
      this.handleMessage(event.data)
    );
    this.ws.addEventListener("close", () =>
      this.dispatchEvent(new Event("disconnected"))
    );
  }

  private handleMessage(data: ArrayBuffer) {
    const view = new DataView(data);
    let offset = 0;

    while (offset < data.byteLength) {
      const packetType = view.getUint8(offset++);

      switch (packetType) {
        case NetworkManager.PLAYER_JOIN: {
          const uuid = this.readUUID(data, offset);
          offset += 16;
          this.dispatchEvent(
            new CustomEvent("playerJoin", { detail: { uuid } })
          );
          break;
        }

        case NetworkManager.PLAYER_MOVE: {
          const uuid = this.readUUID(data, offset);
          offset += 16;
          const x = view.getUint8(offset++);
          const y = view.getUint8(offset++);
          this.dispatchEvent(
            new CustomEvent("playerMove", { detail: { uuid, x, y } })
          );
          break;
        }

        case NetworkManager.PLAYER_LEAVE: {
          const uuid = this.readUUID(data, offset);
          offset += 16;
          this.dispatchEvent(
            new CustomEvent("playerLeave", { detail: { uuid } })
          );
          break;
        }

        default:
          console.warn("Unknown packet type:", packetType);
          return; // Protocol error, stop parsing
      }
    }
  }

  private readUUID(data: ArrayBuffer, offset: number): string {
    const bytes = new Uint8Array(data.slice(offset, offset + 16));
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  sendMove(uuid: string, x: number, y: number) {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    const buffer = new ArrayBuffer(19);
    const view = new DataView(buffer);

    view.setUint8(0, NetworkManager.PLAYER_MOVE);
    const hex = uuid.replace(/-/g, "");
    for (let i = 0; i < 16; i++) {
      view.setUint8(1 + i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
    }
    view.setUint8(17, x);
    view.setUint8(18, y);
    this.ws.send(buffer);
  }
}

const CANVAS_SIZE = 512;
const GRID_SIZE = 256;
const SCALE = CANVAS_SIZE / GRID_SIZE;

const SPRITE_W = 32;
const SPRITE_H = 32;
const ANIM_SPEED = 0.025;

interface Player {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  facing: "up" | "down" | "left" | "right";
  animFrame: number;
  lastUpdate: number;
}

const users = new Map<string, Player>();
const keys = new Set<string>();

const userState = {
  uuid: null as string | null,
  position: new Uint8Array([0, 0]),
  lastSent: 0
};

// --- Inicjalizacja DOM ---
const canvas = document.createElement("canvas");
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
canvas.style.cssText = `display: block; margin: 20px auto; border: 4px solid #3e4656; background-color: #2e3440;`;
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

const info = document.createElement("div");
info.style.cssText = `text-align: center; color: white; font-family: monospace;`;
document.body.append(info);

// --- Asset Manager ---
const assets = {
  char: new Image(),
  shadow: new Image(),
  tile: new Image()
};
assets.char.src = "./prototype_character.png";
assets.shadow.src = "./prototype_character_shadow.png";
assets.tile.src = "./tile.png";

const ANIM_ROWS = {
  idle: { down: 0, up: 2, right: 1, left: 1 },
  move: { down: 3, up: 5, right: 4, left: 4 }
};

// --- Sieć ---
const net = new NetworkManager("ws://localhost:9001");

net.addEventListener("connected", () => {});

net.addEventListener("disconnected", () => {
  info.innerText = "Status: Disconnected.";
  users.clear();
});

// --- Updated Network Listeners ---

net.addEventListener("playerJoin", (e: any) => {
  const { uuid } = e.detail;

  // If we don't have a UUID yet, the first Join packet is US
  if (!userState.uuid) {
    userState.uuid = uuid;
    info.innerText = `Status: Connected as ${uuid}. Use WASD to move.`;
  }

  if (!users.has(uuid)) {
    users.set(uuid, {
      id: uuid,
      x: 0,
      targetX: 0,
      y: 0,
      targetY: 0,
      isMoving: false,
      facing: "down",
      animFrame: 0,
      lastUpdate: Date.now()
    });
  }
});

net.addEventListener("playerMove", (e: any) => {
  const { uuid, x, y } = e.detail;
  const p = users.get(uuid);

  if (p) {
    p.targetX = x;
    p.targetY = y;
    p.lastUpdate = Date.now();
  } else {
    // If we get a move for someone we don't know, treat it as a join
    // This handles cases where a player was already in the room
    net.dispatchEvent(new CustomEvent("playerJoin", { detail: { uuid } }));
  }
});

net.addEventListener("playerLeave", (e: any) => {
  const { uuid } = e.detail;
  users.delete(uuid);
});

// --- Pętla Logiki i Renderowania ---
function handleInput() {
  if (!userState.uuid) return;
  const now = Date.now();
  if (now - userState.lastSent < 30) return;

  let dx = 0,
    dy = 0;
  const speed = keys.has("shift") ? 2 : 1;

  if (keys.has("w")) dy -= speed;
  if (keys.has("s")) dy += speed;
  if (keys.has("a")) dx -= speed;
  if (keys.has("d")) dx += speed;

  if (dx !== 0 || dy !== 0) {
    userState.position[0] =
      (userState.position[0]! + dx + GRID_SIZE) % GRID_SIZE;
    userState.position[1] =
      (userState.position[1]! + dy + GRID_SIZE) % GRID_SIZE;

    net.sendMove(userState.uuid, userState.position[0], userState.position[1]);
    userState.lastSent = now;
  }
}

const drawBackground = () => {
  if (!assets.tile.complete) return;
  const tS = 16; // Zakładamy rozmiar kafelka źródłowego 16x16 lub podobny
  const outS = 32; // Rozmiar rysowanego kafelka

  for (let y = 0; y < CANVAS_SIZE; y += outS) {
    for (let x = 0; x < CANVAS_SIZE; x += outS) {
      let sx = 1,
        sy = 1; // Middle Middle (default)

      // Wybór fragmentu tile.png
      if (x === 0) sx = 0; // Left
      else if (x >= CANVAS_SIZE - outS) sx = 2; // Right

      if (y === 0) sy = 0; // Top
      else if (y >= CANVAS_SIZE - outS) sy = 2; // Bottom

      ctx.drawImage(
        assets.tile,
        sx * (assets.tile.width / 3),
        sy * (assets.tile.height / 3),
        assets.tile.width / 3,
        assets.tile.height / 3,
        x,
        y,
        outS,
        outS
      );
    }
  }
};

const drawPlayer = (p: Player) => {
  const prevX = p.x;
  const prevY = p.y;

  // Interpolation (Lerp)
  p.x += (p.targetX - p.x) * 0.15;
  p.y += (p.targetY - p.y) * 0.15;

  const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
  p.isMoving = dist > 0.1;

  // ... (facing and animFrame logic remains the same)
  if (p.isMoving) {
    const angle = Math.atan2(p.targetY - prevY, p.targetX - prevX);
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) p.facing = "right";
    else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4)
      p.facing = "down";
    else if (angle > (-3 * Math.PI) / 4 && angle <= -Math.PI / 4)
      p.facing = "up";
    else p.facing = "left";
    p.animFrame = (p.animFrame + ANIM_SPEED) % 4;
  } else {
    p.animFrame = (p.animFrame + ANIM_SPEED * 0.5) % 2;
  }

  const renderX = Math.round(p.x * SCALE);
  const renderY = Math.round(p.y * SCALE);
  const row = p.isMoving ? ANIM_ROWS.move[p.facing] : ANIM_ROWS.idle[p.facing];
  const col = Math.floor(p.animFrame);

  ctx.save();
  ctx.translate(renderX, renderY);

  // --- HUE CHANGE FOR LOCAL PLAYER ---
  if (p.id === userState.uuid) {
    // 180deg turns red/blue into their opposites.
    // You can also add 'brightness(1.2)' to make it even more obvious.
    ctx.filter = "hue-rotate(180deg) brightness(1.2)";
  }

  if (p.facing === "left") ctx.scale(-1, 1);

  if (assets.shadow.complete) {
    ctx.drawImage(
      assets.shadow,
      col * SPRITE_W,
      row * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      -SPRITE_W,
      -SPRITE_H,
      SPRITE_W * 2,
      SPRITE_H * 2
    );
  }

  if (assets.char.complete) {
    ctx.drawImage(
      assets.char,
      col * SPRITE_W,
      row * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      -SPRITE_W,
      -SPRITE_H,
      SPRITE_W * 2,
      SPRITE_H * 2
    );
  }

  ctx.restore();
  // Reset filter is handled by ctx.restore(), so other players remain normal.
};

// --- Systemowe ---
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const loop = () => {
  handleInput();
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawBackground();

  // Cleanup: usuń graczy, którzy nie wysłali aktualizacji przez 2 sekundy
  const now = Date.now();
  for (const [id, p] of users) {
    if (now - p.lastUpdate > 200000) users.delete(id);
    else drawPlayer(p);
  }

  requestAnimationFrame(loop);
};

document.body.style.backgroundColor = "#1e222a";
requestAnimationFrame(loop);
