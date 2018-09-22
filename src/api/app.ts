import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import expressValidator from "express-validator";

// Controllers (route handlers)
import * as apiController from "./controllers/api";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.get("/api", apiController.index);

export default app;