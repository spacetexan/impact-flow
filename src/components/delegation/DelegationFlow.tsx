import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDelegation } from '@/context/DelegationContext';
import { nodeTypes, ManagerNodeData, TeamMemberNodeData, ProjectNodeData } from './CustomNodes';
import { Project } from '@/types/delegation';

interface DelegationFlowProps {
  onProjectClick: (project: Project) => void;
}

export function DelegationFlow({ onProjectClick }: DelegationFlowProps) {
  const { profiles, projects } = useDelegation();

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Manager node at center top
    nodes.push({
      id: 'manager',
      type: 'manager',
      position: { x: 400, y: 50 },
      data: { label: 'You' } as ManagerNodeData,
    });

    // Team member nodes
    const teamSpacing = 280;
    const teamStartX = 400 - ((profiles.length - 1) * teamSpacing) / 2;

    profiles.forEach((profile, index) => {
      const nodeId = `team-${profile.id}`;
      nodes.push({
        id: nodeId,
        type: 'teamMember',
        position: { x: teamStartX + index * teamSpacing, y: 180 },
        data: { label: profile.name, role: profile.role } as TeamMemberNodeData,
      });

      edges.push({
        id: `edge-manager-${profile.id}`,
        source: 'manager',
        target: nodeId,
        animated: false,
        style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      });

      // Project nodes for this team member
      const memberProjects = projects.filter((p) => p.profileId === profile.id);
      const projectSpacing = 140;
      const projectStartX =
        teamStartX + index * teamSpacing - ((memberProjects.length - 1) * projectSpacing) / 2;

      memberProjects.forEach((project, pIndex) => {
        const projectNodeId = `project-${project.id}`;
        nodes.push({
          id: projectNodeId,
          type: 'project',
          position: { x: projectStartX + pIndex * projectSpacing, y: 320 },
          data: {
            label: project.name,
            status: project.status,
            onClick: () => onProjectClick(project),
          } as ProjectNodeData,
        });

        edges.push({
          id: `edge-${profile.id}-${project.id}`,
          source: nodeId,
          target: projectNodeId,
          animated: project.status === 'in_progress',
          style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [profiles, projects, onProjectClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[calc(100vh-200px)] bg-background rounded-xl border border-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
        <Controls className="!bg-card !border-border !rounded-lg !shadow-md [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent" />
        <MiniMap
          className="!bg-card !border-border !rounded-lg"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
