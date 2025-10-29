import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: [ "http://localhost:5173","https://carbonchain.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());
app.use('/api',router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});