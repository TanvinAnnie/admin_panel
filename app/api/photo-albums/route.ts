
import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import PhotoAlbum from "@/lib/models/PhotoAlbum";
import { requireAdmin } from "@/lib/auth";

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// GET /api/photo-albums
// Optional: /api/photo-albums?active=true
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const active = request.nextUrl.searchParams.get("active");
    const filter =
      active === "true"
        ? { isActive: true }
        : active === "false"
          ? { isActive: false }
          : {};

    const albums = await PhotoAlbum.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: albums });
  } catch (error) {
    console.error("GET photo albums error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch photo albums" },
      { status: 500 }
    );
  }
}

// POST /api/photo-albums
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const coverImage =
      typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const photos = Array.isArray(body.photos) ? body.photos : [];

    if (!title || !coverImage) {
      return NextResponse.json(
        { success: false, message: "Title and cover image are required" },
        { status: 400 }
      );
    }

    if (title.length > 150 || description.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Title or description is too long" },
        { status: 400 }
      );
    }

    if (!isValidImageUrl(coverImage)) {
      return NextResponse.json(
        { success: false, message: "Cover image must be a valid HTTP(S) URL" },
        { status: 400 }
      );
    }

    if (
      photos.length > 100 ||
      !photos.every(isValidImageUrl)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Photos must contain up to 100 valid HTTP(S) image URLs",
        },
        { status: 400 }
      );
    }

    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? createSlug(body.slug)
        : createSlug(title);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid album slug is required" },
        { status: 400 }
      );
    }

    const album = await PhotoAlbum.create({
      title,
      slug,
      description,
      coverImage,
      photos,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    });

    return NextResponse.json(
      { success: true, message: "Photo album created successfully", data: album },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { code?: number };

    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "An album with this slug already exists" },
        { status: 409 }
      );
    }

    console.error("POST photo album error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create photo album" },
      { status: 500 }
    );
  }
}

// PATCH /api/photo-albums
// Body: { id, title?, slug?, description?, coverImage?, photos?, isActive? }
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { id } = body;

    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid album ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 150) {
        return NextResponse.json(
          { success: false, message: "A valid title is required (maximum 150 characters)" },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();

      if (body.slug === undefined) {
        updates.slug = createSlug(body.title);
      }
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return NextResponse.json(
          { success: false, message: "A valid slug is required" },
          { status: 400 }
        );
      }
      updates.slug = createSlug(body.slug);
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.trim().length > 2000) {
        return NextResponse.json(
          { success: false, message: "Description cannot exceed 2000 characters" },
          { status: 400 }
        );
      }
      updates.description = body.description.trim();
    }

    if (body.coverImage !== undefined) {
      if (!isValidImageUrl(body.coverImage)) {
        return NextResponse.json(
          { success: false, message: "Cover image must be a valid HTTP(S) URL" },
          { status: 400 }
        );
      }
      updates.coverImage = body.coverImage.trim();
    }

    if (body.photos !== undefined) {
      if (
        !Array.isArray(body.photos) ||
        body.photos.length > 100 ||
        !body.photos.every(isValidImageUrl)
      ) {
        return NextResponse.json(
          { success: false, message: "Photos must contain up to 100 valid HTTP(S) image URLs" },
          { status: 400 }
        );
      }
      updates.photos = body.photos.map((photo: string) => photo.trim());
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be true or false" },
          { status: 400 }
        );
      }
      updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const album = await PhotoAlbum.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!album) {
      return NextResponse.json(
        { success: false, message: "Photo album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo album updated successfully",
      data: album,
    });
  } catch (error: unknown) {
    const err = error as { code?: number };

    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "An album with this slug already exists" },
        { status: 409 }
      );
    }

    console.error("PATCH photo album error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update photo album" },
      { status: 500 }
    );
  }
}

// DELETE /api/photo-albums?id=ALBUM_ID
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const id = request.nextUrl.searchParams.get("id");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid album ID is required" },
        { status: 400 }
      );
    }

    const album = await PhotoAlbum.findByIdAndDelete(id);

    if (!album) {
      return NextResponse.json(
        { success: false, message: "Photo album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo album deleted successfully",
    });
  } catch (error) {
    console.error("DELETE photo album error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete photo album" },
      { status: 500 }
    );
  }
}
