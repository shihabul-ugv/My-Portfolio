import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ProjectOrderManager from "./ProjectOrderManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { slug: { not: "smartpark-ai-parking-management" } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Projects Manager</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Reorder and manage showcase projects
          </p>
        </div>
        <Link 
          href="/admin/projects/new"
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]"
        >
          <PlusCircle size={24} strokeWidth={3} />
          New Project
        </Link>
      </div>

      <ProjectOrderManager initialProjects={projects as any[]} />
    </div>
  );
}
