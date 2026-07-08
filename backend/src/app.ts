import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        timestamp: new Date(),
        message: "Server is running smoothly"
    });
});

// Basic API route
app.get("/", (req, res) => {
    res.send("Welcome to the Products Management System API!");
});

export default app;
