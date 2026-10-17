import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import {
  Send,
  Mail,
  MapPin,
  CheckCircle,
  Terminal,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { contactSchema, parseApiError } from '../../utils/validators';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ErrorBoundary from '../ui/ErrorBoundary';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile/');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    const result = contactSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        setError(field, { message: issue.message });
      });
      return;
    }

    try {
      await api.post('/contact/', data);
      setSubmitted(true);
      reset();
      toast.success('Your message has been sent successfully.');
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setServerError(message);
      if (fieldErrors.name) setError('name', { message: fieldErrors.name });
      if (fieldErrors.email) setError('email', { message: fieldErrors.email });
      if (fieldErrors.subject) setError('subject', { message: fieldErrors.subject });
      if (fieldErrors.message) setError('message', { message: fieldErrors.message });
      toast.error(message);
    }
  };

  const email = profile?.email || 'contact@example.com';
  const location = profile?.location || 'Dhaka, Bangladesh';

  return (
    <ErrorBoundary>
      <section id="contact" className="scroll-mt-20 py-20 border-t border-border/40">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-widest">
              <Send className="w-3.5 h-3.5" />
              <span>// 05. initiate_handshake</span>
            </div>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
              $ echo &quot;message&quot; &gt; /dev/contact
            </h2>
            <p className="text-text-muted text-sm font-mono">
              // Have a question, project proposal, or collaboration idea? Send a transmission.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="border-border/80 bg-surface/90">
                <CardHeader className="py-3 px-4 bg-surface-2/40 border-b border-border/60">
                  <CardTitle as="h3" className="text-sm text-accent flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>// connection_endpoints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex flex-col gap-6 font-mono text-sm">
                  <p className="text-text/80 text-xs sm:text-sm leading-relaxed">
                    I typically respond within 24 hours. For urgent opportunities, reach out directly via email.
                  </p>

                  <div className="flex flex-col gap-4">
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/60 border border-border/50 text-text hover:text-accent hover:border-accent/40 transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-accent shrink-0" />
                      <div className="truncate">
                        <p className="text-[11px] text-text-muted">Primary Mailbox</p>
                        <p className="font-semibold text-xs sm:text-sm truncate">{email}</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/60 border border-border/50 text-text">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <p className="text-[11px] text-text-muted">Base Location</p>
                        <p className="font-semibold text-xs sm:text-sm">{location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
                    <p className="text-xs text-text-muted">// social_matrix</p>
                    <div className="flex items-center gap-2.5">
                      {profile?.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-surface-2 border border-border/70 text-text hover:text-accent hover:border-accent/40 transition-colors"
                          aria-label="GitHub profile"
                        >
                          <FaGithub className="w-4 h-4" />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-surface-2 border border-border/70 text-text hover:text-accent hover:border-accent/40 transition-colors"
                          aria-label="LinkedIn profile"
                        >
                          <FaLinkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile?.x_url && (
                        <a
                          href={profile.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-surface-2 border border-border/70 text-text hover:text-accent hover:border-accent/40 transition-colors"
                          aria-label="X profile"
                        >
                          <FaXTwitter className="w-4 h-4" />
                        </a>
                      )}
                      {profile?.website_url && (
                        <a
                          href={profile.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-surface-2 border border-border/70 text-text hover:text-accent hover:border-accent/40 transition-colors"
                          aria-label="Personal Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7">
              <Card className="border-border/80 bg-surface/90">
                <CardHeader className="py-3 px-4 bg-surface-2/40 border-b border-border/60">
                  <CardTitle as="h3" className="text-sm text-accent flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>// transmission_buffer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {submitted ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-4 font-mono">
                      <div className="w-12 h-12 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-text">
                          Transmission Acknowledged [200 OK]
                        </h4>
                        <p className="text-xs text-text-muted max-w-sm">
                          Thank you for reaching out. Your transmission has been saved to the message queue.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmitted(false)}
                        className="mt-2"
                      >
                        Send another transmission
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 font-mono">
                      {serverError && (
                        <div className="p-3 rounded-md bg-danger/10 border border-danger/40 text-danger text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{serverError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Your Name *"
                          placeholder="John Doe"
                          error={errors.name?.message}
                          disabled={isSubmitting}
                          {...register('name')}
                        />
                        <Input
                          label="Your Email *"
                          placeholder="you@example.com"
                          type="email"
                          error={errors.email?.message}
                          disabled={isSubmitting}
                          {...register('email')}
                        />
                      </div>

                      <Input
                        label="Subject *"
                        placeholder="Project inquiry"
                        error={errors.subject?.message}
                        disabled={isSubmitting}
                        {...register('subject')}
                      />

                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-xs text-text-muted">Message *</label>
                        <textarea
                          rows={7}
                          disabled={isSubmitting}
                          {...register('message')}
                          className="w-full rounded-md border border-border/80 bg-surface-2/60 px-3 py-2 font-sans text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          placeholder="Tell me about your project or idea..."
                        />
                        {errors.message && (
                          <p className="text-xs text-danger">{errors.message.message}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-end">
                        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}

export default Contact;
