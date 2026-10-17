import { useQuery } from '@tanstack/react-query';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { Globe, Mail } from 'lucide-react';
import api from '../../api/axios';
import PageContainer from './PageContainer';

const FOOTER_LINKS = [
  { id: 'about',    label: '// about' },
  { id: 'projects', label: '// projects' },
  { id: 'blog',     label: '// blog' },
  { id: 'contact',  label: '// contact' },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  window.history.replaceState(null, '', `/#${id}`);
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => { const r = await api.get('/profile/'); return r.data; },
    staleTime: 1000 * 60 * 10,
  });

  const fullName = profile?.full_name || 'Portfolio Owner';

  const socials = [
    { href: profile?.github_url,   icon: FaGithub,   label: 'GitHub' },
    { href: profile?.linkedin_url, icon: FaLinkedin, label: 'LinkedIn' },
    { href: profile?.x_url,        icon: FaXTwitter, label: 'X / Twitter' },
    { href: profile?.website_url,  icon: Globe,      label: 'Website' },
    { href: profile?.email ? `mailto:${profile.email}` : null, icon: Mail, label: 'Email' },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto py-12 transition-colors duration-200">
      <PageContainer>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-xs text-text-muted">
                system_status: <span className="text-success font-semibold">nominal</span>
              </span>
            </div>
            <p className="font-mono text-xs text-text-muted">
              Built with Django REST Framework, React &amp; Tailwind v4
            </p>
          </div>

          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-md bg-surface-2 border border-border text-text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 font-mono text-xs text-text-muted">
          <p>© {currentYear} {fullName}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {FOOTER_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    scrollToSection(id);
                  }
                }}
                className="hover:text-accent transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}

export default Footer;
