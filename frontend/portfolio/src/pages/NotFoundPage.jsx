import { Link, useLocation } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <PageContainer className="flex-1 flex items-center justify-center py-24">
      <div className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
            </div>
            <span className="font-mono text-xs text-text-muted ml-2">bash - 404 Not Found</span>
          </div>
        </div>

        {/* Terminal Body (SPEC §9.4) */}
        <div className="p-6 font-mono text-sm flex flex-col gap-3">
          <p className="text-text">
            <span className="text-accent">visitor@devfolio</span>:<span className="text-warning">~</span>$ cd {location.pathname}
          </p>
          <p className="text-danger">
            bash: {location.pathname}: command or path not found
          </p>
          <p className="text-text-muted text-xs mt-2">
            // Error 404: The requested resource does not exist in the filesystem.
          </p>

          <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
            <Link to="/">
              <Button variant="primary" size="sm">
                $ cd /home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default NotFoundPage;
