
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UPLOAD_FOLDERS = {
  hero: "maheen-accessories/hero",
  services: "maheen-accessories/services",
  "photo-albums": "maheen-accessories/photo-albums",
  about: "maheen-accessories/about",
  features: "maheen-accessories/features",

} as const;

type UploadContext = keyof typeof UPLOAD_FOLDERS;

function isUploadContext(value: string): value is UploadContext {
  return Object.prototype.hasOwnProperty.call(UPLOAD_FOLDERS, value);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedContext = formData.get("context");

    const context =
      typeof requestedContext === "string" && requestedContext
        ? requestedContext
        : "hero";

    if (!isUploadContext(context)) {
      return NextResponse.json(
        { success: false, message: "Invalid upload context." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image file." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image size must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        { success: false, message: "Image upload is not configured." },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: UPLOAD_FOLDERS[context],
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to upload image." },
      { status: 500 }
    );
  }
}
