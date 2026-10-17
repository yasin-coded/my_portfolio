import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  FileText,
  FolderGit2,
  MessageSquare,
  Wrench,
  RotateCcw,
  Plus,
  Eye,
  Heart,
  Mail,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDashboardStats, useDashboardPosts } from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { cn } from '../../utils/cn';

const statCardsMeta = [
  { key: 'total_posts', label: 'Total Posts', icon: FileText, accent: 'text-accent' },
  { key: 'published_posts', label: 'Published', icon: Activity, accent: 'text-success' },
  { key: 'draft_posts', label: 'Drafts', icon: FileText, accent: 'text-warning' },
  { key: 'total_projects', label: 'Projects', icon: FolderGit2, accent: 'text-accent' },
  { key: 'total_skills', label: 'Skills', icon: Wrench, accent: 'text-info' },
  { key: 'total_views', label: 'Total Views', icon: Eye, accent: 'text-accent' },
  { key: 'total_likes', label: 'Total Likes', icon: Heart, accent: 'text-danger' },
  { key: 'total_comments', label: 'Total Comments', icon: MessageSquare, accent: 'text-success' },
  { key: 'pending_comments', label: 'Pending Comments', icon: MessageSquare, accent: 'text-warning' },
  { key: 'unread_messages', label: 'Unread Messages', icon: Mail, accent: 'text-accent' },
];

export function DashboardOverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardStats();

  // Also query latest published post to get the real latest publication title & date
  const { data: latestPostsData } = useDashboardPosts({ status: 'PUBLISHED', page_size: 1 });
  const latestPost = latestPostsData?.results?.[0];

  const postsPerMonth = data?.posts_per_month || [];
  const maxMonthCount = Math.max(...postsPerMonth.map((p) => p.count), 1);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ sys_status --overview</h1>
          <p className="font-mono text-xs text-text-muted mt-1">// Live portfolio statistics and activity telemetry</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          loading={isFetching}
          leftIcon={<RotateCcw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />}
        >
          Sync Telemetry
        </Button>
      </div>

      {isError && (
        <Card className="border-danger/60 bg-danger/10">
          <CardContent className="p-4 flex items-center justify-between gap-4 font-mono text-xs text-danger">
            <span>Failed to load system stats: {error?.message || 'Server error'}</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {statCardsMeta.map(({ key, label, icon: Icon, accent }) => {
          const value = isLoading ? '—' : (data?.[key] ?? 0);
          return (
            <Card key={key} className="border-border/80 bg-surface/90">
              <CardContent className="p-3.5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
                  <div className={`p-1.5 rounded bg-surface-2 ${accent}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="font-mono text-xl font-bold text-text">
                  {isLoading ? <Skeleton className="h-6 w-12" /> : value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Posts per month Chart */}
        <Card className="border-border/80 bg-surface/90 xl:col-span-1">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h2 className="font-mono text-xs font-semibold uppercase text-text">// posts_per_month</h2>
              </div>
              <span className="font-mono text-[10px] text-text-muted">Last 6 mo</span>
            </div>

            {isLoading ? (
              <div className="flex items-end gap-2 h-40 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 h-24" />
                ))}
              </div>
            ) : postsPerMonth.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 text-center font-mono text-xs text-text-muted">
                No monthly publication data yet.
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-end pt-4">
                <div className="flex items-end gap-3 h-36 border-b border-border/80 pb-2 px-1">
                  {postsPerMonth.map((entry) => {
                    const heightPercent = Math.max(Math.round((entry.count / maxMonthCount) * 100), 8);
                    return (
                      <div key={entry.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="font-mono text-[10px] font-bold text-text group-hover:text-accent transition-colors">
                          {entry.count}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-accent/70 hover:bg-accent rounded-t transition-all duration-300"
                          title={`${entry.month}: ${entry.count} post(s)`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-1 pt-2 px-1">
                  {postsPerMonth.map((entry) => (
                    <span key={entry.month} className="flex-1 text-center font-mono text-[9px] text-text-muted truncate">
                      {entry.month?.slice(5) || entry.month}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Posts by views */}
        <Card className="border-border/80 bg-surface/90 xl:col-span-1">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h2 className="font-mono text-xs font-semibold uppercase text-text">// top_posts_by_views</h2>
              </div>
              <Link to="/dashboard/posts" className="font-mono text-[11px] text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (data?.top_posts || []).length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 text-center font-mono text-xs text-text-muted">
                No published posts telemetry available.
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {data.top_posts.map((post, idx) => (
                  <div
                    key={post.slug || idx}
                    className="p-2.5 rounded-md bg-surface-2/60 border border-border/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-medium text-text hover:text-accent truncate block"
                      >
                        {idx + 1}. {post.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-text-muted">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3 h-3 text-accent" />
                        {post.views_count}
                      </span>
                      <span className="flex items-center gap-1" title="Likes">
                        <Heart className="w-3 h-3 text-danger" />
                        {post.likes_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Telemetry Summary */}
        <Card className="border-border/80 bg-surface/90 xl:col-span-1">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-5">
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase text-text mb-3">// telemetry_summary</h2>
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-surface-2/60 border border-border/50">
                  <span className="text-text-muted">Latest publication</span>
                  <span className="text-text font-medium truncate max-w-[160px]" title={latestPost?.title}>
                    {latestPost?.title || 'No published posts'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-surface-2/60 border border-border/50">
                  <span className="text-text-muted">Pending comments queue</span>
                  <span className={cn('font-bold', data?.pending_comments > 0 ? 'text-warning' : 'text-text')}>
                    {data?.pending_comments ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-surface-2/60 border border-border/50">
                  <span className="text-text-muted">Unread visitor messages</span>
                  <span className={cn('font-bold', data?.unread_messages > 0 ? 'text-accent' : 'text-text')}>
                    {data?.unread_messages ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-mono text-xs font-semibold uppercase text-text mb-3">// quick_actions</h2>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dashboard/posts/new')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="w-full justify-start font-mono"
                >
                  New Post
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/dashboard/projects')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="w-full justify-start font-mono"
                >
                  Manage Projects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard/comments')}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  className="w-full justify-start font-mono"
                >
                  Moderate Comments ({data?.pending_comments ?? 0})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Comments Stream */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              <h2 className="font-mono text-xs font-semibold uppercase text-text">// recent_comment_stream</h2>
            </div>
            <Link to="/dashboard/comments" className="font-mono text-[11px] text-accent hover:underline flex items-center gap-1">
              Moderation queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.recent_comments || []).length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-text-muted">
              No visitor comments recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.recent_comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 rounded-lg border border-border/70 bg-surface-2/40 flex flex-col justify-between gap-3 font-mono text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-text">{comment.name}</span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded font-semibold',
                          comment.is_approved
                            ? 'bg-success/15 text-success'
                            : 'bg-warning/15 text-warning'
                        )}
                      >
                        {comment.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-text-muted line-clamp-2 leading-relaxed">
                      "{comment.content}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-muted">
                    <span className="truncate max-w-[140px]" title={comment.post_title}>
                      on {comment.post_title || 'Post'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardOverviewPage;
