import PageContainer from "../components/layout/PageContainer";

export function BlogListPage() {
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">
          $ cat /var/log/posts
        </h1>
        <p className="text-text-muted text-sm">
          // Blog list page with filters and debounced search will be assembled
          in Phase 8
        </p>
      </div>
    </PageContainer>
  );
}

export default BlogListPage;
