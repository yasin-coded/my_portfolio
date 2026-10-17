import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  ExternalLink,
  Mail,
  Globe,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  useDashboardComments,
  useToggleApproveComment,
  useDeleteComment,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

export function DashboardCommentsPage() {
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [page, setPage] = useState(1);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Map tab filter to query param
  const filterParams = { page };
  if (filter === 'pending') filterParams.is_approved = 'false';
  if (filter === 'approved') filterParams.is_approved = 'true';

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardComments(filterParams);

  const toggleApproveMutation = useToggleApproveComment();
  const deleteCommentMutation = useDeleteComment();

  const commentsList = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 10;

  const handleToggleApprove = async (comment) => {
    const nextStatus = !comment.is_approved;
    try {
      await toggleApproveMutation.mutateAsync({
        id: comment.id,
        is_approved: nextStatus,
      });
      toast.success(
        nextStatus
          ? `Comment from "${comment.name}" approved.`
          : `Comment from "${comment.name}" unapproved.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update comment status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      await deleteCommentMutation.mutateAsync(commentToDelete.id);
      toast.success(`Comment from "${commentToDelete.name}" deleted.`);
      setCommentToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete comment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ moderate_comments</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Review visitor feedback, approve legitimate comments and moderate spam
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'pending', label: 'Pending Approval' },
              { id: 'approved', label: 'Approved' },
              { id: 'all', label: 'All Comments' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded font-mono text-xs transition-colors',
                  filter === tab.id
                    ? 'bg-accent text-on-accent font-semibold'
                    : 'bg-surface-2 text-text-muted border border-border hover:text-text'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="font-mono text-xs text-text-muted hidden sm:block">
            {totalCount} comment{totalCount === 1 ? '' : 's'}
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/80 bg-surface/90">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <Card className="border-danger/60 bg-danger/10">
            <CardContent className="p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-danger mx-auto" />
              <p className="font-mono text-xs text-danger">
                Failed to load comments: {error?.message || 'Server error'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : commentsList.length === 0 ? (
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-text-muted/60" />
              <p>No comments found in this queue.</p>
            </CardContent>
          </Card>
        ) : (
          commentsList.map((comment) => (
            <Card key={comment.id} className="border-border/80 bg-surface/90">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="rounded-lg bg-surface-2 p-2 text-accent shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-text">
                        {comment.name}
                      </span>
                      {comment.email && (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
                          <Mail className="w-3 h-3 text-text-muted/60" />
                          {comment.email}
                        </span>
                      )}
                      {comment.website && (
                        <a
                          href={comment.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Website
                        </a>
                      )}
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider',
                          comment.is_approved
                            ? 'bg-success/15 text-success'
                            : 'bg-warning/15 text-warning'
                        )}
                      >
                        {comment.is_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>

                    {/* Post reference */}
                    <div className="font-mono text-xs text-text-muted flex items-center gap-1.5 flex-wrap">
                      <span>Article:</span>
                      <Link
                        to={`/blog/${comment.post_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text hover:text-accent font-semibold inline-flex items-center gap-1"
                      >
                        {comment.post_title || comment.post_slug}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Comment Content */}
                    <p className="font-sans text-sm text-text/90 leading-relaxed bg-surface-2/40 p-3 rounded-md border border-border/50">
                      {comment.content}
                    </p>

                    {/* Timestamp */}
                    <div className="font-mono text-[11px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-2 md:pt-0">
                  <Button
                    variant={comment.is_approved ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleApprove(comment)}
                    loading={toggleApproveMutation.isPending}
                    leftIcon={
                      comment.is_approved ? (
                        <XCircle className="w-3.5 h-3.5 text-warning" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {comment.is_approved ? 'Unapprove' : 'Approve'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCommentToDelete(comment)}
                    className="text-danger hover:bg-danger/10 hover:text-danger p-2"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalCount > pageSize && (
        <Pagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message={`Are you sure you want to delete this comment from "${commentToDelete?.name}"? It will be removed permanently.`}
        confirmText="Confirm Delete"
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
}

export default DashboardCommentsPage;
