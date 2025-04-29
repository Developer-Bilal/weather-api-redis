import express from "express";
import { createClient } from "redis";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();
const port = process.env.PORT || 8080;

// redis connection setup
const client = createClient({
  username: "default",
  password: process.env.Redis_Password,
  socket: {
    host: process.env.Redis_Host,
    port: process.env.Redis_Port,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

// middlewares
app.use(express.json());

// routes
app.get("/api/v1/:location", getWeatherData);

// route controllers
async function getWeatherData(req, res) {
  let myData = "";
  // get data: cache data from redis
  const CachedData = await client.get(myData);
  if (CachedData) {
    res
      .status(200)
      .json({ status: "Success!", cache: true, data: JSON.parse(CachedData) });
  } else {
    try {
      const { location } = req.params;

      const resp = await fetch(
        `${process.env.BASE_URL}/${location}?unitGroup=metric&key=${process.env.API_KEY}&contentType=json`
      );
      const data = await resp.json();
      // save data: cache data in redis
      await client.set(myData, JSON.stringify(data), { EX: 60 });

      res.status(200).json({ status: "Success!", cache: false, data });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
