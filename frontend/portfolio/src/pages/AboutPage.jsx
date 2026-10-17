import PageContainer from '../components/layout/PageContainer';
import SkillGrid from '../components/home/SkillGrid';

export function AboutPage() {
  return (
    <PageContainer className="py-12">
      <div className="font-mono flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-2">$ cat /skills/*.py</h1>
          <p className="text-text-muted text-sm">// Technical skill groups and proficiency indices</p>
        </div>
        <SkillGrid />
      </div>
    </PageContainer>
  );
}

export default AboutPage;
