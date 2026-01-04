import { createKey } from "@/data/hash";
import { decode, read } from "@/data/buffer";

import { IncomingMessage } from "node:http";
import { Duplex } from "node:stream";
import { canParse } from "@/utils/json";

interface HeadersData {
    privateKey: string;
}

const SEVEN_BITS_MARKER: number = 0x7e;
const SIXTEEN_BITS_MARKER: number = 0x7f;

const MASK_KEY: number = 0x04;
const FIRST_BIT: number = 0x80;

function headers(data: HeadersData): string {
    const key: string = createKey(data.privateKey);
    const end: string = "\r\n";

    return [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${key}`,
        end,
    ].join(end);
}

function readable(socket: Duplex): void {
    if (!socket) {
        return;
    }

    socket.read(0x01);
    const [length] = socket.read(0x01);
    const lengthIndicatorInBits: number = length - FIRST_BIT;

    if (lengthIndicatorInBits > SIXTEEN_BITS_MARKER) {
        throw new Error(
            "Received message is too long! This server does not handle 64-bit messages!",
        );
    }

    let size: number =
        lengthIndicatorInBits <= SEVEN_BITS_MARKER
            ? lengthIndicatorInBits
            : socket.read(0x02).readUint16BE(0x00);

    const maskKey: Buffer = socket.read(MASK_KEY);
    const encoded: Buffer = socket.read(size);

    const decoded: Buffer = decode(encoded, maskKey);
    const received: string = decoded.toString("utf-8");

    if (!canParse(received)) {
        return;
    }

    const data = JSON.parse(received);

    const message: Buffer = read({
        message: data,
        at: new Date().toISOString(),
    });

    socket.write(message);
}

export function upgrade(
    request: IncomingMessage,
    socket: Duplex,
    _: Buffer,
): void {
    const { "sec-websocket-key": key } = request.headers;

    if (!key) {
        return;
    }

    socket.write(headers({ privateKey: key }));
    socket.on("readable", () => readable(socket));
}
