import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import config from "./config/index.js";
import { logger, morganStream } from "./utils/logger.js";
import apiRouter from "./routes/index.js";
import v1Router from "./routes/v1/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

app.use(helmet());

const allowedOrigins = config.cors.allowedOrigins.split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

const morganFormat = config.env === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: morganStream }));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(compression());

app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Stock Market Authentication Backend is healthy and running.",
    timestamp: new Date().toISOString(),
  });
});

app.use(config.apiPrefix || "/api/auth", apiRouter);
app.use("/api/v1", v1Router);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
