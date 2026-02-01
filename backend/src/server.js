import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";

import { apiRouter } from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { socketAuth } from "./sockets/socketAuth.js";
import { registerSocketHandlers } from "./sockets/handlers.js";
import { startAccessExpiryJob } from "./jobs/accessExpiry.job.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  }
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// Routes
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", apiRouter);

// Errors
app.use(notFound);
app.use(errorHandler);

// Socket auth + handlers
io.use(socketAuth);
registerSocketHandlers(io);

// Background job: keep user status updated
startAccessExpiryJob();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
