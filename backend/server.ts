import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { PinataSDK } from "pinata";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const pinataJwt = process.env.PINATA_JWT;

if (!pinataJwt) {
  throw new Error("PINATA_JWT is missing from .env");
}

const pinata = new PinataSDK({
  pinataJwt,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ProofFund backend",
  });
});

app.post(
  "/api/ipfs/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded.",
        });
      }

      const blob = new Blob(
        [new Uint8Array(req.file.buffer)],
        {
          type:
            req.file.mimetype ||
            "application/octet-stream",
        }
      );

      const file = new File(
        [blob],
        req.file.originalname,
        {
          type:
            req.file.mimetype ||
            "application/octet-stream",
        }
      );

      const result = await pinata.upload.public
        .file(file)
        .name(req.file.originalname);

      return res.json({
        success: true,
        cid: result.cid,
        name: req.file.originalname,
      });
    } catch (error) {
      console.error("Pinata upload failed:", error);

      return res.status(500).json({
        error: "Failed to upload file to IPFS.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `ProofFund backend running at http://localhost:${PORT}`
  );
});
