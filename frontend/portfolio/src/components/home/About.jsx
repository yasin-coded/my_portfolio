import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Briefcase,
  GraduationCap,
  Terminal,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import api from '../../api/axios';
import localProfile from '../../data/profile';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import SkillGrid from './SkillGrid';
import { formatDate, formatMonthYear } from '../../utils/formatDate';

export function About() {
  const [activeTab, setActiveTab] = useState('experience');

  // ── Profile data query ──────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile/');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ── Experiences query ───────────────────────────────────────────
  const { data: experiences = [], isLoading: expLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const res = await api.get('/experiences/');
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ── Education query ─────────────────────────────────────────────
  const { data: education = [], isLoading: eduLoading } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const res = await api.get('/education/');
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const bioText = profile?.bio || profile?.hero_pitch || localProfile.description;
  const yearsExp = profile?.years_of_experience ?? 3;
  const location = profile?.location || 'Dhaka, Bangladesh';
  const isAvailable = profile?.is_available_for_hire ?? true;
  const resumeUrl = profile?.resume;

  return (
    <section id="about" className="scroll-mt-20 py-20 border-t border-border/40">
      <div className="flex flex-col gap-12">
        {/* ── Section Title ──────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5" />
            <span>// 02. about_me</span>
          </div>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
            $ cat /var/profile/bio.txt
          </h2>
          <p className="text-text-muted text-sm font-mono">
            // Developer background, skill breakdown, career journey and education.
          </p>
        </div>

        {/* ── Bio & Highlights Card ──────────────────────────────── */}
        <Card className="border-border/80 bg-surface/90">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <CardTitle as="h3" className="text-base text-accent">
                bio.txt
              </CardTitle>
            </div>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                  Download Resume (PDF)
                </Button>
              </a>
            )}
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-6">
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-text/90 leading-relaxed font-sans text-base sm:text-lg whitespace-pre-line">
                {bioText}
              </p>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/60 border border-border/50">
                <Briefcase className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-mono text-xs text-text-muted">Experience</p>
                  <p className="font-mono text-sm font-semibold text-text">{yearsExp}+ Years</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/60 border border-border/50">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-mono text-xs text-text-muted">Location</p>
                  <p className="font-mono text-sm font-semibold text-text">{location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/60 border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <div>
                  <p className="font-mono text-xs text-text-muted">Availability</p>
                  <p className="font-mono text-sm font-semibold text-success">
                    {isAvailable ? 'Open for Opportunities' : 'Currently Engaged'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Skills Breakdown ───────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-mono text-lg sm:text-xl font-bold text-text flex items-center gap-2">
              <Code2 className="w-5 h-5 text-accent" />
              <span>$ cat /skills/*.py</span>
            </h3>
            <span className="font-mono text-xs text-text-muted">proficiency_index (1–100%)</span>
          </div>

          <SkillGrid />
        </div>

        {/* ── Career Journey & Education Tabs ────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`font-mono text-sm sm:text-base font-bold pb-2 transition-colors relative ${
                  activeTab === 'experience'
                    ? 'text-accent border-b-2 border-accent -mb-[13px]'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                $ log --experience
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className={`font-mono text-sm sm:text-base font-bold pb-2 transition-colors relative ${
                  activeTab === 'education'
                    ? 'text-accent border-b-2 border-accent -mb-[13px]'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                $ log --education
              </button>
            </div>
            <span className="font-mono text-xs text-text-muted hidden sm:inline">
              chronological order
            </span>
          </div>

          {activeTab === 'experience' ? (
            expLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : experiences.length === 0 ? (
              <div className="p-8 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted">
                // No experience entries found.
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-accent/30 space-y-8 my-2">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative group">
                    {/* Node dot on timeline */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-accent group-hover:scale-125 transition-transform" />

                    <div className="flex flex-col gap-2 p-4 sm:p-5 rounded-lg bg-surface/80 border border-border/70 hover:border-accent/40 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono text-base font-bold text-text">{exp.role}</h4>
                          <span className="text-text-muted font-mono text-sm">@</span>
                          {exp.company_url ? (
                            <a
                              href={exp.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
                            >
                              <span>{exp.company}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-sm font-semibold text-accent">
                              {exp.company}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {exp.employment_type && (
                            <Badge variant="outline" size="sm">
                              {exp.employment_type.replace('_', ' ')}
                            </Badge>
                          )}
                          <span className="font-mono text-xs text-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatMonthYear(exp.start_date)} —{' '}
                            {exp.is_current ? (
                              <span className="text-success font-semibold">Present</span>
                            ) : (
                              formatMonthYear(exp.end_date)
                            )}
                          </span>
                        </div>
                      </div>

                      {exp.location && (
                        <p className="font-mono text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.location}</span>
                        </p>
                      )}

                      {exp.description && (
                        <p className="font-sans text-sm text-text/80 leading-relaxed whitespace-pre-line mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : eduLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : education.length === 0 ? (
            <div className="p-8 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted">
              // No education records found.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-accent/30 space-y-8 my-2">
              {education.map((edu) => (
                <div key={edu.id} className="relative group">
                  {/* Node dot on timeline */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-accent group-hover:scale-125 transition-transform" />

                  <div className="flex flex-col gap-2 p-4 sm:p-5 rounded-lg bg-surface/80 border border-border/70 hover:border-accent/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-accent shrink-0" />
                        <h4 className="font-mono text-base font-bold text-text">
                          {edu.degree} in {edu.field_of_study}
                        </h4>
                      </div>

                      <span className="font-mono text-xs text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {edu.start_year} — {edu.end_year || 'Present'}
                      </span>
                    </div>

                    <p className="font-mono text-sm text-accent font-semibold">{edu.institution}</p>

                    {edu.grade && (
                      <p className="font-mono text-xs text-text-muted">
                        Grade / GPA: <span className="text-text font-medium">{edu.grade}</span>
                      </p>
                    )}

                    {edu.description && (
                      <p className="font-sans text-sm text-text/80 leading-relaxed whitespace-pre-line mt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default About;
