import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  PencilLine,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  useDashboardPosts,
  useDeletePost,
  useUpdatePost,
} from '../../hooks/useDashboardData';
import useDebounce from '../../hooks/useDebounce';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/dashboard/DataTable';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

export function DashboardPostsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'PUBLISHED' | 'DRAFT'
  const [page, setPage] = useState(1);

  // Modal state for delete
  const [postToDelete, setPostToDelete] = useState(null);

  // Queries & Mutations
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardPosts({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });

  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();

  const postsList = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 6; // SPEC §4 PostPagination is 6/page

  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const formData = new FormData();
      formData.append('status', nextStatus);
      await updatePostMutation.mutateAsync({ slug: post.slug, formData });
      toast.success(
        `Post marked as ${nextStatus === 'PUBLISHED' ? 'Published' : 'Draft'}.`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.content?.[0] ||
          err?.response?.data?.category?.[0] ||
          err?.response?.data?.detail ||
          'Failed to toggle publication status.'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deletePostMutation.mutateAsync(postToDelete.slug);
      toast.success(`Post "${postToDelete.title}" deleted.`);
      setPostToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete post.');
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      cell: (row) => (
        <div className="space-y-0.5 max-w-[280px]">
          <Link
            to={`/dashboard/posts/${row.slug}/edit`}
            className="font-mono text-xs font-semibold text-text hover:text-accent transition-colors block truncate"
          >
            {row.title}
          </Link>
          <span className="font-mono text-[10px] text-text-muted/70 block truncate">
            /{row.slug}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category_name',
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.category_name || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold',
            row.status === 'PUBLISHED'
              ? 'bg-success/15 text-success'
              : 'bg-warning/15 text-warning'
          )}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Telemetry',
      accessor: 'views_count',
      cell: (row) => (
        <div className="font-mono text-[11px] text-text-muted space-x-2">
          <span>{row.views_count} views</span>
          <span>•</span>
          <span>{row.comments_count} comments</span>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (row) => (
        <span className="font-mono text-[11px] text-text-muted">
          {row.published_at
            ? new Date(row.published_at).toLocaleDateString()
            : row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Quick Publish / Unpublish Toggle */}
          <button
            type="button"
            onClick={() => handleTogglePublish(row)}
            disabled={updatePostMutation.isPending}
            title={row.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish post'}
            className={cn(
              'p-1.5 rounded border transition-colors',
              row.status === 'PUBLISHED'
                ? 'border-border text-success hover:bg-warning/10 hover:text-warning'
                : 'border-border text-warning hover:bg-success/10 hover:text-success'
            )}
          >
            {row.status === 'PUBLISHED' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
          </button>

          {/* View Public Post */}
          <Link
            to={`/blog/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View public post"
            className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Edit Post */}
          <Link
            to={`/dashboard/posts/${row.slug}/edit`}
            aria-label="Edit post"
            className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
          >
            <PencilLine className="w-3.5 h-3.5" />
          </Link>

          {/* Delete Post */}
          <button
            type="button"
            onClick={() => setPostToDelete(row)}
            aria-label="Delete post"
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
      {/* Title & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ manage_posts</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Draft, publish, edit and delete portfolio blog articles
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/dashboard/posts/new')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Post
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search posts by title, excerpt or content..."
              className="w-full rounded-md border border-border/80 bg-surface-2 px-9 py-2 font-mono text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto">
            {['all', 'PUBLISHED', 'DRAFT'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded font-mono text-xs transition-colors capitalize',
                  statusFilter === status
                    ? 'bg-accent text-on-accent font-semibold'
                    : 'bg-surface-2 text-text-muted border border-border hover:text-text'
                )}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={postsList}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyMessage="No posts found matching the filter."
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message={`Are you sure you want to permanently delete "${postToDelete?.title}"? This cannot be undone.`}
        confirmText="Confirm Delete"
        isLoading={deletePostMutation.isPending}
      />
    </div>
  );
}

export default DashboardPostsPage;
