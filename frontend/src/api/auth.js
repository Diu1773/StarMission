import { api } from "./client";

export const authApi = {
  googleLogin: (credential) => api.post("/api/auth/google", { credential }),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout", {}),
};
