import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Test from "@/lib/models/Test";

export async function GET() {
  try {
    await connectDB();

    const test = await Test.create({
      name: "Maheen Accessories Database Test",
    });

    return NextResponse.json(
      {
        success: true,
        message: "MongoDB connected successfully.",
        data: test,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Database Test Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed.",
      },
      {
        status: 500,
      }
    );
  }
}