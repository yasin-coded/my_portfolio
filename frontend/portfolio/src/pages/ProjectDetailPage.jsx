import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

export function ProjectDetailPage() {
  const { slug } = useParams();
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">$ inspect /projects/{slug}</h1>
        <p className="text-text-muted text-sm">// Project detail view will be assembled in Phase 8</p>
      </div>
    </PageContainer>
  );
}

export default ProjectDetailPage;
