import PageContainer from '../components/layout/PageContainer';
import Hero    from '../components/home/Hero';
import About   from '../components/home/About';
import Projects from '../components/home/Projects';
import Blog    from '../components/home/Blog';
import Contact from '../components/home/Contact';

export function HomePage() {
  return (
    <PageContainer as="main" className="py-0">
      <Hero />
      <About />
      <Projects />
      <Blog />
      <Contact />
    </PageContainer>
  );
}

export default HomePage;
