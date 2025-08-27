import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2 = "",
      city,
      state,
      postalCode,
      country = "India",
      isDefault = false,
    } = await req.json();

    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If setting default, unset existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id as string, isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await prisma.address.create({
      data: {
        userId: session.user.id as string,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("profile address new error", e);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
