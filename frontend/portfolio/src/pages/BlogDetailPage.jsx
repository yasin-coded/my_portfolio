import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

export function BlogDetailPage() {
  const { slug } = useParams();
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">$ read /posts/{slug}.md</h1>
        <p className="text-text-muted text-sm">// Blog detail markdown view will be assembled in Phase 8</p>
      </div>
    </PageContainer>
  );
}

export default BlogDetailPage;
