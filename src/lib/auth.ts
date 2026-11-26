import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "qa_admin_session";
const SESSION_ISSUER = "qa-automation-portfolio";
const SESSION_AUDIENCE = "qa-portfolio-admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

async function getSigningKey(): Promise<Uint8Array> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  // Derive a fixed-length HS256 key from the configured admin secret.
  const material = new TextEncoder().encode(`qa-portfolio-session:${password}`);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", material));
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(await getSigningKey());
}

export async function isValidAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, await getSigningKey(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
