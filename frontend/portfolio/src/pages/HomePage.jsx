import PageContainer from '../components/layout/PageContainer';
import Hero    from '../components/home/Hero';
import About   from '../components/home/About';
import Projects from '../components/home/Projects';
import Blog    from '../components/home/Blog';
import Contact from '../components/home/Contact';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export function HomePage() {
  return (
    <PageContainer as="main" className="py-0">
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
      <ErrorBoundary>
        <About />
      </ErrorBoundary>
      <ErrorBoundary>
        <Projects />
      </ErrorBoundary>
      <ErrorBoundary>
        <Blog />
      </ErrorBoundary>
      <ErrorBoundary>
        <Contact />
      </ErrorBoundary>
    </PageContainer>
  );
}

export default HomePage;
