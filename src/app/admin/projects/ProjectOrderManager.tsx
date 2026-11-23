"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Edit, Check, AlertCircle, Sparkles, Home, Layers } from "lucide-react";
import { DeleteProjectButton } from "../components/DeleteProjectButton";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  order: number;
  createdAt: string | Date;
}

export default function ProjectOrderManager({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const saveOrder = async (updatedProjects: ProjectItem[]) => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const items = updatedProjects.map((p, idx) => ({
        id: p.id,
        order: idx,
      }));

      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        throw new Error("Failed to save project order");
      }

      setSaveStatus("saved");
      setStatusMessage("Order saved successfully!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus("error");
      setStatusMessage(err.message || "Could not save order");
    } finally {
      setIsSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...projects];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    // update order numbers
    updated.forEach((p, idx) => (p.order = idx));
    setProjects(updated);
    saveOrder(updated);
  };

  const moveDown = (index: number) => {
    if (index === projects.length - 1) return;
    const updated = [...projects];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    // update order numbers
    updated.forEach((p, idx) => (p.order = idx));
    setProjects(updated);
    saveOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* Save status notification bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-100 border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-300 border-2 border-zinc-900 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={16} /> Reorder Guide
          </div>
          <p className="text-sm font-bold text-zinc-700">
            Use the <strong className="text-black">Up / Down arrows</strong> to position projects.
            <span className="hidden md:inline"> Top 3 appear on Homepage; all appear on Projects catalog.</span>
          </p>
        </div>
        {saveStatus === "saved" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-300 border-2 border-zinc-900 text-xs font-black uppercase tracking-wider text-green-950 animate-pulse">
            <Check size={14} strokeWidth={3} /> {statusMessage}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-300 border-2 border-zinc-900 text-xs font-black uppercase tracking-wider text-red-950">
            <AlertCircle size={14} strokeWidth={3} /> {statusMessage}
          </span>
        )}
        {isSaving && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-300 border-2 border-zinc-900 text-xs font-black uppercase tracking-wider text-blue-950">
            Saving new order...
          </span>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white border-4 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(24,24,27,1)] overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-zinc-100 border-b-4 border-zinc-900">
            <tr>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-xs w-28">Order</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-xs">Project</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-xs w-44">Placement</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-xs w-28">Status</th>
              <th className="px-6 py-5 font-black uppercase tracking-widest text-xs text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-zinc-900">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-zinc-500 font-bold uppercase tracking-widest text-xl">
                  No projects found. Create your first project to get started!
                </td>
              </tr>
            ) : (
              projects.map((project, index) => {
                const isHomepage = index < 3;
                return (
                  <tr key={project.id} className="hover:bg-zinc-50 transition group">
                    {/* Order Controls */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center font-mono font-black text-sm border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveUp(index)}
                            disabled={index === 0 || isSaving}
                            title="Move Up"
                            className="p-1 border-2 border-zinc-900 bg-white hover:bg-yellow-300 disabled:opacity-30 disabled:pointer-events-none transition shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                          >
                            <ArrowUp size={14} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(index)}
                            disabled={index === projects.length - 1 || isSaving}
                            title="Move Down"
                            className="p-1 border-2 border-zinc-900 bg-white hover:bg-yellow-300 disabled:opacity-30 disabled:pointer-events-none transition shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                          >
                            <ArrowDown size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Project Title */}
                    <td className="px-6 py-5">
                      <div className="font-black text-lg uppercase text-zinc-900 group-hover:text-blue-600 transition">
                        {project.title}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">
                        /{project.slug}
                      </div>
                    </td>

                    {/* Placement Badge */}
                    <td className="px-6 py-5">
                      {isHomepage ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-zinc-900 bg-blue-100 text-blue-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                          <Home size={12} strokeWidth={3} /> Homepage #{index + 1}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-zinc-300 bg-zinc-50 text-zinc-600">
                          <Layers size={12} /> All Projects
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] ${project.published ? 'bg-green-300 text-zinc-900' : 'bg-yellow-200 text-zinc-800'}`}>
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="p-2 border-2 border-zinc-900 bg-white hover:bg-blue-300 transition shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] text-zinc-900"
                          title="Edit Project"
                        >
                          <Edit size={16} strokeWidth={2.5} />
                        </Link>
                        <DeleteProjectButton id={project.id} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
