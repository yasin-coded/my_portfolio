import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Terminal, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { loginSchema, parseApiError } from '../utils/validators';
import PageContainer from '../components/layout/PageContainer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    // Client-side Zod validation
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        setError(field, { message: issue.message });
      });
      return;
    }

    try {
      const user = await login(data.username, data.password);
      toast.success(`Welcome back, ${user.username}`);
      navigate(from, { replace: true });
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setServerError(message);
      if (fieldErrors.username) setError('username', { message: fieldErrors.username });
      if (fieldErrors.password) setError('password', { message: fieldErrors.password });
      toast.error(message);
    }
  };

  return (
    <PageContainer className="flex-1 flex items-center justify-center py-20">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
            </div>
            <span className="font-mono text-xs text-text-muted ml-2">sudo auth_login</span>
          </div>
          <Terminal className="w-4 h-4 text-accent" />
        </div>

        {/* Login Body */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="font-mono text-xl font-bold text-text flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              <span>Owner Access</span>
            </h1>
            <p className="font-mono text-xs text-text-muted mt-1">
              // Enter administrative credentials to manage portfolio
            </p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/30 text-danger font-mono text-xs">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              id="username"
              placeholder="admin_username"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username', { required: 'Username is required' })}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              className="w-full mt-2"
            >
              $ authenticate
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
