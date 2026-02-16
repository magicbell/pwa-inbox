import { nanoid } from "nanoid"

const ID_LEN = 8
const SIG_LEN = 6
export const TOKEN_LEN = ID_LEN + SIG_LEN

async function hmacSign(id: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(id),
  )
  // base64url encode, take first SIG_LEN chars
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
  return b64.slice(0, SIG_LEN)
}

export async function createSignedId(secret: string): Promise<string> {
  const id = nanoid(ID_LEN)
  const sig = await hmacSign(id, secret)
  return id + sig
}

export async function verifySignedId(
  token: string,
  secret: string,
): Promise<string | null> {
  if (token.length !== TOKEN_LEN) return null
  const id = token.slice(0, ID_LEN)
  const sig = token.slice(ID_LEN)
  const expected = await hmacSign(id, secret)
  if (sig !== expected) return null
  return id
}

const WRITE_PREFIX = "write:"

export async function createWriteId(
  readId: string,
  secret: string,
): Promise<string> {
  const id = readId.slice(0, ID_LEN)
  const sig = await hmacSign(WRITE_PREFIX + id, secret)
  return id + sig
}

export async function verifyWriteId(
  token: string,
  secret: string,
): Promise<string | null> {
  if (token.length !== TOKEN_LEN) return null
  const id = token.slice(0, ID_LEN)
  const sig = token.slice(ID_LEN)
  const expected = await hmacSign(WRITE_PREFIX + id, secret)
  if (sig !== expected) return null
  return id
}

export async function readIdFromNanoid(
  nanoid: string,
  secret: string,
): Promise<string> {
  const sig = await hmacSign(nanoid, secret)
  return nanoid + sig
}
