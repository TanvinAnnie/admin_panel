
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/lib/models/Admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { success: false, message: "Admin setup is not configured." },
        { status: 503 }
      );
    }

    const providedSecret = request.headers.get("x-setup-secret");

    if (!providedSecret || providedSecret !== setupSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, email, password } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      cleanName.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      password.length < 12 ||
      password.length > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Provide a valid name and email, and a password of 12–72 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Only allow creation of the very first administrator.
    const existingAdmin = await Admin.findOne()
      .select("_id")
      .lean();

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Initial setup is already complete.",
        },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Admin.create({
      name: cleanName,
      email: cleanEmail,
      password: passwordHash,
      role: "admin",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Initial administrator created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to complete admin setup." },
      { status: 500 }
    );
  }
}
