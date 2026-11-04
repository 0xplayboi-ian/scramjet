import { PublicKey } from "@solana/web3.js";

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export type OnChainTokenMetadata = {
  name: string;
  symbol: string;
  uri: string;
};

export function metadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return pda;
}

function cleanFixedString(value: string): string {
  return value.replace(/\0/g, "").trim();
}

/**
 * Reads the Metaplex metadata account body.
 * Name, symbol, and URI are length-prefixed strings. On-chain writers pad
 * the bytes with nulls up to the field max, so those nulls are stripped.
 */
export function decodeMetaplexMetadata(data: UintArrayLike): OnChainTokenMetadata | null {
  const view = Buffer.from(data);
  if (view.length < 69 || view[0] !== 4) return null;

  let offset = 1 + 32 + 32;
  const readString = (): string | null => {
    if (offset + 4 > view.length) return null;
    const length = view.readUInt32LE(offset);
    offset += 4;
    if (length > 400 || offset + length > view.length) return null;
    const text = cleanFixedString(view.subarray(offset, offset + length).toString("utf8"));
    offset += length;
    return text;
  };

  const name = readString();
  const symbol = readString();
  const uri = readString();
  if (name === null || symbol === null || uri === null) return null;
  if (!name && !symbol) return null;
  return { name, symbol, uri };
}

type UintArrayLike = Uint8Array | Buffer;

export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0"
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if ([a, b, Number(ipv4[3]), Number(ipv4[4])].some((part) => part > 255)) return true;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }

  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }
  return false;
}

/** HTTP(S) URL whose hostname is not a local or private address literal. */
export function isPublicHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;
    return !isPrivateHostname(url.hostname);
  } catch {
    return false;
  }
}
