import PageContainer from "../components/layout/PageContainer";

export function ProjectsPage() {
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">
          $ ls -la /projects
        </h1>
        <p className="text-text-muted text-sm">
          // Projects page will be assembled in Phase 8
        </p>
      </div>
    </PageContainer>
  );
}

export default ProjectsPage;
