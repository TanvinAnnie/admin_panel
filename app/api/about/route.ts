
import { NextRequest, NextResponse } from "next/server";
import {connectDB}from "@/lib/db";
import About from "@/lib/models/About";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Fetch About Us content (public)
export async function GET() {
  try {
    await connectDB();

    const about = await About.findOne({ isActive: true }).lean();

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error("GET /api/about error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch About Us content" },
      { status: 500 }
    );
  }
}

// POST: Create About Us content (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const body = await request.json();

    const existingAbout = await About.findOne();

    if (existingAbout) {
      return NextResponse.json(
        {
          success: false,
          message: "About Us content already exists. Please update it instead.",
        },
        { status: 409 }
      );
    }

    const about = await About.create({
      title: body.title,
      subtitle: body.subtitle ?? "",
      story: body.story,
      image: body.image ?? "",
      mission: body.mission ?? "",
      vision: body.vision ?? "",
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "About Us content created successfully",
        data: about,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/about error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create About Us content" },
      { status: 500 }
    );
  }
}

// PATCH: Update About Us content (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const body = await request.json();

    const existingAbout = await About.findOne();

    if (!existingAbout) {
      return NextResponse.json(
        {
          success: false,
          message: "About Us content not found. Create it first.",
        },
        { status: 404 }
      );
    }

    const allowedFields = [
      "title",
      "subtitle",
      "story",
      "image",
      "mission",
      "vision",
      "isActive",
    ] as const;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        existingAbout.set(field, body[field]);
      }
    }

    await existingAbout.save();

    return NextResponse.json({
      success: true,
      message: "About Us content updated successfully",
      data: existingAbout,
    });
  } catch (error) {
    console.error("PATCH /api/about error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update About Us content" },
      { status: 500 }
    );
  }
}
