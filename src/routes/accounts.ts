import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { accounts } from "../db/schema.ts";
import { Router } from "@oak/oak/router";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export default function registerAccountsRoutes(router: Router) {
  // router.get("/api/accounts", async (ctx) => {
  //   try {
  //     const allAccounts = await db.select().from(accounts);
  //     ctx.response.body = allAccounts;
  //   } catch (err) {
  //     console.log(err);
  //     ctx.response.status = 500;
  //     ctx.response.body = { error: "Failed to fetch accounts" };
  //   }
  // });

  // router.get("/api/accounts/:id", async (ctx) => {
  //   const { id } = ctx.params as { id: string };

  //   try {
  //     const account = await db
  //       .select()
  //       .from(accounts)
  //       .where(eq(accounts.id, parseInt(id)))
  //       .limit(1);

  //     if (account.length === 0) {
  //       ctx.response.status = 404;
  //       ctx.response.body = { error: "Account not found" };
  //     } else {
  //       ctx.response.body = account[0];
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     ctx.response.status = 500;
  //     ctx.response.body = { error: "Failed to fetch account" };
  //   }
  // });

  router.post("/api/accounts", async (ctx) => {
    const { name, email, role, password } = await ctx.request.body.json() as {
      name: string;
      email: string;
      role: "student" | "teacher" | "admin";
      password: string;
    };

    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const salt = encodeBase32LowerCaseNoPadding(bytes);

    const password_hash = encodeHexLowerCase(
      sha256(new TextEncoder().encode(password.concat(salt))),
    );

    try {
      const newAccount = await db
        .insert(accounts)
        .values({
          name,
          email,
          role,
          salt,
          password_hash,
        })
        .returning({
          id: accounts.id,
          name: accounts.name,
          email: accounts.email,
          role: accounts.role,
        });

      ctx.response.body = newAccount[0];
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to create account" };
    }
  });

  // router.put("/api/accounts/:id", async (ctx) => {
  //   const { id } = ctx.params as { id: string };
  //   const { name, email, role, password } = await ctx.request.body.json() as {
  //     name: string;
  //     email: string;
  //     role: "student" | "teacher" | "admin";
  //     password: string;
  //   };

  //   try {
  //     const updatedAccount = await db
  //       .update(accounts)
  //       .set({ name, email, role, password })
  //       .where(eq(accounts.id, parseInt(id)))
  //       .returning({
  //         id: accounts.id,
  //         name: accounts.name,
  //         email: accounts.email,
  //         role: accounts.role,
  //       });

  //     if (updatedAccount.length === 0) {
  //       ctx.response.status = 404;
  //       ctx.response.body = { error: "Account not found" };
  //     } else {
  //       ctx.response.body = updatedAccount[0];
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     ctx.response.status = 500;
  //     ctx.response.body = { error: "Failed to update account" };
  //   }
  // });

  router.delete("/api/accounts/:id", async (ctx) => {
    const { id } = ctx.params as { id: string };

    try {
      const deletedAccount = await db
        .delete(accounts)
        .where(eq(accounts.id, parseInt(id)))
        .returning();

      if (deletedAccount.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Account not found" };
      } else {
        ctx.response.body = { message: "Account deleted successfully" };
      }
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete account" };
    }
  });
}
