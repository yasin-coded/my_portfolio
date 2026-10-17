import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Briefcase,
  GraduationCap,
  Plus,
  PencilLine,
  Trash2,
  Calendar,
  MapPin,
  ExternalLink,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useEducation,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Skeleton from '../../components/ui/Skeleton';
import { handleServerFormErrors } from '../../utils/formErrors';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
];

const experienceSchema = z
  .object({
    company: z.string().min(1, 'Company is required').max(150),
    role: z.string().min(1, 'Role is required').max(150),
    employment_type: z.string().default('FULL_TIME'),
    location: z.string().min(1, 'Location is required').max(150),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
    description: z.string().min(1, 'Description is required'),
    company_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    display_order: z.coerce.number().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    const today = new Date().toISOString().split('T')[0];
    if (data.start_date && data.start_date > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['start_date'],
        message: 'Start date cannot be in the future.',
      });
    }

    if (data.is_current) {
      if (data.end_date && data.end_date.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_date'],
          message: 'Current experience must not have an end date.',
        });
      }
    } else {
      if (!data.end_date || !data.end_date.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_date'],
          message: 'End date is required for past experience.',
        });
      } else if (data.start_date && data.end_date < data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_date'],
          message: 'End date must be on or after start date.',
        });
      }
    }
  });

const educationSchema = z
  .object({
    institution: z.string().min(1, 'Institution is required').max(150),
    degree: z.string().min(1, 'Degree is required').max(150),
    field_of_study: z.string().min(1, 'Field of study is required').max(150),
    start_year: z.coerce.number().min(1900, 'Invalid year').max(2100),
    end_year: z.coerce.number().min(1900).max(2100).optional().nullable(),
    grade: z.string().max(50).optional(),
    description: z.string().optional(),
  })
  .refine((data) => !data.end_year || data.end_year >= data.start_year, {
    message: 'End year cannot be earlier than start year.',
    path: ['end_year'],
  });

export function DashboardExperiencePage() {
  const [activeTab, setActiveTab] = useState('experience'); // 'experience' | 'education'

  // Queries
  const {
    data: experiences = [],
    isLoading: isLoadingExp,
    isError: isErrorExp,
    error: errorExp,
    refetch: refetchExp,
  } = useExperiences();

  const {
    data: education = [],
    isLoading: isLoadingEdu,
    isError: isErrorEdu,
    error: errorEdu,
    refetch: refetchEdu,
  } = useEducation();

  // Mutations
  const createExpMutation = useCreateExperience();
  const updateExpMutation = useUpdateExperience();
  const deleteExpMutation = useDeleteExperience();

  const createEduMutation = useCreateEducation();
  const updateEduMutation = useUpdateEducation();
  const deleteEduMutation = useDeleteEducation();

  // Modal states
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'experience'|'education', id, title }

  // Forms
  const expForm = useForm({
    defaultValues: {
      company: '',
      role: '',
      employment_type: 'FULL_TIME',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      company_url: '',
      display_order: 0,
    },
  });

  const eduForm = useForm({
    defaultValues: {
      institution: '',
      degree: '',
      field_of_study: '',
      start_year: new Date().getFullYear(),
      end_year: '',
      grade: '',
      description: '',
    },
  });

  const isCurrentChecked = expForm.watch('is_current');

  // Experience modal handlers
  const handleOpenExpModal = (exp = null) => {
    setEditingExp(exp);
    if (exp) {
      expForm.reset({
        company: exp.company || '',
        role: exp.role || '',
        employment_type: exp.employment_type || 'FULL_TIME',
        location: exp.location || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: Boolean(exp.is_current),
        description: exp.description || '',
        company_url: exp.company_url || '',
        display_order: exp.display_order ?? 0,
      });
    } else {
      expForm.reset({
        company: '',
        role: '',
        employment_type: 'FULL_TIME',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        company_url: '',
        display_order: 0,
      });
    }
    setExpModalOpen(true);
  };

  const onSubmitExp = async (values) => {
    const parsed = experienceSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        expForm.setError(field, { type: 'manual', message: issue.message });
      });
      return;
    }

    const payload = {
      ...values,
      end_date: values.is_current ? null : values.end_date || null,
      display_order: Number(values.display_order || 0),
    };

    try {
      if (editingExp) {
        await updateExpMutation.mutateAsync({ id: editingExp.id, payload });
        toast.success(`Experience "${values.role} at ${values.company}" updated.`);
      } else {
        await createExpMutation.mutateAsync(payload);
        toast.success(`Experience "${values.role} at ${values.company}" created.`);
      }
      setExpModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, expForm.setError, 'Failed to save experience.');
    }
  };

  // Education modal handlers
  const handleOpenEduModal = (eduItem = null) => {
    setEditingEdu(eduItem);
    if (eduItem) {
      eduForm.reset({
        institution: eduItem.institution || '',
        degree: eduItem.degree || '',
        field_of_study: eduItem.field_of_study || '',
        start_year: eduItem.start_year || '',
        end_year: eduItem.end_year || '',
        grade: eduItem.grade || '',
        description: eduItem.description || '',
      });
    } else {
      eduForm.reset({
        institution: '',
        degree: '',
        field_of_study: '',
        start_year: new Date().getFullYear(),
        end_year: '',
        grade: '',
        description: '',
      });
    }
    setEduModalOpen(true);
  };

  const onSubmitEdu = async (values) => {
    const parsed = educationSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        eduForm.setError(field, { type: 'manual', message: issue.message });
      });
      return;
    }

    const payload = {
      ...values,
      start_year: Number(values.start_year),
      end_year: values.end_year ? Number(values.end_year) : null,
    };

    try {
      if (editingEdu) {
        await updateEduMutation.mutateAsync({ id: editingEdu.id, payload });
        toast.success(`Education "${values.degree}" updated.`);
      } else {
        await createEduMutation.mutateAsync(payload);
        toast.success(`Education "${values.degree}" added.`);
      }
      setEduModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, eduForm.setError, 'Failed to save education record.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'experience') {
        await deleteExpMutation.mutateAsync(deleteTarget.id);
        toast.success(`Experience "${deleteTarget.title}" deleted.`);
      } else {
        await deleteEduMutation.mutateAsync(deleteTarget.id);
        toast.success(`Education "${deleteTarget.title}" deleted.`);
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ manage_experience</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Work history, career timeline, degrees and certifications
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            activeTab === 'experience' ? handleOpenExpModal(null) : handleOpenEduModal(null)
          }
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          {activeTab === 'experience' ? 'Add Experience' : 'Add Education'}
        </Button>
      </div>

      {/* Tabs */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition-colors',
                activeTab === 'experience'
                  ? 'bg-accent text-on-accent font-semibold'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Experience ({experiences.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('education')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition-colors',
                activeTab === 'education'
                  ? 'bg-accent text-on-accent font-semibold'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Education ({education.length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Experience Tab Content */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {isLoadingExp ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/80 bg-surface/90">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))
          ) : isErrorExp ? (
            <Card className="border-danger/60 bg-danger/10">
              <CardContent className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-danger mx-auto" />
                <p className="font-mono text-xs text-danger">
                  Failed to load experience: {errorExp?.message || 'Server error'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchExp()}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : experiences.length === 0 ? (
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-3">
                <Briefcase className="w-8 h-8 mx-auto text-text-muted/60" />
                <p>No work experience entries recorded yet.</p>
                <Button variant="primary" size="sm" onClick={() => handleOpenExpModal(null)}>
                  Add Experience Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            experiences.map((entry) => (
              <Card key={entry.id} className="border-border/80 bg-surface/90">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="rounded-lg bg-surface-2 p-2 text-accent shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-mono text-base font-bold text-text">{entry.role}</h2>
                        <span className="font-mono text-xs text-text-muted font-semibold">
                          @ {entry.company}
                        </span>
                        <span className="bg-surface-2 border border-border px-2 py-0.5 rounded font-mono text-[10px] text-text-muted">
                          {entry.employment_type?.replace('_', '-')}
                        </span>
                        {entry.is_current && (
                          <span className="bg-success/15 text-success font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                            Current Role
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.start_date} — {entry.is_current ? 'Present' : entry.end_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {entry.location}
                        </span>
                        {entry.company_url && (
                          <a
                            href={entry.company_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-accent hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>

                      <p className="font-sans text-xs text-text/85 whitespace-pre-wrap leading-relaxed bg-surface-2/30 p-3 rounded border border-border/50">
                        {entry.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start">
                    <button
                      type="button"
                      onClick={() => handleOpenExpModal(entry)}
                      className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
                      title="Edit Experience"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'experience',
                          id: entry.id,
                          title: `${entry.role} at ${entry.company}`,
                        })
                      }
                      className="p-1.5 rounded border border-border hover:border-danger text-text-muted hover:text-danger transition-colors cursor-pointer"
                      title="Delete Experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Education Tab Content */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {isLoadingEdu ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/80 bg-surface/90">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardContent>
              </Card>
            ))
          ) : isErrorEdu ? (
            <Card className="border-danger/60 bg-danger/10">
              <CardContent className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-danger mx-auto" />
                <p className="font-mono text-xs text-danger">
                  Failed to load education: {errorEdu?.message || 'Server error'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchEdu()}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : education.length === 0 ? (
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-3">
                <GraduationCap className="w-8 h-8 mx-auto text-text-muted/60" />
                <p>No education credentials recorded yet.</p>
                <Button variant="primary" size="sm" onClick={() => handleOpenEduModal(null)}>
                  Add Education Credential
                </Button>
              </CardContent>
            </Card>
          ) : (
            education.map((eduItem) => (
              <Card key={eduItem.id} className="border-border/80 bg-surface/90">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="rounded-lg bg-surface-2 p-2 text-accent shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-mono text-base font-bold text-text">{eduItem.degree}</h2>
                        <span className="font-mono text-xs text-text-muted font-semibold">
                          — {eduItem.institution}
                        </span>
                        {eduItem.grade && (
                          <span className="bg-surface-2 border border-border px-2 py-0.5 rounded font-mono text-[10px] text-accent font-semibold">
                            Grade: {eduItem.grade}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
                        <span>{eduItem.field_of_study}</span>
                        <span>•</span>
                        <span>
                          {eduItem.start_year} — {eduItem.end_year || 'Ongoing'}
                        </span>
                      </div>

                      {eduItem.description && (
                        <p className="font-sans text-xs text-text/80 whitespace-pre-wrap leading-relaxed mt-2">
                          {eduItem.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start">
                    <button
                      type="button"
                      onClick={() => handleOpenEduModal(eduItem)}
                      className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
                      title="Edit Education"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'education',
                          id: eduItem.id,
                          title: `${eduItem.degree} from ${eduItem.institution}`,
                        })
                      }
                      className="p-1.5 rounded border border-border hover:border-danger text-text-muted hover:text-danger transition-colors cursor-pointer"
                      title="Delete Education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Experience Create/Edit Modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title={editingExp ? 'Edit Experience Entry' : 'New Experience Entry'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setExpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createExpMutation.isPending || updateExpMutation.isPending}
              onClick={expForm.handleSubmit(onSubmitExp)}
            >
              Save Experience
            </Button>
          </>
        }
      >
        <form onSubmit={expForm.handleSubmit(onSubmitExp)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Organization"
              required
              placeholder="e.g., Google, Stripe, Vercel"
              error={expForm.formState.errors.company?.message}
              {...expForm.register('company')}
            />
            <Input
              label="Role Title"
              required
              placeholder="e.g., Senior Backend Engineer"
              error={expForm.formState.errors.role?.message}
              {...expForm.register('role')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-medium text-text-muted block mb-1.5">
                Employment Type *
              </label>
              <select
                className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent"
                {...expForm.register('employment_type')}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location"
              required
              placeholder="e.g., San Francisco, CA / Remote"
              error={expForm.formState.errors.location?.message}
              {...expForm.register('location')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              error={expForm.formState.errors.start_date?.message}
              {...expForm.register('start_date')}
            />

            <div>
              <Input
                label="End Date"
                type="date"
                disabled={isCurrentChecked}
                error={expForm.formState.errors.end_date?.message}
                helperText={isCurrentChecked ? 'Disabled (Current role)' : 'Required for past role'}
                {...expForm.register('end_date')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              className="rounded border-border bg-surface-2 text-accent focus:ring-accent"
              {...expForm.register('is_current')}
            />
            <label htmlFor="is_current" className="font-mono text-xs text-text cursor-pointer select-none">
              I currently work in this role (sets end date to empty)
            </label>
          </div>

          <Textarea
            label="Role Responsibilities & Achievements"
            rows={4}
            required
            placeholder="Bullet points and summary of tech stack, architectural designs..."
            error={expForm.formState.errors.description?.message}
            {...expForm.register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Website URL"
              placeholder="https://..."
              error={expForm.formState.errors.company_url?.message}
              {...expForm.register('company_url')}
            />
            <Input
              label="Display Order"
              type="number"
              min={0}
              error={expForm.formState.errors.display_order?.message}
              {...expForm.register('display_order')}
            />
          </div>
        </form>
      </Modal>

      {/* Education Create/Edit Modal */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title={editingEdu ? 'Edit Education Credential' : 'New Education Credential'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEduModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createEduMutation.isPending || updateEduMutation.isPending}
              onClick={eduForm.handleSubmit(onSubmitEdu)}
            >
              Save Education
            </Button>
          </>
        }
      >
        <form onSubmit={eduForm.handleSubmit(onSubmitEdu)} className="space-y-4">
          <Input
            label="Institution / University"
            required
            placeholder="e.g., University of Dhaka / Stanford University"
            error={eduForm.formState.errors.institution?.message}
            {...eduForm.register('institution')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Degree"
              required
              placeholder="e.g., BSc, International A Levels, MSc"
              error={eduForm.formState.errors.degree?.message}
              {...eduForm.register('degree')}
            />

            <Input
              label="Field of Study"
              required
              placeholder="e.g., Computer Science and Engineering"
              error={eduForm.formState.errors.field_of_study?.message}
              {...eduForm.register('field_of_study')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Year"
              type="number"
              required
              placeholder="2018"
              error={eduForm.formState.errors.start_year?.message}
              {...eduForm.register('start_year')}
            />

            <Input
              label="End Year"
              type="number"
              placeholder="2022 (leave blank if ongoing)"
              error={eduForm.formState.errors.end_year?.message}
              {...eduForm.register('end_year')}
            />

            <Input
              label="Grade / GPA"
              placeholder="e.g. 3.9/4.0 or Distinction"
              error={eduForm.formState.errors.grade?.message}
              {...eduForm.register('grade')}
            />
          </div>

          <Textarea
            label="Description / Honors (Optional)"
            rows={3}
            placeholder="Notable coursework, honors, leadership positions..."
            error={eduForm.formState.errors.description?.message}
            {...eduForm.register('description')}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type}`}
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Confirm Delete"
        isLoading={deleteExpMutation.isPending || deleteEduMutation.isPending}
      />
    </div>
  );
}

export default DashboardExperiencePage;
