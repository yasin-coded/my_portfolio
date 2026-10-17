import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  ExternalLink,
  Search,
  Terminal,
  Sparkles,
  Calendar,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import api from "../../api/axios";
import { useProjects } from "../../hooks/useResourceQueries";
import Pagination from "../ui/Pagination";
import { Card, CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import { formatMonthYear } from "../../utils/formatDate";
import ErrorBoundary from "../ui/ErrorBoundary";

const CATEGORIES = [
  { id: "ALL", label: "All Projects" },
  { id: "WEB", label: "Web Apps" },
  { id: "API", label: "APIs & Backend" },
  { id: "MOBILE", label: "Mobile" },
  { id: "ML", label: "Machine Learning" },
  { id: "OTHER", label: "Tools & CLI" },
];

const PAGE_SIZE = 9;

export function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionRef = useRef(null);

  // ── Read state from URL ─────────────────────────────────────────
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'ALL';

  // ── Helpers to update URL ───────────────────────────────────────
  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'ALL' && value !== '') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete('page');
      return next;
    });
  }

  function goToPage(page) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }
      return next;
    });
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Build API params ────────────────────────────────────────────
  const apiParams = {
    page: currentPage,
    page_size: PAGE_SIZE,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}),
  };

  const { data, isLoading, isError, error, refetch } = useProjects(apiParams);
  const projects = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  // ── Unfiltered total and category counts ──────────────────────────
  const { data: allProjectsData } = useQuery({
    queryKey: ['projects-all-unfiltered'],
    queryFn: async () => {
      const res = await api.get('/projects/', { params: { page: 1, page_size: 50 } });
      return res.data && Array.isArray(res.data.results)
        ? res.data
        : { count: 0, next: null, previous: null, results: [] };
    },
    staleTime: 1000 * 60 * 5,
  });

  const totalProjects = allProjectsData?.count ?? totalCount;

  const categoryCounts = (allProjectsData?.results || []).reduce((acc, p) => {
    if (p.category) {
      acc[p.category] = (acc[p.category] || 0) + 1;
    }
    return acc;
  }, {});

  // ── Guard: if page is beyond last, fall back to page 1 ─────────
  useEffect(() => {
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    if (totalCount > 0 && currentPage > totalPages) {
      goToPage(1);
    }
  }, [totalCount, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const errorMessage =
    error?.response?.status === 429
      ? "Too many requests, please wait a moment and retry."
      : "Failed to load projects. Please try again.";

  return (
    <ErrorBoundary>
      <section
        id="projects"
        ref={sectionRef}
        className="scroll-mt-20 py-20 border-t border-border/40"
      >
        <div className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-widest">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>// 03. featured_work</span>
              </div>
              <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
                $ ls -la /projects/
              </h2>
              <p className="text-text-muted text-sm font-mono">
                // Production web apps, open-source libraries, and backend
                systems.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setParam('search', e.target.value)}
                placeholder="grep project_name..."
                className="w-full bg-surface-2/60 border border-border/80 rounded-md pl-9 pr-4 py-2 font-mono text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map(({ id, label }) => {
              const isActive = selectedCategory === id;
              const count = id === 'ALL' ? totalProjects : categoryCounts[id] ?? 0;
              const chipLabel = allProjectsData || id === 'ALL'
                ? `${label} (${count})`
                : label;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setParam('category', id)}
                  className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                    isActive
                      ? "bg-accent text-on-accent border-accent font-semibold shadow-sm"
                      : "bg-surface-2/50 border-border/80 text-text-muted hover:text-text hover:border-accent/40"
                  }`}
                >
                  {chipLabel}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="overflow-hidden border-border/70">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted flex flex-col items-center gap-3 relative z-10">
              <Terminal className="w-8 h-8 text-accent/40" />
              <p>{errorMessage}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted flex flex-col items-center gap-3 relative z-10">
              <Terminal className="w-8 h-8 text-accent/40" />
              <p>
                bash: No matching projects found in{" "}
                <span className="text-accent">/projects/</span>
              </p>
              {(searchQuery || selectedCategory !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchParams({})}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  hoverable
                  className="flex flex-col justify-between border-border/80 bg-surface/90 group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-surface-2 border-b border-border/60">
                    {project.cover_image ? (
                      <img
                        src={project.cover_image}
                        alt={`${project.title} screenshot`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-between p-4 font-mono text-xs bg-gradient-to-br from-surface to-surface-2">
                        <div className="flex items-center gap-1.5 opacity-60">
                          <span className="w-2 h-2 rounded-full bg-danger" />
                          <span className="w-2 h-2 rounded-full bg-warning" />
                          <span className="w-2 h-2 rounded-full bg-success" />
                        </div>
                        <div className="text-center font-bold text-accent tracking-wider">
                          {project.title}
                        </div>
                        <span className="text-text-muted/60 text-[10px] text-right">
                          // no_preview
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {project.is_featured && (
                        <Badge variant="accent" size="sm" className="shadow-md">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge
                        variant="default"
                        size="sm"
                        className="bg-bg/80 backdrop-blur-sm shadow-md"
                      >
                        {project.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-mono text-base font-bold text-text group-hover:text-accent transition-colors">
                          <Link to={`/projects/${project.slug}`}>
                            {project.title}
                          </Link>
                        </h3>
                        {project.completed_date && (
                          <span className="font-mono text-[10px] text-text-muted shrink-0 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatMonthYear(project.completed_date)}
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-sm text-text-muted line-clamp-2 leading-relaxed">
                        {project.summary || project.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-3 border-t border-border/50">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack_details?.slice(0, 4).map((tech) => (
                          <span
                            key={tech.id}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-2/80 text-text-muted border border-border/50"
                          >
                            {tech.name}
                          </span>
                        ))}
                        {project.tech_stack_details?.length > 4 && (
                          <span className="font-mono text-[10px] text-text-muted self-center">
                            +{project.tech_stack_details.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Link
                          to={`/projects/${project.slug}`}
                          className="font-mono text-xs text-accent hover:underline flex items-center gap-1"
                        >
                          <span>$ inspect details</span>
                          <span>&rarr;</span>
                        </Link>

                        <div className="flex items-center gap-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                              aria-label={`GitHub repository for ${project.title}`}
                            >
                              <FaGithub className="w-4 h-4" />
                            </a>
                          )}

                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-text-muted hover:text-accent hover:bg-surface-2 transition-colors"
                              aria-label={`Live deployment for ${project.title}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────── */}
          {!isLoading && !isError && (
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={goToPage}
            />
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
}

export const FeaturedProjects = Projects;
export default Projects;
