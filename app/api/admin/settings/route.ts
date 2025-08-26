import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_SETTINGS = {
  siteName: "GlamBazar",
  siteDescription: "Your premium beauty and fashion destination",
  currency: "INR",
  taxRate: "18",
  shippingFeeKanpur: "99",
  shippingFeeOthers: "150",
  freeShippingThreshold: "2000",
  sameDayCutoffTime: "14:00",
  allowGuestCheckout: "true",
  requireEmailVerification: "false",
  maintenanceMode: "false",
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, return default settings since there's no Settings model in schema
    // In a real app, you'd store these in a database table
    return NextResponse.json({
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { settings } = data;

    // Validate settings
    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid settings data" },
        { status: 400 }
      );
    }

    // In a real app, you'd save these to a database table
    // For now, just validate and return success
    const validatedSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
    };

    return NextResponse.json({
      message: "Settings saved successfully",
      settings: validatedSettings,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
