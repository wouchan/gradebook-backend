import { Router } from "@oak/oak/router";
import { createSession, generateSessionToken } from "../auth/session.ts";
import { db } from "../db/index.ts";
import { accounts, sessions } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export default function registerAuthRoutes(router: Router) {
  router.post("/api/auth/login", async (ctx) => {
    const { username, password } = await ctx.request.body.json() as {
      username: string;
      password: string;
    };

    let accountData;

    try {
      const account = await db
        .select()
        .from(accounts)
        .where(eq(accounts.email, username))
        .limit(1);

      if (account.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Account not found" };
        return;
      } else {
        accountData = account[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Login error" };
      return;
    }

    const password_hash = encodeHexLowerCase(
      sha256(new TextEncoder().encode(password.concat(accountData!.salt))),
    );

    if (password_hash != accountData!.password_hash) {
      ctx.response.status = 500;
      ctx.response.body = { error: "Login error" };
      return;
    }

    const token = generateSessionToken();
    createSession(token, accountData!.id);

    ctx.response.body = {
      token,
      user: {
        name: accountData!.name,
        role: accountData!.role,
      },
    };
  });

  router.post("/api/auth/logout", (ctx) => {
    ctx.response.status = 200;
  });

  router.get("/api/auth/status", async (ctx) => {
    const token = await ctx.cookies.get("token");

    if (!token) {
      ctx.response.status = 500;
      ctx.response.body = { error: "Login error" };
      return;
    }

    let sessionData;

    try {
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, token))
        .limit(1);

      if (session.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Session not found" };
        return;
      } else {
        sessionData = session[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch session" };
      return;
    }

    let accountData;

    try {
      const account = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, sessionData!.accountId))
        .limit(1);

      if (account.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Account not found" };
      } else {
        accountData = account[0];
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch account" };
      return;
    }

    ctx.response.body = {
      user: {
        name: accountData!.name,
        role: accountData!.role,
      },
    };
  });
}
