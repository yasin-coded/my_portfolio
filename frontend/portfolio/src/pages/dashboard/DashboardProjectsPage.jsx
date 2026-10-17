import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import {
  Search,
  Plus,
  PencilLine,
  Trash2,
  ExternalLink,
  Star,
  FolderGit2,
  Save,
  RotateCcw,
} from 'lucide-react';

import {
  useDashboardProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAllSkills,
} from '../../hooks/useDashboardData';
import useDebounce from '../../hooks/useDebounce';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/dashboard/DataTable';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import ImageUploader from '../../components/dashboard/ImageUploader';
import Pagination from '../../components/ui/Pagination';
import { handleServerFormErrors } from '../../utils/formErrors';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

// lucide-react does not export brand icons; define GitHub icon component
function Github(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const CATEGORY_CHOICES = [
  { value: 'WEB', label: 'Web' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'ML', label: 'Machine Learning' },
  { value: 'OTHER', label: 'Other' },
];

const projectSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(150, 'Title max 150 chars'),
    summary: z.string().min(1, 'Summary is required').max(200, 'Summary must be 200 characters or fewer'),
    description: z.string().min(1, 'Description is required'),
    category: z.enum(['WEB', 'MOBILE', 'API', 'ML', 'OTHER']),
    live_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    github_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    completed_date: z.string().optional(),
    display_order: z.coerce.number().min(0).default(0),
    is_featured: z.boolean().default(false),
    tech_stack: z.array(z.number()).default([]),
  })
  .refine((data) => Boolean(data.live_url?.trim() || data.github_url?.trim()), {
    message: 'At least one of Live URL or GitHub URL must be provided.',
    path: ['live_url'],
  });

export function DashboardProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Image upload state
  const [coverFile, setCoverFile] = useState(null);
  const [initialCoverUrl, setInitialCoverUrl] = useState(null);

  // Queries & Mutations
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardProjects({
    page,
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
  });

  const { data: allSkills = [] } = useAllSkills();

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const projectsList = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
    ? data
    : [];
  const totalCount = data?.count ?? (Array.isArray(data) ? data.length : 0);
  const pageSize = 9; // SPEC §4 ProjectPagination is 9/page

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      category: 'WEB',
      live_url: '',
      github_url: '',
      completed_date: '',
      display_order: 0,
      is_featured: false,
      tech_stack: [],
    },
  });

  const watchedSummary = watch('summary') || '';
  const isSubmitting = createProjectMutation.isPending || updateProjectMutation.isPending;

  // Open modal for create or edit
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setCoverFile(null);
    setInitialCoverUrl(null);
    reset({
      title: '',
      summary: '',
      description: '',
      category: 'WEB',
      live_url: '',
      github_url: '',
      completed_date: '',
      display_order: 0,
      is_featured: false,
      tech_stack: [],
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setCoverFile(null);
    setInitialCoverUrl(project.cover_image || null);
    reset({
      title: project.title || '',
      summary: project.summary || '',
      description: project.description || '',
      category: project.category || 'WEB',
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      completed_date: project.completed_date || '',
      display_order: project.display_order ?? 0,
      is_featured: Boolean(project.is_featured),
      tech_stack: Array.isArray(project.tech_stack)
        ? project.tech_stack
        : Array.isArray(project.tech_stack_details)
        ? project.tech_stack_details.map((s) => s.id)
        : [],
    });
    setIsEditorOpen(true);
  };

  const onSubmitForm = async (values) => {
    // Client Zod validation
    const result = projectSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        setError(fieldName, { type: 'manual', message: issue.message });
      });
      return;
    }

    if (!editingProject && !coverFile) {
      setError('cover_image', { type: 'manual', message: 'Cover image is required when creating a project.' });
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('summary', values.summary);
    formData.append('description', values.description);
    formData.append('category', values.category);
    if (values.live_url) formData.append('live_url', values.live_url);
    if (values.github_url) formData.append('github_url', values.github_url);
    if (values.completed_date) formData.append('completed_date', values.completed_date);
    formData.append('display_order', String(values.display_order || 0));
    formData.append('is_featured', String(values.is_featured));

    if (Array.isArray(values.tech_stack)) {
      values.tech_stack.forEach((skillId) => {
        formData.append('tech_stack', skillId);
      });
    }

    if (coverFile instanceof File) {
      formData.append('cover_image', coverFile);
    }

    try {
      if (editingProject) {
        await updateProjectMutation.mutateAsync({ slug: editingProject.slug, formData });
        toast.success(`Project "${values.title}" updated.`);
      } else {
        await createProjectMutation.mutateAsync(formData);
        toast.success(`Project "${values.title}" created.`);
      }
      setIsEditorOpen(false);
    } catch (err) {
      handleServerFormErrors(err, setError, 'Failed to save project.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.slug);
      toast.success(`Project "${projectToDelete.title}" deleted.`);
      setProjectToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete project.');
    }
  };

  const columns = [
    {
      header: 'Project',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3 max-w-[280px]">
          {row?.cover_image ? (
            <img
              src={row.cover_image}
              alt=""
              className="w-12 h-8 rounded object-cover border border-border/60 shrink-0"
            />
          ) : null}
          <div className="min-w-0">
            <span className="font-mono text-xs font-semibold text-text truncate block">
              {row?.title}
            </span>
            <span className="font-mono text-[10px] text-text-muted truncate block">
              {row?.summary}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">{row?.category || '—'}</span>
      ),
    },
    {
      header: 'Featured',
      accessor: 'is_featured',
      cell: (row) => (
        row?.is_featured ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded">
            <Star className="w-2.5 h-2.5 fill-accent" /> Featured
          </span>
        ) : (
          <span className="font-mono text-xs text-text-muted/60">—</span>
        )
      ),
    },
    {
      header: 'Links',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row?.live_url && String(row.live_url).trim() ? (
            <a
              href={row.live_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live Deployment"
              className="p-1 rounded text-text-muted hover:text-accent"
              title="Live Deployment"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
          {row?.github_url && String(row.github_url).trim() ? (
            <a
              href={row.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-1 rounded text-text-muted hover:text-accent"
              title="GitHub Repo"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Order',
      accessor: 'display_order',
      align: 'center',
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">{row?.display_order ?? 0}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row?.slug ? (
            <Link
              to={`/projects/${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View public project"
              className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            aria-label="Edit project"
            className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setProjectToDelete(row)}
            aria-label="Delete project"
            className="p-1.5 rounded border border-border hover:border-danger text-text-muted hover:text-danger transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ manage_projects</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Showcase portfolio projects, tech stacks, repositories and live deployments
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Project
        </Button>
      </div>

      {/* Search & Category Filter */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects by title, summary or description..."
              className="w-full rounded-md border border-border/80 bg-surface-2 px-9 py-2 font-mono text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('');
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded font-mono text-xs transition-colors shrink-0',
                categoryFilter === ''
                  ? 'bg-accent text-on-accent font-semibold'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text'
              )}
            >
              All
            </button>
            {CATEGORY_CHOICES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.value);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded font-mono text-xs transition-colors shrink-0',
                  categoryFilter === cat.value
                    ? 'bg-accent text-on-accent font-semibold'
                    : 'bg-surface-2 text-text-muted border border-border hover:text-text'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects DataTable */}
      <DataTable
        columns={columns}
        data={projectsList}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyMessage="No projects found matching current filter."
        keyField="id"
      />

      {/* Pagination */}
      {!isLoading && !isError && totalCount > pageSize && (
        <Pagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        title={editingProject ? `Edit Project: ${editingProject.title}` : 'Create New Project'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseEditor}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmitForm)}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <Input
            label="Title"
            required
            placeholder="e.g., Cloud-Native Invoicing Platform"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <Textarea
              label="Summary (short teaser)"
              rows={2}
              required
              placeholder="Under 200 characters..."
              error={errors.summary?.message}
              {...register('summary')}
            />
            <div className="flex justify-end mt-1">
              <span
                className={cn(
                  'font-mono text-[10px]',
                  watchedSummary.length > 200 ? 'text-danger font-bold' : 'text-text-muted'
                )}
              >
                {watchedSummary.length}/200
              </span>
            </div>
          </div>

          <Textarea
            label="Full Description"
            rows={4}
            required
            placeholder="Detailed architecture and technology breakdown..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-medium text-text-muted block mb-1.5">
                Category *
              </label>
              <select
                className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent"
                {...register('category')}
              >
                {CATEGORY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Completed Date"
              type="date"
              error={errors.completed_date?.message}
              {...register('completed_date')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Live URL"
              placeholder="https://..."
              error={errors.live_url?.message}
              helperText="At least one of Live URL or GitHub URL is required"
              {...register('live_url')}
            />

            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              error={errors.github_url?.message}
              {...register('github_url')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Display Order"
              type="number"
              min={0}
              error={errors.display_order?.message}
              {...register('display_order')}
            />

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="proj_featured"
                className="rounded border-border bg-surface-2 text-accent focus:ring-accent"
                {...register('is_featured')}
              />
              <label htmlFor="proj_featured" className="font-mono text-xs text-text cursor-pointer select-none">
                Show as Featured Project
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="pt-2 border-t border-border/80">
            <ImageUploader
              label="Project Cover Image"
              value={coverFile || initialCoverUrl}
              error={errors.cover_image?.message}
              onChange={(file) => {
                setCoverFile(file);
                if (!file) setInitialCoverUrl(null);
              }}
              helperText="2 MB max (.jpg, .png, .webp)"
            />
          </div>

          {/* Tech Stack Multi-select from Skills */}
          <div className="pt-2 border-t border-border/80">
            <label className="font-mono text-xs font-medium text-text-muted block mb-2">
              Tech Stack Skills (Multi-select)
            </label>
            <Controller
              name="tech_stack"
              control={control}
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-border/60 rounded-md bg-surface-2/40">
                    {allSkills.map((skill) => {
                      const isSelected = selected.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(selected.filter((id) => id !== skill.id));
                            } else {
                              field.onChange([...selected, skill.id]);
                            }
                          }}
                          className={cn(
                            'font-mono text-[10px] px-2 py-0.5 rounded border transition-colors',
                            isSelected
                              ? 'bg-accent text-on-accent border-accent font-semibold'
                              : 'bg-surface-2 text-text-muted border-border hover:border-accent hover:text-text'
                          )}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete project "${projectToDelete?.title}"? This cannot be undone.`}
        confirmText="Confirm Delete"
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}

export default DashboardProjectsPage;
