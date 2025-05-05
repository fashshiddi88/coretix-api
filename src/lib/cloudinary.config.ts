import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "payment_proofs",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    public_id: `proof-${Date.now()}`,
  }),
});

export { cloudinary };
