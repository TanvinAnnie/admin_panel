
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Service from "@/lib/models/Service";

export const runtime = "nodejs";

function createSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

// GET: Public services list.
// Add ?active=true to return only active services.
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const filter = activeOnly ? { isActive: true } : {};

    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("GET /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch services.",
      },
      { status: 500 }
    );
  }
}

// POST: Create a service. Admin only.
export async function POST(request: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string" ? body.image.trim() : "";

    const requestedSlug =
      typeof body.slug === "string" ? body.slug.trim() : "";

    const slug = createSlug(requestedSlug || title);

    if (!title || !description || !image || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description, image, and a valid slug are required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 150 || slug.length > 180 || description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      slug,
      description,
      image,
      isActive:
        typeof body.isActive === "boolean" ? body.isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully.",
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as admin." },
        { status: 401 }
      );
    }

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "This service slug already exists." },
        { status: 409 }
      );
    }

    console.error("POST /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// PATCH: Update a service. Admin only.
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid service ID is required." },
        { status: 400 }
      );
    }

    const existingService = await Service.findById(id);

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 }
      );
    }

    const updates: {
      title?: string;
      slug?: string;
      description?: string;
      image?: string;
      isActive?: boolean;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, message: "A valid title is required." },
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
          { success: false, message: "A valid slug is required." },
          { status: 400 }
        );
      }

      updates.slug = createSlug(body.slug);
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return NextResponse.json(
          { success: false, message: "A valid description is required." },
          { status: 400 }
        );
      }

      updates.description = body.description.trim();
    }

    if (body.image !== undefined) {
      if (typeof body.image !== "string" || !body.image.trim()) {
        return NextResponse.json(
          { success: false, message: "A valid image URL is required." },
          { status: 400 }
        );
      }

      updates.image = body.image.trim();
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be a boolean." },
          { status: 400 }
        );
      }

      updates.isActive = body.isActive;
    }

    if (
      (updates.title?.length ?? 0) > 150 ||
      (updates.slug?.length ?? 0) > 180 ||
      (updates.description?.length ?? 0) > 2000
    ) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    Object.assign(existingService, updates);
    await existingService.save();

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
      data: existingService,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as admin." },
        { status: 401 }
      );
    }

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "This service slug already exists." },
        { status: 409 }
      );
    }

    console.error("PATCH /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service. Admin only.
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid service ID is required." },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as admin." },
        { status: 401 }
      );
    }

    console.error("DELETE /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete service.",
      },
      { status: 500 }
    );
  }
}
