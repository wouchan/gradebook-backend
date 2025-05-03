import { Router } from "@oak/oak/router";

export default function registerAuthRoutes(router: Router) {
  router.post("/api/auth/login", async (ctx) => {
    const { login, password } = ctx.params as {
      login: string;
      password: string;
    };

    ctx.response.body = {
      token: `${login + password}`,
      user: {
        role: `${login}`,
      },
    };
  });

  router.post("/api/auth/logout", async (ctx) => {
    ctx.response.status = 200;
  });

  router.get("/api/auth/status", async (ctx) => {
    ctx.response.body = {
      user: {
        name: "Adrian",
        role: "student",
      },
    };
  });
}
