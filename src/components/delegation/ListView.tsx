import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User } from 'lucide-react';
import { Project, STATUS_LABELS, STATUS_COLORS } from '@/types/delegation';
import { useDelegation } from '@/context/DelegationContext';

interface ListViewProps {
  onProjectClick: (project: Project) => void;
}

export function ListView({ onProjectClick }: ListViewProps) {
  const { projects, profiles, getProjectCriteria } = useDelegation();

  const getProgress = (projectId: string) => {
    const criteria = getProjectCriteria(projectId);
    if (criteria.length === 0) return 0;
    const completed = criteria.filter((c) => c.isComplete).length;
    return Math.round((completed / criteria.length) * 100);
  };

  const getAssignee = (profileId: string) => {
    return profiles.find((p) => p.id === profileId);
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const statusOrder = { blocked: 0, in_progress: 1, planned: 2, complete: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedProjects.map((project) => {
        const assignee = getAssignee(project.profileId);
        const progress = getProgress(project.id);

        return (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4"
            style={{ borderLeftColor: STATUS_COLORS[project.status] }}
            onClick={() => onProjectClick(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {project.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs"
                  style={{ borderColor: STATUS_COLORS[project.status], color: STATUS_COLORS[project.status] }}
                >
                  {STATUS_LABELS[project.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.purpose || 'No purpose defined yet.'}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{assignee?.name || 'Unassigned'}</span>
                </div>
                {project.dueDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {projects.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <p>No delegations yet. Click "Add Delegation" to get started.</p>
        </div>
      )}
    </div>
  );
}
