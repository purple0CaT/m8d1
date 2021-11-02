import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
} from "./errorHadlers.js";

const server = express();
const port = process.env.PORT || 3003;
server.use(cors());
server.use(express.json());
// === Midlewares
// === Routes
// server.use("/users");

// ===

server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(catchAllHandler);

console.table(listEndpoints(server));

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected!");
  server.listen(port, () => {
    console.log(`🚀 => ${port}`);
  });
});
