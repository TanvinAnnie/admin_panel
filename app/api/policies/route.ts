
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Policy from "@/lib/models/Policy";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const activeOnly =
      new URL(request.url).searchParams.get("active") === "true";

    const policies = await Policy.find(
      activeOnly ? { isActive: true } : {}
    )
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error("GET /api/policies error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch policies." },
      { status: 500 }
    );
  }
}

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
    const order = body.order === undefined ? 0 : Number(body.order);
    const isActive =
      body.isActive === undefined ? true : body.isActive;

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200 || description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Title or description exceeds the allowed length.",
        },
        { status: 400 }
      );
    }

    if (icon.length > 100) {
      return NextResponse.json(
        { success: false, message: "Icon cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean." },
        { status: 400 }
      );
    }

    const policy = await Policy.create({
      title,
      description,
      icon,
      order,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Policy created successfully.",
        data: policy,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/policies error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create policy." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const id = typeof body._id === "string" ? body._id : "";

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "A valid policy ID is required." },
        { status: 400 }
      );
    }

    const policy = await Policy.findById(id);

    if (!policy) {
      return NextResponse.json(
        { success: false, message: "Policy not found." },
        { status: 404 }
      );
    }

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid policy title." },
          { status: 400 }
        );
      }

      policy.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim() ||
        body.description.trim().length > 2000
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide a valid policy description.",
          },
          { status: 400 }
        );
      }

      policy.description = body.description.trim();
    }

    if (body.icon !== undefined) {
      if (typeof body.icon !== "string" || body.icon.length > 100) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid icon." },
          { status: 400 }
        );
      }

      policy.icon = body.icon.trim();
    }

    if (body.order !== undefined) {
      const order = Number(body.order);

      if (!Number.isInteger(order) || order < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Order must be a non-negative integer.",
          },
          { status: 400 }
        );
      }

      policy.order = order;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be a boolean." },
          { status: 400 }
        );
      }

      policy.isActive = body.isActive;
    }

    await policy.save();

    return NextResponse.json({
      success: true,
      message: "Policy updated successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("PATCH /api/policies error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update policy." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.isValidObjectId(id ?? "")) {
      return NextResponse.json(
        { success: false, message: "A valid policy ID is required." },
        { status: 400 }
      );
    }

    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return NextResponse.json(
        { success: false, message: "Policy not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Policy deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/policies error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete policy." },
      { status: 500 }
    );
  }
}
