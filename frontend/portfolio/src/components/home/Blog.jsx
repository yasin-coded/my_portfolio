import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Search,
  Terminal,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Pagination from '../ui/Pagination';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 6;

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionRef = useRef(null);

  // ── Read state from URL ───────────────────────────────────────────
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'ALL';

  // ── Helpers to update URL ─────────────────────────────────────────
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

  // ── Build API params ──────────────────────────────────────────────
  const apiParams = {
    page: currentPage,
    page_size: PAGE_SIZE,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}),
    ordering: '-published_at',
  };

  // ── Fetch published posts (paginated) ─────────────────────────────
  const { data: postsData, isLoading: postsLoading, isError } = useQuery({
    queryKey: ['posts', apiParams],
    queryFn: async () => {
      const res = await api.get('/posts/', { params: apiParams });
      return res.data && Array.isArray(res.data.results)
        ? res.data
        : { count: 0, next: null, previous: null, results: [] };
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const posts = postsData?.results || [];
  const totalCount = postsData?.count ?? 0;

  // ── Unfiltered total: always shows the full published count ───────
  const { data: totalData } = useQuery({
    queryKey: ['posts-total-published'],
    queryFn: async () => {
      const res = await api.get('/posts/', { params: { page: 1, page_size: 1 } });
      return res.data?.count ?? 0;
    },
    staleTime: 1000 * 60 * 5,
  });
  const totalPublished = totalData ?? totalCount;

  // ── Guard: if page is beyond last, fall back to page 1 ───────────
  useEffect(() => {
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    if (totalCount > 0 && currentPage > totalPages) {
      goToPage(1);
    }
  }, [totalCount, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch categories ──────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories/');
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="scroll-mt-20 py-20 border-t border-border/40"
    >
      <div className="flex flex-col gap-10">
        {/* ── Section Title ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>// 04. written_thoughts</span>
            </div>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
              $ cat /var/log/posts/*
            </h2>
            <p className="text-text-muted text-sm font-mono">
              // Technical articles, architecture breakdowns, and developer guides.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setParam('search', e.target.value)}
              placeholder="grep article_title..."
              className="w-full bg-surface-2/60 border border-border/80 rounded-md pl-9 pr-4 py-2 font-mono text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* ── Category Chips ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setParam('category', 'ALL')}
            className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
              selectedCategory === 'ALL'
                ? 'bg-accent text-on-accent border-accent font-semibold shadow-sm'
                : 'bg-surface-2/50 border-border/80 text-text-muted hover:text-text hover:border-accent/40'
            }`}
          >
            All Articles ({totalPublished})
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setParam('category', cat.slug)}
                className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-on-accent border-accent font-semibold shadow-sm'
                    : 'bg-surface-2/50 border-border/80 text-text-muted hover:text-text hover:border-accent/40'
                }`}
              >
                {cat.name}
                {cat.posts_count != null && ` (${cat.posts_count})`}
              </button>
            );
          })}
        </div>

        {/* ── Posts Grid ─────────────────────────────────────────── */}
        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden border-border/70">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted flex flex-col items-center gap-3">
            <Terminal className="w-8 h-8 text-accent/40" />
            <p>bash: Failed to load posts. Please try again.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted flex flex-col items-center gap-3">
            <Terminal className="w-8 h-8 text-accent/40" />
            <p>
              bash: No posts found matching query in{' '}
              <span className="text-accent">/var/log/posts/</span>
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                hoverable
                className="flex flex-col justify-between border-border/80 bg-surface/90 group"
              >
                {/* 16:9 Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-surface-2 border-b border-border/60">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
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
                      <div className="text-center font-bold text-accent tracking-wider line-clamp-2">
                        {post.title}
                      </div>
                      <span className="text-text-muted/60 text-[10px] text-right">
                        // markdown_document
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {post.is_featured && (
                      <Badge variant="accent" size="sm" className="shadow-md">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {post.category_name && (
                      <Badge variant="default" size="sm" className="bg-bg/85 backdrop-blur-sm shadow-md">
                        {post.category_name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2.5">
                    {/* Meta header: Date & Reading time */}
                    <div className="flex items-center justify-between font-mono text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      {post.reading_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.reading_time} min read
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono text-base font-bold text-text group-hover:text-accent transition-colors line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="font-sans text-sm text-text-muted line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer Metrics & Read button */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 font-mono text-xs">
                    <div className="flex items-center gap-3 text-text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-danger/80" />
                        {post.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-accent/80" />
                        {post.comments_count || 0}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-accent hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Read</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────── */}
        {!postsLoading && !isError && (
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={goToPage}
          />
        )}
      </div>
    </section>
  );
}

export default Blog;
