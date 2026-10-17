import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaGithub } from 'react-icons/fa';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Sparkles,
  Terminal,
} from 'lucide-react';
import api from '../api/axios';
import PageContainer from '../components/layout/PageContainer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatMonthYear } from '../utils/formatDate';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export function ProjectDetailPage() {
  const { slug } = useParams();

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const res = await api.get(`/projects/${slug}/`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <PageContainer className="py-16 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="aspect-video w-full rounded-xl mb-6" />
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-20 w-full" />
      </PageContainer>
    );
  }

  if (isError || !project) {
    return (
      <PageContainer className="py-24 text-center">
        <div className="max-w-md mx-auto p-8 bg-surface border border-border rounded-lg font-mono flex flex-col items-center gap-4">
          <Terminal className="w-10 h-10 text-danger" />
          <h2 className="text-lg font-bold text-text">Project Not Found</h2>
          <p className="text-xs text-text-muted">
            bash: /projects/{slug}: No such file or directory
          </p>
          <Link to="/#projects">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              $ cd /projects
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <ErrorBoundary>
      <PageContainer className="py-12 max-w-4xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Link
              to="/#projects"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>$ cd /projects</span>
            </Link>
            <span className="text-text-muted font-mono text-xs">/</span>
            <span className="font-mono text-xs text-accent font-semibold">{project.slug}</span>
          </div>

          <Card className="border-border/80 bg-surface/90 overflow-hidden">
            {project.cover_image && (
              <div className="aspect-video w-full overflow-hidden bg-surface-2 border-b border-border/60">
                <img
                  src={project.cover_image}
                  alt={`${project.title} screenshot`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="p-6 sm:p-8 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    {project.category}
                  </Badge>
                  {project.is_featured && (
                    <Badge variant="accent" size="sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {project.completed_date && (
                  <span className="font-mono text-xs text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Completed: {formatMonthYear(project.completed_date)}
                  </span>
                )}
              </div>

              <CardTitle as="h1" className="text-2xl sm:text-3xl text-text font-bold">
                {project.title}
              </CardTitle>

              {project.summary && (
                <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed">
                  {project.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Live deployment for ${project.title}`}
                  >
                    <Button variant="primary" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                      Launch Live App
                    </Button>
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub repository for ${project.title}`}
                  >
                    <Button variant="secondary" size="md" leftIcon={<FaGithub className="w-4 h-4" />}>
                      View Source Code
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 flex flex-col gap-8">
              {project.tech_stack_details && project.tech_stack_details.length > 0 && (
                <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
                    // Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack_details.map((tech) => (
                      <span
                        key={tech.id}
                        className="font-mono text-xs px-3 py-1.5 rounded-md bg-surface-2 border border-border/70 text-accent font-medium"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.description && (
                <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
                    // Overview & Architecture
                  </h3>
                  <div className="font-sans text-base text-text/90 leading-relaxed whitespace-pre-line space-y-4">
                    {project.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </ErrorBoundary>
  );
}

export default ProjectDetailPage;
