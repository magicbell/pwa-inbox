import * as jose from "jose"

export async function generateToken(
  id: string,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const secret = new TextEncoder().encode(apiSecret)
  return await new jose.SignJWT({
    user_email: null,
    user_external_id: id,
    api_key: apiKey,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}
