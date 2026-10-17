import { useState } from 'react';
import {
  Mail,
  CheckCheck,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import {
  useDashboardMessages,
  useToggleReadMessage,
  useDeleteMessage,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

export function DashboardMessagesPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [messageToDelete, setMessageToDelete] = useState(null);

  const queryParams = { page };
  if (filter === 'unread') queryParams.is_read = 'false';
  if (filter === 'read') queryParams.is_read = 'true';

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardMessages(queryParams);

  const toggleReadMutation = useToggleReadMessage();
  const deleteMessageMutation = useDeleteMessage();

  const messagesList = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 10;

  // Unread first sort
  const sortedMessages = [...messagesList].sort((a, b) => {
    if (a.is_read === b.is_read) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return a.is_read ? 1 : -1;
  });

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleRead = async (message, e) => {
    e?.stopPropagation();
    const nextStatus = !message.is_read;
    try {
      await toggleReadMutation.mutateAsync({
        id: message.id,
        is_read: nextStatus,
      });
      toast.success(
        nextStatus ? 'Message marked as read.' : 'Message marked as unread.'
      );
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update message.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    try {
      await deleteMessageMutation.mutateAsync(messageToDelete.id);
      toast.success(`Message from "${messageToDelete.name}" deleted.`);
      setMessageToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete message.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ inbox_messages</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Direct inquiries and client contact submissions from public site
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Messages' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' },
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
            {totalCount} message{totalCount === 1 ? '' : 's'}
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/80 bg-surface/90">
              <CardContent className="p-5 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <Card className="border-danger/60 bg-danger/10">
            <CardContent className="p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-danger mx-auto" />
              <p className="font-mono text-xs text-danger">
                Failed to load messages: {error?.message || 'Server error'}
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
        ) : sortedMessages.length === 0 ? (
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-text-muted/60" />
              <p>No messages found in this inbox filter.</p>
            </CardContent>
          </Card>
        ) : (
          sortedMessages.map((msg) => {
            const isExpanded = expandedIds.has(msg.id);
            return (
              <Card
                key={msg.id}
                className={cn(
                  'border transition-colors duration-150',
                  !msg.is_read
                    ? 'border-accent/40 bg-surface shadow-sm'
                    : 'border-border/80 bg-surface/80'
                )}
              >
                <CardContent className="p-4 md:p-5">
                  <div
                    onClick={() => toggleExpand(msg.id)}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Unread Accent Dot */}
                      <div className="pt-1.5 shrink-0">
                        {!msg.is_read ? (
                          <span
                            className="block w-2.5 h-2.5 rounded-full bg-accent animate-pulse"
                            title="Unread"
                          />
                        ) : (
                          <span
                            className="block w-2.5 h-2.5 rounded-full bg-border"
                            title="Read"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-text">
                            {msg.name}
                          </span>
                          <span className="font-mono text-[11px] text-text-muted">
                            &lt;{msg.email}&gt;
                          </span>
                          {!msg.is_read && (
                            <span className="bg-accent/15 text-accent font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold">
                              New
                            </span>
                          )}
                        </div>

                        <h2 className={cn(
                          'font-mono text-sm truncate',
                          !msg.is_read ? 'font-bold text-text' : 'font-normal text-text/80'
                        )}>
                          {msg.subject || '(No subject)'}
                        </h2>

                        {!isExpanded && (
                          <p className="font-sans text-xs text-text-muted truncate mt-1">
                            {msg.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Quick Actions */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 shrink-0 self-end md:self-center"
                    >
                      <span className="font-mono text-[11px] text-text-muted flex items-center gap-1 mr-2">
                        <Clock className="w-3 h-3" />
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '—'}
                      </span>

                      {/* Mark Read Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(msg, e)}
                        disabled={toggleReadMutation.isPending}
                        title={msg.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        className={cn(
                          'p-1.5 rounded border transition-colors',
                          msg.is_read
                            ? 'border-border text-text-muted hover:text-accent hover:border-accent'
                            : 'border-accent text-accent bg-accent/10 hover:bg-accent/20'
                        )}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setMessageToDelete(msg)}
                        title="Delete Message"
                        className="p-1.5 rounded border border-border text-text-muted hover:text-danger hover:border-danger transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(msg.id)}
                        className="p-1.5 rounded border border-border text-text-muted hover:text-text transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/70 space-y-3">
                      <div className="p-4 rounded-md bg-surface-2/60 border border-border/50 text-text font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                      <div className="flex items-center justify-between font-mono text-xs text-text-muted">
                        <span>
                          Received on{' '}
                          {msg.created_at ? new Date(msg.created_at).toLocaleString() : '—'}
                        </span>
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || '')}`}
                          className="text-accent hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(messageToDelete)}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Contact Message"
        message={`Are you sure you want to permanently delete the inquiry from "${messageToDelete?.name}"?`}
        confirmText="Confirm Delete"
        isLoading={deleteMessageMutation.isPending}
      />
    </div>
  );
}

export default DashboardMessagesPage;
