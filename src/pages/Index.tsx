import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutGrid, Network } from 'lucide-react';
import { DelegationProvider, useDelegation } from '@/context/DelegationContext';
import { DelegationFlow } from '@/components/delegation/DelegationFlow';
import { ListView } from '@/components/delegation/ListView';
import { ProjectSheet } from '@/components/delegation/ProjectSheet';
import { AddDelegationWizard } from '@/components/delegation/AddDelegationWizard';
import { Project, STATUS_LABELS } from '@/types/delegation';

function DashboardContent() {
  const { projects } = useDelegation();
  const [view, setView] = useState<'flow' | 'list'>('flow');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddDelegation, setShowAddDelegation] = useState(false);

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    blocked: projects.filter((p) => p.status === 'blocked').length,
    complete: projects.filter((p) => p.status === 'complete').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="py-1.5 px-3">
              <span className="text-muted-foreground mr-1.5">Total:</span>
              <span className="font-semibold">{stats.total}</span>
            </Badge>
            <Badge variant="outline" className="py-1.5 px-3 border-primary/50">
              <span className="text-muted-foreground mr-1.5">{STATUS_LABELS.in_progress}:</span>
              <span className="font-semibold text-primary">{stats.inProgress}</span>
            </Badge>
            <Badge variant="outline" className="py-1.5 px-3 border-destructive/50">
              <span className="text-muted-foreground mr-1.5">{STATUS_LABELS.blocked}:</span>
              <span className="font-semibold text-destructive">{stats.blocked}</span>
            </Badge>
            <Badge variant="outline" className="py-1.5 px-3 border-chart-2/50">
              <span className="text-muted-foreground mr-1.5">{STATUS_LABELS.complete}:</span>
              <span className="font-semibold" style={{ color: 'hsl(var(--chart-2))' }}>{stats.complete}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setShowAddDelegation(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Delegation
            </Button>
            
            <Tabs value={view} onValueChange={(v) => setView(v as 'flow' | 'list')}>
              <TabsList>
                <TabsTrigger value="flow" className="gap-2">
                  <Network className="w-4 h-4" />
                  Mind Map
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  List View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* View Content */}
        {view === 'flow' ? (
          <DelegationFlow onProjectClick={setSelectedProject} />
        ) : (
          <ListView onProjectClick={setSelectedProject} />
        )}
      </main>

      {/* Modals */}
      <ProjectSheet
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <AddDelegationWizard
        open={showAddDelegation}
        onClose={() => setShowAddDelegation(false)}
      />
    </div>
  );
}

const Index = () => {
  return (
    <DelegationProvider>
      <DashboardContent />
    </DelegationProvider>
  );
};

export default Index;
