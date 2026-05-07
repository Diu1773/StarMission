import { api } from "./client";

export const authApi = {
  googleLogin: (credential, token_type = "id_token") =>
    api.post("/api/auth/google", { credential, token_type }),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout", {}),
};
