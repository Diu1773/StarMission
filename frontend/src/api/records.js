import { api } from "./client";

export const recordsApi = {
  create: (data) => api.post("/api/records", data),
  list: () => api.get("/api/records"),
  get: (id) => api.get(`/api/records/${id}`),
};
