require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const emConRoutes = require("./routes/emCon");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const medicalCardRoutes = require("./routes/digitalMedicalCardRoutes");
const reviewRoutes = require("./routes/reviews");

// express app
const app = express();

// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/hospitals", emConRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/medical-card", medicalCardRoutes);
app.use('/api/reviews', reviewRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
