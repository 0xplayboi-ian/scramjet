import { lookup } from "dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { withSolanaRpc } from "../../../../lib/solana/connection";
import {
  decodeMetaplexMetadata,
  isPrivateHostname,
  isPublicHttpUrl,
  metadataPda,
} from "../../../../lib/metadata/readMetaplexMetadata";

export const dynamic = "force-dynamic";

type OffChainFields = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
};

function textField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, max);
}

function pickOffChain(json: unknown): OffChainFields {
  const record = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const extensions =
    record.extensions && typeof record.extensions === "object"
      ? (record.extensions as Record<string, unknown>)
      : {};
  const image = textField(record.image, 500);
  return {
    name: textField(record.name, 32),
    symbol: textField(record.symbol, 10),
    description: textField(record.description, 500),
    image: isPublicHttpUrl(image) ? image : "",
    twitter: textField(record.twitter ?? extensions.twitter, 200),
    telegram: textField(record.telegram ?? extensions.telegram, 200),
    website: textField(record.website ?? record.external_url ?? extensions.website, 200),
  };
}

async function hostResolvesPublic(hostname: string): Promise<boolean> {
  if (isPrivateHostname(hostname)) return false;
  try {
    const results = await lookup(hostname, { all: true, verbatim: true });
    if (results.length === 0) return false;
    return results.every((entry) => !isPrivateHostname(entry.address));
  } catch {
    return false;
  }
}

async function fetchOffChain(uri: string, hopsLeft: number): Promise<OffChainFields | null> {
  if (hopsLeft < 0 || !isPublicHttpUrl(uri)) return null;
  const url = new URL(uri);
  if (!(await hostResolvesPublic(url.hostname))) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(uri, {
      redirect: "manual",
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      return fetchOffChain(new URL(location, uri).toString(), hopsLeft - 1);
    }
    if (!response.ok) return null;
    const text = await response.text();
    if (text.length > 500_000) return null;
    return pickOffChain(JSON.parse(text));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const mintRaw = req.nextUrl.searchParams.get("mint")?.trim() ?? "";
  let mint: PublicKey;
  try {
    mint = new PublicKey(mintRaw);
  } catch {
    return NextResponse.json({ error: "That is not a Solana address." }, { status: 400 });
  }

  try {
    const info = await withSolanaRpc((connection) =>
      connection.getAccountInfo(metadataPda(mint), "confirmed")
    );
    if (!info) {
      return NextResponse.json(
        { error: "That mint has no Metaplex metadata." },
        { status: 404 }
      );
    }

    const onChain = decodeMetaplexMetadata(info.data);
    if (!onChain) {
      return NextResponse.json(
        { error: "The metadata account could not be read." },
        { status: 422 }
      );
    }

    const offChain = isPublicHttpUrl(onChain.uri) ? await fetchOffChain(onChain.uri, 2) : null;
    const name = (offChain?.name || onChain.name).slice(0, 32);
    const symbol = (offChain?.symbol || onChain.symbol).slice(0, 10);

    return NextResponse.json({
      mint: mint.toBase58(),
      name,
      symbol,
      description: offChain?.description ?? "",
      image: offChain?.image || null,
      twitter: offChain?.twitter ?? "",
      telegram: offChain?.telegram ?? "",
      website: offChain?.website ?? "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Metadata lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
