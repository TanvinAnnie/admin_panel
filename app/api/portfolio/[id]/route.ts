
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Portfolio from "@/lib/models/Portfolio";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authorizeAdmin() {
  const auth = await requireAdmin();

  if (auth instanceof NextResponse) {
    return auth;
  }

  return null;
}

// GET: Fetch one portfolio item
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const authResponse = await authorizeAdmin();

    if (authResponse) return authResponse;

    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid portfolio ID." },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.findById(id).lean();

    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load portfolio item." },
      { status: 500 }
    );
  }
}

// PATCH: Update a portfolio item
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const authResponse = await authorizeAdmin();

    if (authResponse) return authResponse;

    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid portfolio ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: {
      title?: string;
      author?: string;
      image?: string;
      imagePublicId?: string;
      order?: number;
      isActive?: boolean;
    } = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid title." },
          { status: 400 }
        );
      }

      updateData.title = body.title.trim();
    }

    if (body.author !== undefined) {
      if (
        typeof body.author !== "string" ||
        !body.author.trim() ||
        body.author.trim().length > 120
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid author." },
          { status: 400 }
        );
      }

      updateData.author = body.author.trim();
    }

    if (body.image !== undefined) {
      if (
        typeof body.image !== "string" ||
        !body.image.startsWith("https://")
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid image URL." },
          { status: 400 }
        );
      }

      updateData.image = body.image;
    }

    if (body.imagePublicId !== undefined) {
      if (
        typeof body.imagePublicId !== "string" ||
        !body.imagePublicId.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid image public ID." },
          { status: 400 }
        );
      }

      updateData.imagePublicId = body.imagePublicId.trim();
    }

    if (body.order !== undefined) {
      if (
        typeof body.order !== "number" ||
        !Number.isInteger(body.order) ||
        body.order < 0
      ) {
        return NextResponse.json(
          { success: false, message: "Display order must be a non-negative integer." },
          { status: 400 }
        );
      }

      updateData.order = body.order;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid active status." },
          { status: 400 }
        );
      }

      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update." },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio item updated successfully.",
      data: portfolio,
    });
  } catch (error) {
    console.error("Update portfolio error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update portfolio item." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a portfolio item
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const authResponse = await authorizeAdmin();

    if (authResponse) return authResponse;

    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid portfolio ID." },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.findByIdAndDelete(id);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete portfolio error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete portfolio item." },
      { status: 500 }
    );
  }
}
