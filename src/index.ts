import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import Secrets from "./config/secrets";
import { connectDb } from "./config/db";
import routes from "./routes";
import errorMiddleware from "./middlewares/error";
import ErrorHandler from "./utils/errorhandler";
import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app: express.Application = express();

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },

    noSniff: true,
    frameguard: { action: "sameorigin" },
    referrerPolicy: { policy: "same-origin" },
    xssFilter: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use((req: Request, res: Response, next) => {
  if (req.path.includes("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  } else {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
});

app.use(
  cors({
    origin: (origin, cb) => cb(null, origin ?? true),
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    exposedHeaders: ["set-cookie"],
    allowedHeaders: ["Content-Type", "Authorization", "x-xsrf"],
  }),
);

app.set("trust proxy", 1);
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.status(StatusCodes.OK).json({ status: "ok" });
});

app.use("/api", routes);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorHandler(`Route not found: ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND));
});

app.use(errorMiddleware);

async function start() {
  try {
    await connectDb();
    app.listen(Secrets.PORT, () => {
      console.log(`Server is running on port ${Secrets.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit();
});
process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  process.exit();
});
