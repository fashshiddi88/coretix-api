import multer from "multer";
import {
  storage,
  eventStorage,
  profileStorage,
} from "../lib/cloudinary.config";

export const upload = multer({ storage });
export const uploadEventImage = multer({ storage: eventStorage });
export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB dalam byte
  },
});
