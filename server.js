import express from "express";

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(express.json());

// routes
app.get("/api/v1", getWeatherData);

// route controllers
async function getWeatherData(req, res) {
  console.log("getWeatherData");
  res.status(200).json({ message: "getWeatherData" });
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
