import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  CornerDownRight,
  Send,
  Terminal,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import PageContainer from '../components/layout/PageContainer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatDate } from '../utils/formatDate';
import { commentSchema, parseApiError } from '../utils/validators';

export function BlogDetailPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, name }
  const commentFormRef = useRef(null);

  const handleReplyClick = (target) => {
    setReplyTo(target);
    commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const textarea = commentFormRef.current?.querySelector('textarea');
      textarea?.focus();
    }, 150);
  };

  // ── Fetch Post Details ──────────────────────────────────────────
  const { data: post, isLoading: postLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await api.get(`/posts/${slug}/`);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  // ── Fetch Approved Comments ──────────────────────────────────────
  const { data: commentsData = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['post-comments', slug],
    queryFn: async () => {
      const res = await api.get(`/posts/${slug}/comments/`);
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ── Like Toggle Mutation with Optimistic UI (SPEC F-9) ─────────
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/posts/${slug}/like/`);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', slug] });
      const previousPost = queryClient.getQueryData(['post', slug]);

      if (previousPost) {
        const currentlyLiked = previousPost.is_liked;
        queryClient.setQueryData(['post', slug], {
          ...previousPost,
          is_liked: !currentlyLiked,
          likes_count: currentlyLiked
            ? Math.max(0, (previousPost.likes_count || 1) - 1)
            : (previousPost.likes_count || 0) + 1,
        });
      }

      return { previousPost };
    },
    onError: (err, _, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', slug], context.previousPost);
      }
      toast.error('Could not update like. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // ── Comment Submission Form ─────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      website: '',
      content: '',
    },
  });

  const onCommentSubmit = async (data) => {
    // Zod validation
    const result = commentSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        setError(field, { message: issue.message });
      });
      return;
    }

    try {
      const payload = {
        ...data,
        website: data.website?.trim() || undefined,
        parent: replyTo?.id || null,
      };
      await api.post(`/posts/${slug}/comments/`, payload);
      reset();
      setReplyTo(null);
      toast.success('Your comment is awaiting approval.');
      queryClient.invalidateQueries({ queryKey: ['post-comments', slug] });
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      if (fieldErrors.name) setError('name', { message: fieldErrors.name });
      if (fieldErrors.email) setError('email', { message: fieldErrors.email });
      if (fieldErrors.website) setError('website', { message: fieldErrors.website });
      if (fieldErrors.content) setError('content', { message: fieldErrors.content });
      toast.error(message);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  if (postLoading) {
    return (
      <PageContainer className="py-16 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !post) {
    return (
      <PageContainer className="py-24 text-center">
        <div className="max-w-md mx-auto p-8 bg-surface border border-border rounded-lg font-mono flex flex-col items-center gap-4">
          <Terminal className="w-10 h-10 text-danger" />
          <h2 className="text-lg font-bold text-text">Article Not Found</h2>
          <p className="text-xs text-text-muted">
            bash: /var/log/posts/{slug}.md: No such file or directory
          </p>
          <Link to="/#blog">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              $ cd /blog
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-12 max-w-3xl mx-auto">
      <div className="flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <Link
            to="/#blog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>$ cd /blog</span>
          </Link>
          <span className="text-text-muted font-mono text-xs">/</span>
          <span className="font-mono text-xs text-accent font-semibold">{post.slug}.md</span>
        </div>

        {/* ── Article Header ───────────────────────────────────────── */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.category_name && (
              <Badge variant="accent" size="sm">
                {post.category_name}
              </Badge>
            )}
            {post.tags_details?.map((tag) => (
              <span
                key={tag.id}
                className="font-mono text-xs px-2.5 py-0.5 rounded bg-surface-2 text-text-muted border border-border/60"
              >
                #{tag.name}
              </span>
            ))}
          </div>

          <h1 className="font-mono text-2xl sm:text-4xl font-bold text-text leading-tight">
            {post.title}
          </h1>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-border/60 font-mono text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              {post.reading_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {post.reading_time} min read
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views_count || 0} views
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {commentsData.length} comments
              </span>
            </div>
          </div>
        </header>

        {/* Cover Photo */}
        {post.cover_image && (
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-2 border border-border/80">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ── Markdown Content Body ────────────────────────────────── */}
        <article className="font-sans text-base sm:text-lg text-text/90 leading-relaxed max-w-prose space-y-6 pt-2">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="font-mono text-2xl sm:text-3xl font-bold text-text mt-8 mb-4 border-b border-border/50 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-text mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-mono text-lg font-bold text-accent mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed mb-4 text-text/90">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-2 mb-4 font-mono text-sm sm:text-base text-text/80">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 space-y-2 mb-4 font-mono text-sm sm:text-base text-text/80">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted my-4 font-mono text-sm">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="font-mono text-xs sm:text-sm bg-surface-2 px-1.5 py-0.5 rounded text-accent border border-border/60">
                    {children}
                  </code>
                ) : (
                  <pre className="font-mono text-xs sm:text-sm bg-surface p-4 rounded-lg border border-border/80 overflow-x-auto my-4 text-text">
                    <code>{children}</code>
                  </pre>
                ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* ── Action Bar: Likes & Share ───────────────────────────── */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border/80 font-mono text-sm">
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-150 ${
              post.is_liked
                ? 'bg-danger/15 text-danger border-danger/40 font-semibold'
                : 'bg-surface-2 border-border/70 text-text hover:text-danger hover:border-danger/40'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count || 0} Likes</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied Link!' : 'Share Article'}
          </Button>
        </div>

        {/* ── Comments Section ────────────────────────────────────── */}
        <section className="flex flex-col gap-8 pt-8 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xl font-bold text-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              <span>// Discussion ({commentsData.length})</span>
            </h3>
            <span className="font-mono text-xs text-text-muted">moderated queue</span>
          </div>

          {/* Comment Form */}
          <Card ref={commentFormRef} className="border-border/80 bg-surface/90">
            <CardHeader className="py-3 px-4 bg-surface-2/40 border-b border-border/60 flex-row items-center justify-between">
              <CardTitle as="h4" className="text-sm text-accent font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>
                  {replyTo ? `Replying to @${replyTo.name}` : '$ post_comment'}
                </span>
              </CardTitle>
              {replyTo && (
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="font-mono text-xs text-text-muted hover:text-danger cursor-pointer"
                >
                  [Cancel reply]
                </button>
              )}
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit(onCommentSubmit)} className="flex flex-col gap-4 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    placeholder="Your Name"
                    error={errors.name?.message}
                    disabled={isSubmitting}
                    {...register('name')}
                  />
                  <Input
                    label="Email * (never published)"
                    type="email"
                    placeholder="your@email.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    {...register('email')}
                  />
                </div>

                <Input
                  label="Website (optional)"
                  placeholder="https://yourwebsite.com"
                  error={errors.website?.message}
                  disabled={isSubmitting}
                  {...register('website')}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-text-muted font-medium">
                    Comment Body *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write a constructive comment..."
                    disabled={isSubmitting}
                    {...register('content')}
                    className={`w-full bg-surface-2/60 border rounded-md p-3 font-mono text-xs text-text placeholder:text-text-muted/60 focus:outline-none transition-colors ${
                      errors.content ? 'border-danger' : 'border-border/80 focus:border-accent'
                    }`}
                  />
                  {errors.content && (
                    <p className="text-xs text-danger">{errors.content.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Submit Comment for Review
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : commentsData.length === 0 ? (
            <div className="p-8 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted">
              // No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-4">
              {commentsData
                .filter((c) => !c.parent)
                .map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 rounded-lg bg-surface border border-border/80 flex flex-col gap-3 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-accent">
                          @{comment.name}
                        </span>
                        {comment.website && (
                          <a
                            href={comment.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-text-muted hover:underline"
                          >
                            [link]
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    <p className="font-sans text-sm text-text/90 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>

                    <div className="flex justify-end pt-2 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => handleReplyClick({ id: comment.id, name: comment.name })}
                        className="text-xs text-text-muted hover:text-accent flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-6 border-l-2 border-accent/30 space-y-3 mt-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-4 rounded-md bg-surface-2/60 border border-border/60 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-accent">
                                @{reply.name}
                              </span>
                              <span className="text-[11px] text-text-muted">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-text/90 leading-relaxed whitespace-pre-line">
                              {reply.content}
                            </p>
                            <div className="flex justify-end pt-1 border-t border-border/30">
                              <button
                                type="button"
                                onClick={() => handleReplyClick({ id: comment.id, name: reply.name })}
                                className="text-xs text-text-muted hover:text-accent flex items-center gap-1 font-mono cursor-pointer"
                              >
                                <CornerDownRight className="w-3 h-3" />
                                Reply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* ── Related Posts ───────────────────────────────────────── */}
        {post.related_posts && post.related_posts.length > 0 && (
          <section className="flex flex-col gap-4 pt-10 border-t border-border/60">
            <h3 className="font-mono text-base font-bold text-text uppercase tracking-wider">
              // Related Posts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.related_posts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="p-4 rounded-lg bg-surface border border-border/70 hover:border-accent/40 transition-colors flex flex-col gap-2 group"
                >
                  <h4 className="font-mono text-sm font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  {rel.excerpt && (
                    <p className="font-sans text-xs text-text-muted line-clamp-2">
                      {rel.excerpt}
                    </p>
                  )}
                  <span className="font-mono text-[11px] text-accent mt-1">
                    Read article &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}

export default BlogDetailPage;
