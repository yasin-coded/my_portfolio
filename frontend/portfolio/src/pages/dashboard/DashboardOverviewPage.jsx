export function DashboardOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ sys_status --overview</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Aggregate metrics, views and recent activity will be mounted in Phase 9
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;
