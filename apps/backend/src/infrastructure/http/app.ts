import express from "express";
import cors from "cors";
import { env } from "../../config/env.js";
import router from "./routes.js";
import { errorHandler } from "./middleware/error.handler.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use(errorHandler);

export default app;
