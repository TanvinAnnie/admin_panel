
import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Portfolio from "@/lib/models/Portfolio";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const portfolios = await Portfolio.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: portfolios,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch portfolios error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch portfolios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const author =
      typeof body.author === "string" ? body.author.trim() : "";

    const image =
      typeof body.image === "string" ? body.image.trim() : "";

    const imagePublicId =
      typeof body.imagePublicId === "string"
        ? body.imagePublicId.trim()
        : "";

    if (!title || !author || !image || !imagePublicId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, author, image, and image public ID are required",
        },
        { status: 400 }
      );
    }

    const order =
      body.order === undefined ? 0 : Number(body.order);

    if (!Number.isFinite(order)) {
      return NextResponse.json(
        { success: false, message: "Order must be a valid number" },
        { status: 400 }
      );
    }

    const isActive =
      body.isActive === undefined ? true : body.isActive;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.create({
      title,
      author,
      image,
      imagePublicId,
      order,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Portfolio created successfully",
        data: portfolio,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create portfolio error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create portfolio" },
      { status: 500 }
    );
  }
}
