import { isAuthenticated } from "@/lib/check-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getInitialProjects } from "@/lib/initial-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(req: NextRequest) {
  let publishedOnly = false;
  try {
    const url = new URL(req.url);
    publishedOnly = url.searchParams.get("published") === "true";

    const whereClause = publishedOnly 
      ? { published: true, slug: { not: "smartpark-ai-parking-management" } } 
      : { slug: { not: "smartpark-ai-parking-management" } };

    let projects: any[] = await prisma.project.findMany({
      where: whereClause,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    });

    const initialProjects = getInitialProjects().filter(p => p.slug !== "smartpark-ai-parking-management");
    const existingSlugs = new Set(projects.map((p: any) => p.slug));
    const missing = initialProjects.filter(p => !existingSlugs.has(p.slug));

    if (missing.length > 0) {
      try {
        for (const pr of missing) {
          await prisma.project.upsert({
            where: { id: pr.id },
            update: {
              title: pr.title,
              slug: pr.slug,
              description: pr.description,
              thumbnail: pr.thumbnail,
              role: pr.role,
              timeline: pr.timeline,
              problem: pr.problem,
              solution: pr.solution,
              externalLink: pr.externalLink,
              caseStudy: pr.caseStudy,
              published: Boolean(pr.published),
              order: pr.order !== undefined ? Number(pr.order) : 0,
            },
            create: {
              id: pr.id,
              title: pr.title,
              slug: pr.slug,
              description: pr.description,
              thumbnail: pr.thumbnail,
              role: pr.role,
              timeline: pr.timeline,
              problem: pr.problem,
              solution: pr.solution,
              externalLink: pr.externalLink,
              caseStudy: pr.caseStudy,
              published: Boolean(pr.published),
              order: pr.order !== undefined ? Number(pr.order) : 0,
              createdAt: pr.createdAt ? new Date(pr.createdAt) : undefined,
            }
          });
        }
        projects = await prisma.project.findMany({
          where: whereClause,
          orderBy: [{ order: "asc" }, { createdAt: "desc" }]
        });
      } catch (syncErr) {
        console.error("Auto-sync missing projects error:", syncErr);
        const missingToAdd = publishedOnly ? missing.filter(p => p.published) : missing;
        projects = [...missingToAdd, ...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    if (projects.length === 0) {
      const fallback = publishedOnly ? initialProjects.filter(p => p.published) : initialProjects;
      return NextResponse.json(fallback.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), { headers: noCacheHeaders });
    }

    return NextResponse.json(projects, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Projects GET error:", error);
    const initialProjects = getInitialProjects().filter(p => p.slug !== "smartpark-ai-parking-management");
    const fallback = publishedOnly ? initialProjects.filter(p => p.published) : initialProjects;
    return NextResponse.json(fallback.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), { headers: noCacheHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated(req);
    
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noCacheHeaders });
    }

    const body = await req.json();
    const { 
      title, slug, description, thumbnail, 
      role, timeline, problem, solution, 
      externalLink, caseStudy, published,
      order
    } = body;

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        thumbnail: thumbnail || null,
        role: role || null,
        timeline: timeline || null,
        problem: problem || null,
        solution: solution || null,
        externalLink: externalLink || null,
        caseStudy: caseStudy || null,
        published: Boolean(published),
        order: order !== undefined ? Number(order) : 0,
      }
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath(`/projects/${slug}`);
      revalidatePath("/admin/projects");
    } catch {}

    return NextResponse.json(project, { status: 201, headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500, headers: noCacheHeaders });
  }
}
