import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "./jwt";

export async function getAuthenticatedAdmin(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    return decoded;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<JwtPayload> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  return admin;
}