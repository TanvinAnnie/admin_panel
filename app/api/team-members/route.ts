import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import TeamMember from "@/lib/models/TeamMember";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Fetch team members
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const activeOnly =
      request.nextUrl.searchParams.get("active") === "true";

    const filter = activeOnly ? { isActive: true } : {};

    const members = await TeamMember.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("GET team members error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch team members." },
      { status: 500 }
    );
  }
}

// POST: Add a team member
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const position =
      typeof body.position === "string" ? body.position.trim() : "";
    const image =
      typeof body.image === "string" ? body.image.trim() : "";

    if (!name || !position || !image) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, position, and profile image are required.",
        },
        { status: 400 }
      );
    }

    const order = Number(body.order ?? 0);

    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Display order must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    const member = await TeamMember.create({
      name,
      position,
      image,
      imagePublicId:
        typeof body.imagePublicId === "string"
          ? body.imagePublicId.trim()
          : "",
      facebook:
        typeof body.facebook === "string" ? body.facebook.trim() : "",
      instagram:
        typeof body.instagram === "string" ? body.instagram.trim() : "",
      linkedin:
        typeof body.linkedin === "string" ? body.linkedin.trim() : "",
      order,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member added successfully.",
        data: member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST team member error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to add team member." },
      { status: 500 }
    );
  }
}

// PATCH: Edit a team member
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const body = await request.json();
    const { _id } = body;

    if (
      typeof _id !== "string" ||
      !mongoose.Types.ObjectId.isValid(_id)
    ) {
      return NextResponse.json(
        { success: false, message: "A valid member ID is required." },
        { status: 400 }
      );
    }

    const allowedFields = [
      "name",
      "position",
      "image",
      "imagePublicId",
      "facebook",
      "instagram",
      "linkedin",
      "order",
      "isActive",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if ("name" in updates) {
      if (
        typeof updates.name !== "string" ||
        !updates.name.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Name cannot be empty." },
          { status: 400 }
        );
      }

      updates.name = updates.name.trim();
    }

    if ("position" in updates) {
      if (
        typeof updates.position !== "string" ||
        !updates.position.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Position cannot be empty." },
          { status: 400 }
        );
      }

      updates.position = updates.position.trim();
    }

    if ("image" in updates) {
      if (
        typeof updates.image !== "string" ||
        !updates.image.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Profile image cannot be empty." },
          { status: 400 }
        );
      }

      updates.image = updates.image.trim();
    }

    for (const field of [
      "imagePublicId",
      "facebook",
      "instagram",
      "linkedin",
    ] as const) {
      if (field in updates) {
        if (typeof updates[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a string.`,
            },
            { status: 400 }
          );
        }

        updates[field] = (updates[field] as string).trim();
      }
    }

    if ("order" in updates) {
      const order = Number(updates.order);

      if (!Number.isInteger(order) || order < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Display order must be a non-negative integer.",
          },
          { status: 400 }
        );
      }

      updates.order = order;
    }

    if (
      "isActive" in updates &&
      typeof updates.isActive !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid active status." },
        { status: 400 }
      );
    }

    const member = await TeamMember.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully.",
      data: member,
    });
  } catch (error) {
    console.error("PATCH team member error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update team member." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a team member
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "A valid member ID is required." },
        { status: 400 }
      );
    }

    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE team member error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete team member." },
      { status: 500 }
    );
  }
}