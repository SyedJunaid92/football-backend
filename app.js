import express from "express";
import mongoose from "mongoose";
import cors from "cors";

//Routes
import teamRoute from "./routes/team.js";
import groundRoute from "./routes/ground.js";

import academyRoute from "./routes/academy.js";
import * as CONSTANT from "./Constants/constants.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use("/team", teamRoute);
app.use("/ground", groundRoute);
app.use("/academy", academyRoute);

app.use("*", (req, res, next) => {
  res.status(404).send({
    message: "Wrong Endpoint",
  });
});

mongoose.connect(
  CONSTANT.CONNECTION_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Database Connected");
    app.listen(CONSTANT.PORT, () => console.log("Server Started!"));
  }
);
