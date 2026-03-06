import { db, session, user } from "@game-crypto/database";
import { and, eq, gt } from "drizzle-orm";

export interface AuthenticatedPlayer {
  userId: string;
  name: string;
  avatar: string;
}

export async function validateSessionToken(
  token: string,
): Promise<AuthenticatedPlayer | null> {
  if (!token) {
    return null;
  }

  const now = new Date();
  const result = await db
    .select({
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
    })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(and(eq(session.token, token), gt(session.expiresAt, now)))
    .limit(1);

  return result[0] ?? null;
}
