import express, { Request, Response, NextFunction } from "express";
const app = express();
import { ENVIRONMENT } from "./common/config/environment";
import { connectDb } from "./common/config/database";
import cors from "cors";
import swapRouter from "./modules/routes/swap.router";

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.disable("x-powered-by");

// Routes
app.use("/api", swapRouter);

// Welcome Message
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Welcome to Gasless Swap API",
  });
});

// status check
app.get("/health", (req: Request, res: Response) => {
  res.send({
    Time: new Date(),
    status: "running",
  });
});

// error check
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error caught by middleware:", err);

  res.status(err.status || 500).json({
    status: false,
    message: err.message || "An unexpected error occurred",
    error: err.stack, // Include stack trace for debugging (remove in production)
  });

  next(); // Optional: Remove this if no further middleware needs to handle the error
});

app.listen(ENVIRONMENT.APP.PORT, () => {
  console.log(
    `${ENVIRONMENT.APP.NAME} Running on http://localhost:${ENVIRONMENT.APP.PORT}`
  );

  connectDb();
});