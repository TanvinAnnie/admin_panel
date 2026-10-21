
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
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
        {
          success: false,
          message: "Image size must be between 1 byte and 5 MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "maheen-accessories/hero",
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult) {
            reject(new Error("Cloudinary returned no upload result."));
            return;
          }

          resolve({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    console.error("Image upload error:", error);

    return NextResponse.json(
      { success: false, message: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
