import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  User,
  LockKeyhole,
  Save,
  Plus,
  X,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import ImageUploader from '../../components/dashboard/ImageUploader';
import Skeleton from '../../components/ui/Skeleton';
import { handleServerFormErrors } from '../../utils/formErrors';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150),
  headline: z.string().min(1, 'Headline is required').max(255),
  bio: z.string().min(1, 'Bio is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(50),
  location: z.string().min(1, 'Location is required').max(150),
  logo_text: z.string().min(1, 'Logo text is required').max(50),
  hero_pitch: z.string().max(255).optional(),
  years_of_experience: z.coerce.number().min(0).default(0),
  is_available_for_hire: z.boolean().default(true),
  github_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  linkedin_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  x_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  website_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters long'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New passwords do not match.',
    path: ['confirm_password'],
  });

export function DashboardProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Avatar and resume files
  const [avatarFile, setAvatarFile] = useState(null);
  const [initialAvatarUrl, setInitialAvatarUrl] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [initialResumeUrl, setInitialResumeUrl] = useState(null);
  const [resumeError, setResumeError] = useState(null);

  // Dynamic typed_roles list
  const [typedRoles, setTypedRoles] = useState([]);
  const [newRoleInput, setNewRoleInput] = useState('');

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    setError: setProfileError,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      full_name: '',
      headline: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      logo_text: 'yasin',
      hero_pitch: '',
      years_of_experience: 0,
      is_available_for_hire: true,
      github_url: '',
      linkedin_url: '',
      x_url: '',
      website_url: '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  // Pre-fill profile form when data loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        logo_text: profile.logo_text || 'yasin',
        hero_pitch: profile.hero_pitch || '',
        years_of_experience: profile.years_of_experience ?? 0,
        is_available_for_hire: profile.is_available_for_hire ?? true,
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        x_url: profile.x_url || '',
        website_url: profile.website_url || '',
      });

      if (profile.avatar) setInitialAvatarUrl(profile.avatar);
      if (profile.resume) setInitialResumeUrl(profile.resume);

      if (Array.isArray(profile.typed_roles)) {
        setTypedRoles(profile.typed_roles);
      }
    }
  }, [profile, resetProfile]);

  // Typed roles handlers
  const handleAddRole = (e) => {
    e?.preventDefault();
    const trimmed = newRoleInput.trim();
    if (trimmed && !typedRoles.includes(trimmed)) {
      setTypedRoles([...typedRoles, trimmed]);
      setNewRoleInput('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setTypedRoles(typedRoles.filter((r) => r !== roleToRemove));
  };

  // Resume upload validation (.pdf, max 5 MB per SPEC B-21)
  const handleResumeChange = (e) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Resume must be a PDF document (.pdf).');
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      setResumeError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`);
      return;
    }

    setResumeFile(file);
  };

  // Profile submission
  const onSubmitProfile = async (values) => {
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        setProfileError(field, { type: 'manual', message: issue.message });
      });
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, typeof val === 'boolean' ? String(val) : val);
      }
    });

    // Append JSON list of typed roles
    formData.append('typed_roles', JSON.stringify(typedRoles));

    if (avatarFile instanceof File) {
      formData.append('avatar', avatarFile);
    }

    if (resumeFile instanceof File) {
      formData.append('resume', resumeFile);
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success('Profile details updated successfully.');
    } catch (err) {
      handleServerFormErrors(err, setProfileError, 'Failed to update profile.');
    }
  };

  // Change password submission
  const onSubmitPassword = async (values) => {
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        setPasswordError(field, { type: 'manual', message: issue.message });
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      toast.success('Password changed successfully.');
      resetPassword();
    } catch (err) {
      handleServerFormErrors(err, setPasswordError, 'Failed to change password.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Card className="border-border/80 bg-surface/90">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-mono text-xl font-bold text-text">$ edit_profile</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          // Master biography, personal branding, resume, social accounts, and credential security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2 text-accent font-mono text-sm border-b border-border/80 pb-3">
                <User className="w-4 h-4" />
                <span className="font-bold">Profile Identity & Branding</span>
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="e.g., Jane Doe"
                    error={profileErrors.full_name?.message}
                    {...registerProfile('full_name')}
                  />
                  <Input
                    label="Navbar Logo Text"
                    required
                    placeholder="e.g., yasin or jdoe"
                    helperText="Controls logo branding in navbar and footer"
                    error={profileErrors.logo_text?.message}
                    {...registerProfile('logo_text')}
                  />
                </div>

                <Input
                  label="Headline"
                  required
                  placeholder="e.g., Full Stack Engineer & Cloud Systems Architect"
                  error={profileErrors.headline?.message}
                  {...registerProfile('headline')}
                />

                <Input
                  label="Hero 1-2 Line Pitch"
                  placeholder="e.g., I build high-concurrency microservices and resilient user interfaces."
                  error={profileErrors.hero_pitch?.message}
                  {...registerProfile('hero_pitch')}
                />

                {/* Typed Roles Dynamic List */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-medium text-text-muted block">
                    Hero Typing Roles (Animated in Hero)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRole();
                        }
                      }}
                      placeholder="e.g., Cloud Architect"
                      className="flex-1 bg-surface-2 border border-border rounded-md px-3.5 py-1.5 font-mono text-xs text-text outline-none focus:border-accent"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddRole}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {typedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded bg-surface-2 border border-border text-text"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="text-text-muted hover:text-danger cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Full Biography (Bio)"
                  rows={4}
                  required
                  placeholder="3-5 paragraphs describing your journey, technical philosophy, and experience..."
                  error={profileErrors.bio?.message}
                  {...registerProfile('bio')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    error={profileErrors.email?.message}
                    {...registerProfile('email')}
                  />
                  <Input
                    label="Phone"
                    required
                    error={profileErrors.phone?.message}
                    {...registerProfile('phone')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    required
                    placeholder="e.g., Dhaka, Bangladesh"
                    error={profileErrors.location?.message}
                    {...registerProfile('location')}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min={0}
                    error={profileErrors.years_of_experience?.message}
                    {...registerProfile('years_of_experience')}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hire_available"
                    className="rounded border-border bg-surface-2 text-accent focus:ring-accent"
                    {...registerProfile('is_available_for_hire')}
                  />
                  <label htmlFor="hire_available" className="font-mono text-xs text-text select-none cursor-pointer">
                    Available for hire / taking new clients
                  </label>
                </div>

                {/* Social Links */}
                <div className="pt-3 border-t border-border/80 space-y-3">
                  <p className="font-mono text-xs font-semibold text-text">Social Profiles & Links</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="GitHub URL"
                      placeholder="https://github.com/..."
                      error={profileErrors.github_url?.message}
                      {...registerProfile('github_url')}
                    />
                    <Input
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/in/..."
                      error={profileErrors.linkedin_url?.message}
                      {...registerProfile('linkedin_url')}
                    />
                    <Input
                      label="X (Twitter) URL"
                      placeholder="https://x.com/..."
                      error={profileErrors.x_url?.message}
                      {...registerProfile('x_url')}
                    />
                    <Input
                      label="Personal Website URL"
                      placeholder="https://..."
                      error={profileErrors.website_url?.message}
                      {...registerProfile('website_url')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="w-full sm:w-auto font-mono text-xs"
                >
                  Save Profile Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Avatar, Resume & Password Security */}
        <div className="space-y-6">
          {/* Avatar Upload Card */}
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-accent font-mono text-xs font-semibold uppercase">
                <User className="w-3.5 h-3.5" />
                <span>Profile Avatar</span>
              </div>
              <ImageUploader
                label="Portrait Avatar"
                value={avatarFile || initialAvatarUrl}
                previewClassName="aspect-square max-w-[220px] mx-auto rounded-full overflow-hidden"
                helperText="JPG, PNG or WebP under 2 MB"
                onChange={(file) => {
                  setAvatarFile(file);
                  if (!file) setInitialAvatarUrl(null);
                }}
              />
            </CardContent>
          </Card>

          {/* Resume Upload Card */}
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent font-mono text-xs font-semibold uppercase">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Document</span>
                </div>
                {initialResumeUrl && (
                  <a
                    href={initialResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-mono text-[10px] text-accent hover:underline"
                  >
                    View Current <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs font-medium text-text-muted block">
                  Upload PDF (max 5 MB)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="block w-full text-xs font-mono text-text file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-surface-2 file:text-text hover:file:bg-surface-2/80 cursor-pointer"
                  />
                </div>

                {resumeFile && (
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-2/80 border border-border/60 font-mono text-xs text-text">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="truncate">{resumeFile.name}</span>
                    <span className="text-[10px] text-text-muted">
                      ({(resumeFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                )}

                {resumeError && (
                  <p className="font-mono text-xs text-danger mt-1">{resumeError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-border/80 bg-surface/90">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-accent font-mono text-xs font-semibold uppercase border-b border-border/80 pb-3">
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </div>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-3.5">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  error={passwordErrors.old_password?.message}
                  {...registerPassword('old_password')}
                />

                <Input
                  label="New Password"
                  type="password"
                  required
                  helperText="Minimum 8 characters"
                  error={passwordErrors.new_password?.message}
                  {...registerPassword('new_password')}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  error={passwordErrors.confirm_password?.message}
                  {...registerPassword('confirm_password')}
                />

                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  loading={changePasswordMutation.isPending}
                  disabled={changePasswordMutation.isPending}
                  className="w-full justify-center font-mono text-xs mt-2"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfilePage;
