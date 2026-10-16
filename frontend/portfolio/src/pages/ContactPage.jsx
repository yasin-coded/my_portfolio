import PageContainer from '../components/layout/PageContainer';

export function ContactPage() {
  return (
    <PageContainer className="py-12">
      <div className="font-mono py-12">
        <h1 className="text-2xl font-bold text-text mb-2">$ echo "message" &gt; /dev/contact</h1>
        <p className="text-text-muted text-sm">// Contact form will be assembled in Phase 8</p>
      </div>
    </PageContainer>
  );
}

export default ContactPage;
