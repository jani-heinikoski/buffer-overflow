require("dotenv").config();
const passport = require("passport");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const postRouter = require("./routes/api/post");
const userRouter = require("./routes/api/user");
const createAdminUser = require("./createAdminUser");

async function main() {
  /* Continue with application only if connection to db succeeds */
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected successfully to ${process.env.MONGO_URL}`);
    await createAdminUser("admin", process.env.ADMIN_PWD);
  } catch (err) {
    console.error(err);
    return;
  }
  const app = express();
  // Initialize the passport
  app.use(passport.initialize());
  /* Content-Type of req must match application/json or it won't be parsed */
  app.use(express.json({ type: "application/json" }));
  /* Content-Type of req must match application/x-www-form-urlencoded or it won't be parsed */
  app.use(
    express.urlencoded({
      extended: false,
      type: "application/x-www-form-urlencoded",
    })
  );
  /* Load user defined routers and start the server on port 1234 */
  app.use("/api/post", postRouter);
  app.use("/api/user", userRouter);
  if (process.env.NODE_ENV === "development") {
    // Allow requests from cross-origin react development server
    app.use(
      cors({
        origin: "http://localhost:3000",
        optionsSuccessStatus: 200,
      })
    );
  } else if (process.env.NODE_ENV === "production") {
    // Serve the built frontend from ../frontend/build
    app.use(express.static(path.join(__dirname, "../frontend/build")));
    // Always serve ../frontend/build/index.html (Single Page App)
    app.use("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
    });
  }
  app.listen(process.env.PORT);
}

main();
