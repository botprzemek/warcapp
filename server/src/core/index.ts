import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

function hsvToRgb(h: number, s: number, v: number): Uint8Array {
    const f = (n: number, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const data = new Uint8Array(3);

    data.set([
        Math.round(f(5) * 255),
        Math.round(f(3) * 255),
        Math.round(f(1) * 255)
    ]);

    return data;
}

let tickCount = 0;
let sequence = 0;
const TICKS_PER_SECOND = 1;

Buffer.prototype.writeUint8Array = writeUint8Array;

class Datagram extends Buffer {
    constructor() {
        super();
    }

    writeUint8Array(buffer: Buffer, array: Uint8Array, offset: number = 0) {
        for (const int of array) {
            buffer.writeUint8(int, offset);
            offset++;
        }
    }
}

wss.on("connection", (socket) => {
    const interval = setInterval(() => {
        // Cycle hue based on tickCount (0-360 degrees)
        const hue = ((tickCount % 360) / 360) * 360;

        const data = Buffer.alloc(5);

        // data.writeUint16BE(uid);
        data.writeUint16BE(sequence, 0);
        writeUint8Array(data, hsvToRgb(hue, 1, 1), 2);

        socket.send(data);

        tickCount++;
        sequence++ & 0xffff;
    }, 1000 / TICKS_PER_SECOND);

    socket.on("close", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

import { randomBytes } from "crypto";

export abstract class Data {
    abstract wrap(
        uid: number,
        sequence: number,
        type: number,
        data: Uint8Array
    ): Buffer;
}

export class PlayerData extends Data {
    public wrap(
        uid: number,
        sequence: number,
        type: MessageType,
        data: Uint8Array
    ) {
        const payload = Buffer.alloc(128);

        payload.writeUInt16BE(uid, 0);
        payload.writeUInt16BE(sequence, 2);
        payload.writeUInt8(type, 4);
        payload.subarray(data, data.length + payload.byteOffset);

        return payload;
    }
}
export class EnemyData extends Data {}
export class ServerData extends Data {}

// prettier-ignore
enum MessageType {
    // Player messages (client to server)
    PLAYER_CONNECTED   = 0x00000001,
    PLAYER_MOVE        = 0x00000002,
    PLAYER_BEAT        = 0x00000003,
    PLAYER_CROWN       = 0x00000004,
    PLAYER_HEARTBEAT   = 0x00000005,
    PLAYER_FORFEIT     = 0x00000006,

    // Enemy actions (server to client)
    ENEMY_MOVE         = 0x00010001,
    ENEMY_BEAT         = 0x00010002,
    ENEMY_CROWN        = 0x00010003,
    ENEMY_DISCONNECTED = 0x00010004,
    ENEMY_RECONNECTED  = 0x00010005,

    // Server messages
    SERVER_SYNC_STATE  = 0x00020001,
    SERVER_TURN_CHANGED= 0x00020002,
    SERVER_INVALID_MOVE= 0x00020003,
    SERVER_GAME_OVER   = 0x00020004,
    SERVER_PROMPT_MOVE = 0x00020005,
    SERVER_ACK         = 0x00020006,
    SERVER_ERROR       = 0x00020007,
}
