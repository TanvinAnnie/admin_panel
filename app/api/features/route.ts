
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Feature from "@/lib/models/Feature";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Fetch features (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const filter = activeOnly ? { isActive: true } : {};

    const features = await Feature.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: features,
    });
  } catch (error) {
    console.error("GET /api/features error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST: Create feature (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const icon =
      typeof body.icon === "string" ? body.icon.trim() : "";

    const image =
      typeof body.image === "string" ? body.image.trim() : "";

    const order =
      body.order === undefined ? 0 : Number(body.order);

    const isActive =
      body.isActive === undefined ? true : body.isActive;

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
        },
        { status: 400 }
      );
    }

    if (title.length > 150 || description.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Title or description exceeds the allowed length",
        },
        { status: 400 }
      );
    }

    if (icon.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Icon cannot exceed 50 characters",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order must be a non-negative integer",
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be a boolean",
        },
        { status: 400 }
      );
    }

    const feature = await Feature.create({
      title,
      description,
      icon,
      image,
      order,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feature created successfully",
        data: feature,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/features error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create feature" },
      { status: 500 }
    );
  }
}

// PATCH: Update feature (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const id = typeof body._id === "string" ? body._id : "";

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid feature ID is required" },
        { status: 400 }
      );
    }

    const feature = await Feature.findById(id);

    if (!feature) {
      return NextResponse.json(
        { success: false, message: "Feature not found" },
        { status: 404 }
      );
    }

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Title is required" },
          { status: 400 }
        );
      }

      if (body.title.trim().length > 150) {
        return NextResponse.json(
          {
            success: false,
            message: "Title cannot exceed 150 characters",
          },
          { status: 400 }
        );
      }

      feature.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Description is required" },
          { status: 400 }
        );
      }

      if (body.description.trim().length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message: "Description cannot exceed 1000 characters",
          },
          { status: 400 }
        );
      }

      feature.description = body.description.trim();
    }

    if (body.icon !== undefined) {
      if (
        typeof body.icon !== "string" ||
        body.icon.trim().length > 50
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Icon must be text with at most 50 characters",
          },
          { status: 400 }
        );
      }

      feature.icon = body.icon.trim();
    }

    // Update image URL
    if (body.image !== undefined) {
      if (typeof body.image !== "string") {
        return NextResponse.json(
          { success: false, message: "Image must be a URL string" },
          { status: 400 }
        );
      }

      feature.image = body.image.trim();
    }

    if (body.order !== undefined) {
      const order = Number(body.order);

      if (!Number.isInteger(order) || order < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Order must be a non-negative integer",
          },
          { status: 400 }
        );
      }

      feature.order = order;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be a boolean" },
          { status: 400 }
        );
      }

      feature.isActive = body.isActive;
    }

    await feature.save();

    return NextResponse.json({
      success: true,
      message: "Feature updated successfully",
      data: feature,
    });
  } catch (error) {
    console.error("PATCH /api/features error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update feature" },
      { status: 500 }
    );
  }
}

// DELETE: Delete feature (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid feature ID is required" },
        { status: 400 }
      );
    }

    const feature = await Feature.findByIdAndDelete(id);

    if (!feature) {
      return NextResponse.json(
        { success: false, message: "Feature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/features error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete feature" },
      { status: 500 }
    );
  }
}
