import multer from "multer";
import { storage } from "../lib/cloudinary.config";
import { eventStorage } from "../lib/cloudinary.config";

export const upload = multer({ storage });
export const uploadEventImage = multer({ storage: eventStorage });
