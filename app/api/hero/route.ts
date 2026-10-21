
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hero from "@/lib/models/Hero";
import { requireAdmin } from "@/lib/auth";

// GET: Fetch all hero banners
export async function GET() {
  try {
    await connectDB();

    const heroes = await Hero.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: heroes.length,
      data: heroes,
    });
  } catch (error) {
    console.error("Fetch heroes error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}

// POST: Create a new hero banner
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      isActive,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof image !== "string" ||
      !image.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Title and image are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const hero = await Hero.create({
      title: title.trim(),
      subtitle,
      description,
      image: image.trim(),
      buttonText,
      buttonLink,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hero banner created successfully",
        data: hero,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    console.error("Create hero error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create hero banner" },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing hero banner
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, ...updates } = body;

    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid hero ID is required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "title",
      "subtitle",
      "description",
      "image",
      "buttonText",
      "buttonLink",
      "isActive",
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        updateData[field] = updates[field];
      }
    }

    if (
      ("title" in updateData &&
        (typeof updateData.title !== "string" ||
          !updateData.title.trim())) ||
      ("image" in updateData &&
        (typeof updateData.image !== "string" ||
          !updateData.image.trim()))
    ) {
      return NextResponse.json(
        { success: false, message: "Title and image cannot be empty" },
        { status: 400 }
      );
    }

    if (typeof updateData.title === "string") {
      updateData.title = updateData.title.trim();
    }

    if (typeof updateData.image === "string") {
      updateData.image = updateData.image.trim();
    }

    await connectDB();

    const hero = await Hero.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hero) {
      return NextResponse.json(
        { success: false, message: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hero banner updated successfully",
      data: hero,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    console.error("Update hero error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update hero banner" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a hero banner using its ID
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { success: false, message: "A valid hero ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const hero = await Hero.findByIdAndDelete(id);

    if (!hero) {
      return NextResponse.json(
        { success: false, message: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hero banner deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    console.error("Delete hero error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete hero banner" },
      { status: 500 }
    );
  }
}
