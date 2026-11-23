import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/check-auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated(req);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noCacheHeaders });
    }

    const body = await req.json();
    const items = body.items;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items format. Expected array of { id, order }" }, { status: 400, headers: noCacheHeaders });
    }

    // Update orders in transaction
    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.project.update({
          where: { id: item.id },
          data: { order: Number(item.order) },
        })
      )
    );

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath("/admin/projects");
    } catch (e) {
      console.warn("Revalidation error after reordering:", e);
    }

    return NextResponse.json({ success: true, message: "Projects reordered successfully" }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Reorder projects error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: noCacheHeaders });
  }
}
