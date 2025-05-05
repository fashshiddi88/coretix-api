import multer from "multer";
import { storage } from "../lib/cloudinary.config";

export const upload = multer({ storage });
