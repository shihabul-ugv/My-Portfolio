import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowLeft, ArrowRight, Target, Lightbulb, FileText, Smartphone, Sparkles } from "lucide-react";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getInitialProjects } from "@/lib/initial-data";

function renderMarkdownText(text: string): React.ReactNode {
  // Parse markdown links [text](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index).replace(/\*\*/g, ''));
    }
    const [_, linkText, url] = match;
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1 transition"
      >
        <span>{linkText.replace(/\*\*/g, '')}</span>
        <ExternalLink size={13} className="inline shrink-0" />
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex).replace(/\*\*/g, ''));
  }

  return parts.length > 0 ? parts : text.replace(/\*\*/g, '');
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let project: any = null;
  try {
    project = await prisma.project.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error("Prisma error in project slug page:", err);
  }

  if (!project) {
    const fallbackProjects = getInitialProjects();
    project = fallbackProjects.find((p) => p.slug === slug) || null;
  }

  if (!project) {
    notFound();
  }

  // Fetch adjacent project for "Next Project" link
  let nextProject: any = null;
  try {
    nextProject = await prisma.project.findFirst({
      where: { 
        published: true,
        NOT: { id: project.id }
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch {}

  if (!nextProject) {
    const fallbackProjects = getInitialProjects();
    nextProject = fallbackProjects.find((p) => p.published && p.id !== project.id) || null;
  }

  const isDealr = project.slug === "dealr-deals-app";

  return (
    <main className="flex-1 px-6 pt-36 pb-32 max-w-[90rem] mx-auto w-full">
      
      {/* Return link */}
      <div className="mb-12">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase tracking-widest text-sm transition"
        >
          <ArrowLeft strokeWidth={3} size={18} /> Back to all projects
        </Link>
      </div>
      
      {/* Case Study Header */}
      <header className="mb-16">
        <h1 className="text-[10vw] md:text-[6vw] leading-[0.92] font-black mb-8 tracking-tighter text-zinc-900 uppercase">
          {project.title}
        </h1>
        <p className="text-2xl md:text-4xl text-zinc-700 max-w-4xl leading-tight font-medium mb-16">
          {project.description}
        </p>

        {/* Project Meta Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y-4 border-zinc-900 py-8 items-center">
          {project.role && (
            <div>
              <h3 className="text-xs font-black text-zinc-400 mb-1.5 uppercase tracking-widest">Role & Scope</h3>
              <p className="text-zinc-900 font-black text-lg uppercase tracking-wider">{project.role}</p>
            </div>
          )}
          {project.timeline && (
            <div>
              <h3 className="text-xs font-black text-zinc-400 mb-1.5 uppercase tracking-widest">Timeline</h3>
              <p className="text-zinc-900 font-black text-lg uppercase tracking-wider">{project.timeline}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-black text-zinc-400 mb-1.5 uppercase tracking-widest">Platform</h3>
            <p className="text-zinc-900 font-black text-lg uppercase tracking-wider">
              {isDealr ? "iOS • Android • Web" : "Web & Mobile"}
            </p>
          </div>
          {isDealr ? (
            <div className="col-span-2 md:col-span-1 flex flex-wrap md:justify-end gap-2">
              <a 
                href="https://play.google.com/store/apps/details?id=de.dealrapp.app&hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] border-2 border-zinc-900"
              >
                <Smartphone size={13} strokeWidth={2.5} />
                <span>Play Store</span>
                <ExternalLink size={12} strokeWidth={2.5} />
              </a>
              <a 
                href="https://apps.apple.com/us/app/dealr-app/id6761794996" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] border-2 border-zinc-900"
              >
                <Smartphone size={13} strokeWidth={2.5} />
                <span>App Store</span>
                <ExternalLink size={12} strokeWidth={2.5} />
              </a>
            </div>
          ) : project.externalLink ? (
            <div className="col-span-2 md:col-span-1 md:text-right">
              <a 
                href={project.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] border-2 border-zinc-900"
              >
                <span>Launch Live</span>
                <ExternalLink size={16} strokeWidth={3} />
              </a>
            </div>
          ) : (
            <div className="col-span-2 md:col-span-1 md:text-right">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                Internal / NDA
              </span>
            </div>
          )}
        </div>

        {/* Dedicated Live App Store Release Banner for DEALR */}
        {isDealr && (
          <div className="mt-8 p-6 md:p-8 bg-zinc-900 text-white border-4 border-zinc-900 shadow-[10px_10px_0px_0px_rgba(59,130,246,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-widest inline-block mb-3 border-2 border-zinc-900">
                Official Live Release
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                Download DEALR on App Store & Google Play
              </h2>
              <p className="text-zinc-400 font-medium text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                Explore exclusive 2-for-1 dining, café, nightlife, and leisure vouchers directly on your smartphone.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=de.dealrapp.app&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-emerald-500 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-white"
              >
                <Smartphone size={16} strokeWidth={3} />
                <span>Google Play</span>
                <ExternalLink size={14} strokeWidth={3} />
              </a>
              <a
                href="https://apps.apple.com/us/app/dealr-app/id6761794996"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-white"
              >
                <Smartphone size={16} strokeWidth={3} />
                <span>App Store</span>
                <ExternalLink size={14} strokeWidth={3} />
              </a>
              <a
                href="https://www.behance.net/gallery/258846395/DEALR-Deals-App-UIUX-Case-Study"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-widest border-2 border-zinc-700 transition"
              >
                <span>Behance</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Feature Thumbnail */}
      {project.thumbnail && (
        <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden mb-28 border-4 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(24,24,27,1)]">
          <Image 
            src={project.thumbnail} 
            alt={project.title} 
            fill 
            className="object-cover" 
            priority
          />
        </div>
      )}

      {/* Structured Case Study Sections */}
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* The Problem Panel */}
        {project.problem && (
          <div className="p-8 md:p-14 bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)]">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-zinc-200 pb-4">
              <div className="p-2.5 bg-rose-100 border-2 border-zinc-900 text-rose-600">
                <Target size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
                The Problem
              </h2>
            </div>
            <p className="text-lg md:text-xl text-zinc-700 leading-relaxed font-medium">
              {project.problem}
            </p>
          </div>
        )}

        {/* The Solution Panel */}
        {project.solution && (
          <div className="p-8 md:p-14 bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)]">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-zinc-200 pb-4">
              <div className="p-2.5 bg-emerald-100 border-2 border-zinc-900 text-emerald-600">
                <Lightbulb size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
                The Solution
              </h2>
            </div>
            <p className="text-lg md:text-xl text-zinc-700 leading-relaxed font-medium">
              {project.solution}
            </p>
          </div>
        )}

        {/* In-Depth Case Study Narrative */}
        {project.caseStudy && (
          <div className="p-8 md:p-14 bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)]">
            <div className="flex items-center justify-between mb-8 border-b-4 border-zinc-900 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 border-2 border-zinc-900 text-blue-600">
                  <FileText size={24} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
                  Design Narrative &amp; Prototype
                </h3>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-mono font-medium uppercase tracking-wider border border-zinc-300">
                Full UX Documentation
              </span>
            </div>

            <div className="space-y-6 font-sans text-base md:text-lg text-zinc-700 leading-relaxed font-normal">
              {project.caseStudy.split('\n\n').map((paragraph: string, pIdx: number) => {
                const trimmed = paragraph.trim();
                
                // Divider
                if (trimmed === '---') {
                  return <hr key={pIdx} className="border-t border-zinc-200 my-8" />;
                }

                // Markdown Image support
                const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (imgMatch) {
                  return (
                    <div key={pIdx} className="my-10 relative w-full aspect-[16/9] border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] overflow-hidden bg-white">
                      <Image
                        src={imgMatch[2]}
                        alt={imgMatch[1]}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 1200px"
                      />
                    </div>
                  );
                }

                // H3 Header
                if (trimmed.startsWith('### ')) {
                  return (
                    <div key={pIdx} className="pt-6 pb-2 border-b border-zinc-200">
                      <h4 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-zinc-900 flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-blue-600 inline-block shrink-0"></span>
                        <span>{trimmed.replace('### ', '')}</span>
                      </h4>
                    </div>
                  );
                }

                // H4 Header
                if (trimmed.startsWith('#### ')) {
                  return (
                    <div key={pIdx} className="pt-4">
                      <h5 className="text-lg md:text-xl font-semibold text-zinc-900">
                        {trimmed.replace('#### ', '')}
                      </h5>
                    </div>
                  );
                }

                // Bullet List
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  const items = trimmed.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
                  return (
                    <ul key={pIdx} className="space-y-2 pl-2">
                      {items.map((item, itemIdx) => {
                        const rawItem = item.replace(/^[-*]\s+/, '');
                        return (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2.5 shrink-0"></span>
                            <span className="leading-relaxed text-zinc-600 font-normal">
                              {renderMarkdownText(rawItem)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // Numbered Steps List
                if (/^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
                  return (
                    <ol key={pIdx} className="space-y-3 pl-1">
                      {items.map((item, itemIdx) => {
                        const match = item.match(/^(\d+)\.\s*(.*)$/);
                        const num = match ? match[1] : itemIdx + 1;
                        const rawText = match ? match[2] : item;
                        return (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-medium text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                              {num}
                            </span>
                            <span className="leading-relaxed text-zinc-600 font-normal">
                              {renderMarkdownText(rawText)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  );
                }

                // Regular Paragraph
                return (
                  <p key={pIdx} className="leading-relaxed text-zinc-600 font-normal">
                    {renderMarkdownText(trimmed)}
                  </p>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      {nextProject && (
        <div className="mt-32 pt-16 border-t-4 border-zinc-900 flex justify-between items-center max-w-5xl mx-auto">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-2">Next Project</span>
            <Link 
              href={`/projects/${nextProject.slug}`} 
              className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 hover:text-blue-600 transition flex items-center gap-4 group"
            >
              <span>{nextProject.title}</span>
              <ArrowRight size={36} strokeWidth={3} className="transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      )}

    </main>
  );
}
