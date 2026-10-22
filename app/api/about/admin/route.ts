import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import About from "@/lib/models/About";
import { requireAdmin } from "@/lib/auth";

// GET: Fetch About Us content for admin, including inactive content
export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth instanceof NextResponse) {
      return auth;
    }

    await connectDB();

    const about = await About.findOne().lean();

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error("GET /api/about/admin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch About Us content.",
      },
      { status: 500 }
    );
  }
}

// Reuse the existing admin-protected handlers
export { POST, PATCH } from "../route";