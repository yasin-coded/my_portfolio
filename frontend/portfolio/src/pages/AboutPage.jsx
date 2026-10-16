import PageContainer from '../components/layout/PageContainer';

export function AboutPage() {
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">$ cat /about</h1>
        <p className="text-text-muted text-sm">// About page content will be populated in Phase 8</p>
      </div>
    </PageContainer>
  );
}

export default AboutPage;
