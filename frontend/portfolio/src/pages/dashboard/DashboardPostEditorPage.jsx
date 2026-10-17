import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Edit3, Image as ImageIcon } from 'lucide-react';
import {
  useDashboardPost,
  useCreatePost,
  useUpdatePost,
  useCategories,
  useTags,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import ImageUploader from '../../components/dashboard/ImageUploader';
import Skeleton from '../../components/ui/Skeleton';
import { handleServerFormErrors } from '../../utils/formErrors';
import { cn } from '../../utils/cn';

const postSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    excerpt: z.string().max(300, 'Excerpt must be 300 characters or fewer').min(1, 'Excerpt is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.string().min(1, 'Please select a category'),
    tags: z.array(z.number()).default([]),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    is_featured: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'PUBLISHED') {
      if (!data.category || data.category.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: 'A category is required to publish a post.',
        });
      }
      if (data.content.trim().length < 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content'],
          message: 'Content must be at least 100 characters to publish.',
        });
      }
    }
  });

export function DashboardPostEditorPage() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();

  const { data: post, isLoading: isLoadingPost } = useDashboardPost(slug);
  const { data: rawCategories = [] } = useCategories();
  const { data: rawTags = [] } = useTags();

  const categories = Array.isArray(rawCategories)
    ? rawCategories
    : Array.isArray(rawCategories?.results)
    ? rawCategories.results
    : [];

  const tagsList = Array.isArray(rawTags)
    ? rawTags
    : Array.isArray(rawTags?.results)
    ? rawTags.results
    : [];

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [coverFile, setCoverFile] = useState(null); // File object or null
  const [initialCoverUrl, setInitialCoverUrl] = useState(null);

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
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'DRAFT',
      is_featured: false,
    },
  });

  const watchedTitle = watch('title') || '';
  const watchedExcerpt = watch('excerpt') || '';
  const watchedContent = watch('content') || '';
  const watchedStatus = watch('status');

  // Pre-fill form when editing
  useEffect(() => {
    if (post && isEditing) {
      reset({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category ? String(post.category) : '',
        tags: Array.isArray(post.tags) ? post.tags : [],
        status: post.status || 'DRAFT',
        is_featured: Boolean(post.is_featured),
      });
      if (post.cover_image) {
        setInitialCoverUrl(post.cover_image);
      }
    }
  }, [post, isEditing, reset]);

  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending;

  const onSubmit = async (values) => {
    // Client Zod validation
    const result = postSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        setError(fieldName, { type: 'manual', message: issue.message });
      });
      toast.error(result.error.issues[0]?.message || 'Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('excerpt', values.excerpt);
    formData.append('content', values.content);
    formData.append('category', values.category);
    formData.append('status', values.status);
    formData.append('is_featured', String(values.is_featured));

    // Append tags (optional: can be empty)
    if (Array.isArray(values.tags) && values.tags.length > 0) {
      values.tags.forEach((tagId) => {
        formData.append('tags', tagId);
      });
    }

    // Cover image
    if (coverFile instanceof File) {
      formData.append('cover_image', coverFile);
    }

    try {
      if (isEditing) {
        await updatePostMutation.mutateAsync({ slug, formData });
        toast.success(`Post "${values.title}" updated successfully.`);
      } else {
        await createPostMutation.mutateAsync(formData);
        toast.success(`Post "${values.title}" created successfully.`);
      }
      navigate('/dashboard/posts');
    } catch (err) {
      handleServerFormErrors(err, setError, 'Failed to save post.');
    }
  };

  if (isEditing && isLoadingPost) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="border-border/80 bg-surface/90">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/posts')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back
          </Button>
          <div>
            <h1 className="font-mono text-xl font-bold text-text">
              {isEditing ? `$ edit_post --slug "${slug}"` : '$ create_post --new'}
            </h1>
            <p className="font-mono text-xs text-text-muted mt-0.5">
              // Markdown editor with real-time validation and preview
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column (Title, Excerpt, Markdown Content) */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-5 space-y-4">
                <Input
                  label="Post Title"
                  required
                  placeholder="e.g., Scaling Django ORM Aggregations in High-Load APIs"
                  error={errors.title?.message}
                  {...register('title')}
                />

                {/* Auto slug preview */}
                <div className="font-mono text-xs text-text-muted">
                  <span className="text-text-muted/60">Slug: </span>
                  <span className="text-accent">
                    {isEditing
                      ? post?.slug
                      : watchedTitle
                      ? watchedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      : 'auto-generated-from-title'}
                  </span>
                </div>

                {/* Excerpt with character counter */}
                <div>
                  <Textarea
                    label="Excerpt"
                    rows={3}
                    required
                    placeholder="Short summary under 300 characters..."
                    error={errors.excerpt?.message}
                    {...register('excerpt')}
                  />
                  <div className="flex justify-end mt-1">
                    <span
                      className={cn(
                        'font-mono text-[10px]',
                        watchedExcerpt.length > 300 ? 'text-danger font-bold' : 'text-text-muted'
                      )}
                    >
                      {watchedExcerpt.length}/300
                    </span>
                  </div>
                </div>

                {/* Markdown editor with write / preview tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-medium text-text-muted flex items-center gap-1">
                      <span>Article Content (Markdown)</span>
                      <span className="text-danger">*</span>
                    </label>

                    <div className="flex rounded-md border border-border bg-surface-2 p-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors',
                          activeTab === 'write'
                            ? 'bg-accent text-on-accent font-semibold'
                            : 'text-text-muted hover:text-text'
                        )}
                      >
                        <Edit3 className="w-3 h-3" />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors',
                          activeTab === 'preview'
                            ? 'bg-accent text-on-accent font-semibold'
                            : 'text-text-muted hover:text-text'
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {activeTab === 'write' ? (
                    <Textarea
                      rows={14}
                      placeholder="Write markdown content here... (minimum 100 characters to publish)"
                      error={errors.content?.message}
                      className="font-mono text-xs"
                      {...register('content')}
                    />
                  ) : (
                    <div className="min-h-[320px] p-4 rounded-md border border-border bg-surface-2 font-mono text-xs text-text overflow-y-auto prose prose-invert max-w-none">
                      {watchedContent.trim() ? (
                        <ReactMarkdown>{watchedContent}</ReactMarkdown>
                      ) : (
                        <p className="text-text-muted italic">// No content to preview yet.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-mono text-[10px] text-text-muted">
                    <span>
                      Words: ~{watchedContent.trim() ? watchedContent.trim().split(/\s+/).length : 0} | Reading time: ~
                      {Math.max(1, Math.ceil((watchedContent.trim().split(/\s+/).length || 0) / 200))} min
                    </span>
                    <span className={watchedContent.trim().length < 100 && watchedStatus === 'PUBLISHED' ? 'text-warning' : ''}>
                      {watchedContent.trim().length} chars (min 100 to publish)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings (Category, Tags, Status, Cover Image) */}
          <div className="space-y-5">
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-5 space-y-4">
                {/* Status Selector */}
                <div>
                  <label className="font-mono text-xs font-medium text-text-muted block mb-1.5">
                    Publication Status
                  </label>
                  <select
                    className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent"
                    {...register('status')}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                {/* Category Select - Always Required */}
                <div>
                  <label className="font-mono text-xs font-medium text-text-muted flex items-center gap-1 mb-1.5">
                    <span>Category</span>
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className={cn(
                      'w-full bg-surface-2 border border-border rounded-md px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent',
                      errors.category && 'border-danger focus:border-danger'
                    )}
                    {...register('category')}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="font-mono text-xs text-danger mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_featured"
                    className="rounded border-border bg-surface-2 text-accent focus:ring-accent"
                    {...register('is_featured')}
                  />
                  <label htmlFor="is_featured" className="font-mono text-xs text-text select-none cursor-pointer">
                    Feature post on hero / showcase
                  </label>
                </div>

                {/* Cover Image Upload */}
                <div className="pt-2 border-t border-border/80">
                  <ImageUploader
                    label="Cover Image"
                    value={coverFile || initialCoverUrl}
                    onChange={(file) => {
                      setCoverFile(file);
                      if (!file) setInitialCoverUrl(null);
                    }}
                    helperText="JPG, PNG or WebP under 2 MB"
                  />
                </div>

                {/* Tags Multi-select */}
                <div className="pt-2 border-t border-border/80">
                  <label className="font-mono text-xs font-medium text-text-muted block mb-2">
                    Tags (Optional)
                  </label>
                  {tagsList.length === 0 ? (
                    <div className="font-mono text-xs text-text-muted p-2 rounded bg-surface-2/60 border border-border/60">
                      <span>No tags yet. </span>
                      <Link to="/dashboard/taxonomy" className="text-accent hover:underline font-semibold">
                        Create some in Taxonomy
                      </Link>
                    </div>
                  ) : (
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => {
                        const selected = Array.isArray(field.value) ? field.value : [];
                        return (
                          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                            {tagsList.map((tag) => {
                              const isSelected = selected.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      field.onChange(selected.filter((id) => id !== tag.id));
                                    } else {
                                      field.onChange([...selected, tag.id]);
                                    }
                                  }}
                                  className={cn(
                                    'font-mono text-[11px] px-2.5 py-1 rounded border transition-colors',
                                    isSelected
                                      ? 'bg-accent text-on-accent border-accent font-semibold'
                                      : 'bg-surface-2 text-text-muted border-border hover:border-accent hover:text-text'
                                  )}
                                >
                                  #{tag.name}
                                </button>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                  )}
                </div>

                {/* Save / Cancel CTAs */}
                <div className="pt-4 border-t border-border/80 flex flex-col gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    leftIcon={<Save className="w-4 h-4" />}
                    className="w-full justify-center font-mono text-xs font-semibold"
                  >
                    {isEditing ? 'Save Changes' : 'Publish / Create Post'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/posts')}
                    disabled={isSubmitting}
                    className="w-full justify-center font-mono text-xs text-text-muted hover:text-text"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DashboardPostEditorPage;
