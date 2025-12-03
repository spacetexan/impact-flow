import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar, Target, Lightbulb, Trophy, CheckCircle } from 'lucide-react';
import { Project, ProjectStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/delegation';
import { useDelegation } from '@/context/DelegationContext';

interface ProjectSheetProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectSheet({ project: initialProject, open, onClose }: ProjectSheetProps) {
  const { updateProject, deleteProject, getProjectCriteria, addSuccessCriteria, updateSuccessCriteria, deleteSuccessCriteria, profiles, projects } = useDelegation();
  const [newCriteria, setNewCriteria] = useState('');

  // Get the current project from context to ensure we have the latest data
  const project = initialProject ? projects.find(p => p.id === initialProject.id) ?? initialProject : null;

  // Local state for text fields to prevent cursor jumping
  const [localPurpose, setLocalPurpose] = useState(project?.purpose ?? '');
  const [localImportance, setLocalImportance] = useState(project?.importance ?? '');
  const [localIdealOutcome, setLocalIdealOutcome] = useState(project?.idealOutcome ?? '');
  const [localComments, setLocalComments] = useState(project?.comments ?? '');

  // Sync local state when project changes (e.g., when opening a different project)
  useEffect(() => {
    if (project) {
      setLocalPurpose(project.purpose);
      setLocalImportance(project.importance);
      setLocalIdealOutcome(project.idealOutcome);
      setLocalComments(project.comments);
    }
  }, [project?.id]);

  if (!project) return null;

  const criteria = getProjectCriteria(project.id);
  const assignee = profiles.find((p) => p.id === project.profileId);
  const completedCriteria = criteria.filter((c) => c.isComplete).length;
  const progress = criteria.length > 0 ? Math.round((completedCriteria / criteria.length) * 100) : 0;

  const handleStatusChange = (status: ProjectStatus) => {
    updateProject(project.id, { status });
  };

  const handleAddCriteria = () => {
    if (newCriteria.trim()) {
      addSuccessCriteria({ projectId: project.id, description: newCriteria.trim(), isComplete: false });
      setNewCriteria('');
    }
  };

  const handleToggleCriteria = (id: string, isComplete: boolean) => {
    updateSuccessCriteria(id, { isComplete: !isComplete });
  };

  const handleDelete = () => {
    deleteProject(project.id);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-xl font-semibold">{project.name}</SheetTitle>
            <Badge
              variant="outline"
              style={{ borderColor: STATUS_COLORS[project.status], color: STATUS_COLORS[project.status] }}
            >
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
          {/* Using div instead of SheetDescription to allow Badge (div) nesting */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Assigned to</span>
            <Badge variant="secondary">{assignee?.name || 'Unassigned'}</Badge>
            {project.dueDate && (
              <>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </>
            )}
          </div>
          {/* Hidden SheetDescription for accessibility (required by Radix Dialog) */}
          <SheetDescription className="sr-only">
            Project details for {project.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Impact Filter Sections */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-primary" />
                The "Why" (Purpose)
              </Label>
              <Textarea
                value={localPurpose}
                onChange={(e) => setLocalPurpose(e.target.value)}
                onBlur={() => updateProject(project.id, { purpose: localPurpose })}
                placeholder="What do we want to accomplish?"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-chart-4" />
                The Importance
              </Label>
              <Textarea
                value={localImportance}
                onChange={(e) => setLocalImportance(e.target.value)}
                onBlur={() => updateProject(project.id, { importance: localImportance })}
                placeholder="What is the biggest difference this will make?"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="w-4 h-4 text-chart-1" />
                The Ideal Outcome
              </Label>
              <Textarea
                value={localIdealOutcome}
                onChange={(e) => setLocalIdealOutcome(e.target.value)}
                onBlur={() => updateProject(project.id, { idealOutcome: localIdealOutcome })}
                placeholder="What does the completed project look like?"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Success Criteria */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-chart-2" />
              Success Criteria ({completedCriteria}/{criteria.length})
            </Label>
            <div className="space-y-2">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
                >
                  <Checkbox
                    checked={c.isComplete}
                    onCheckedChange={() => handleToggleCriteria(c.id, c.isComplete)}
                  />
                  <span className={`flex-1 text-sm ${c.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                    {c.description}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSuccessCriteria(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="Add a success criterion..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddCriteria()}
              />
              <Button variant="outline" size="icon" onClick={handleAddCriteria}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Status & Comments */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={project.status} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Comments / Updates</Label>
              <Textarea
                value={localComments}
                onChange={(e) => setLocalComments(e.target.value)}
                onBlur={() => updateProject(project.id, { comments: localComments })}
                placeholder="Add notes or updates..."
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
