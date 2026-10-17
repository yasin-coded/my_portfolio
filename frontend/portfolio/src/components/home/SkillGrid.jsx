import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Skeleton from '../ui/Skeleton';

export function SkillGrid() {
  const { data: skillGroups = [], isLoading } = useQuery({
    queryKey: ['skill-groups'],
    queryFn: async () => {
      const res = await api.get('/skill-groups/');
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-5 rounded-lg border border-border bg-surface flex flex-col gap-4"
          >
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-6 mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (skillGroups.length === 0) {
    return (
      <div className="p-8 rounded-lg bg-surface border border-border text-center font-mono text-sm text-text-muted">
        // no skill groups configured yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {skillGroups.map((group) => {
        // Compute filename: "# " + title in lowercase with spaces as underscores + ".py"
        const fileName = `# ${group.title.toLowerCase().trim().replace(/\s+/g, '_')}.py`;

        // Filter sections that have at least one skill
        const activeSections = (group.sections || []).filter(
          (sec) => sec.skills && sec.skills.length > 0
        );

        // Calculate total skills in this group
        const totalSkills = activeSections.reduce(
          (sum, sec) => sum + (sec.skills ? sec.skills.length : 0),
          0
        );

        // If a group has only one section, don't print a section comment line
        const showSectionTitles = activeSections.length > 1;

        return (
          <div
            key={group.id}
            className="h-full rounded-lg border border-border bg-surface p-5 flex flex-col justify-between font-mono text-xs sm:text-sm shadow-sm transition-colors duration-150"
          >
            {/* Top header lines */}
            <div className="flex flex-col gap-4">
              <div>
                {/* Header comment line */}
                <p className="text-text-muted select-none">{fileName}</p>
                {/* Dictionary key opener */}
                <p className="text-text font-bold mt-1">
                  <span className="text-accent">&quot;{group.title}&quot;</span>
                  <span className="text-text-muted">: [</span>
                </p>
              </div>

              {/* Inside content */}
              <div className="pl-4 sm:pl-5 flex flex-col gap-4">
                {totalSkills === 0 ? (
                  <p className="text-text-muted italic select-none py-2">
                    // no skills yet
                  </p>
                ) : (
                  activeSections.map((sec) => (
                    <div key={sec.id} className="flex flex-col gap-2">
                      {/* Section comment line (hidden if only one section in group) */}
                      {showSectionTitles && sec.title && (
                        <p className="text-text-muted text-xs select-none">
                          // {sec.title.toLowerCase()}
                        </p>
                      )}

                      {/* Chips in flex-wrap row */}
                      <div className="flex flex-wrap gap-2">
                        {sec.skills.map((skill) => (
                          <div
                            key={skill.id}
                            title={`${skill.name}, ${skill.proficiency}%`}
                            aria-label={`${skill.name}, ${skill.proficiency}%`}
                            className="group relative inline-flex items-center px-2.5 py-1.5 rounded bg-surface-2 border border-accent/50 hover:border-accent-hover transition-colors duration-150 overflow-hidden cursor-default select-none pb-2"
                          >
                            <span className="font-mono text-xs text-text group-hover:text-accent-hover transition-colors duration-150">
                              &quot;{skill.name}&quot;
                            </span>

                            {/* 2px proficiency bar along bottom edge */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-border overflow-hidden"
                              aria-hidden="true"
                            >
                              <div
                                className="h-full bg-accent group-hover:bg-accent-hover transition-[width] duration-200 ease-out motion-reduce:transition-none"
                                style={{
                                  width: `${Math.min(100, Math.max(0, skill.proficiency))}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Closing bracket */}
            <p className="text-text-muted font-bold mt-4 select-none">]</p>
          </div>
        );
      })}
    </div>
  );
}

export default SkillGrid;
