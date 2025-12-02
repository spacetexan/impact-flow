import { Handle, Position } from '@xyflow/react';
import { User, Briefcase } from 'lucide-react';
import { STATUS_COLORS, ProjectStatus } from '@/types/delegation';

export interface ManagerNodeData extends Record<string, unknown> {
  label: string;
}

export interface TeamMemberNodeData extends Record<string, unknown> {
  label: string;
  role: string;
}

export interface ProjectNodeData extends Record<string, unknown> {
  label: string;
  status: ProjectStatus;
  onClick: () => void;
}

export function ManagerNode({ data }: { data: ManagerNodeData }) {
  return (
    <div className="px-6 py-4 bg-primary text-primary-foreground rounded-xl shadow-lg border-2 border-primary/20 min-w-[140px]">
      <Handle type="source" position={Position.Bottom} className="!bg-primary-foreground !w-3 !h-3" />
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-foreground/20 rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">{data.label}</p>
          <p className="text-xs opacity-80">Manager</p>
        </div>
      </div>
    </div>
  );
}

export function TeamMemberNode({ data }: { data: TeamMemberNodeData }) {
  return (
    <div className="px-5 py-3 bg-card text-card-foreground rounded-xl shadow-md border border-border min-w-[130px] hover:shadow-lg transition-shadow">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2.5 !h-2.5" />
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent rounded-lg">
          <User className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.role}</p>
        </div>
      </div>
    </div>
  );
}

export function ProjectNode({ data }: { data: ProjectNodeData }) {
  const statusColor = STATUS_COLORS[data.status];
  
  return (
    <div
      onClick={data.onClick}
      className="px-4 py-2.5 bg-card text-card-foreground rounded-lg shadow-sm border border-border min-w-[120px] cursor-pointer hover:shadow-md transition-all hover:scale-105"
      style={{ borderLeftWidth: '4px', borderLeftColor: statusColor }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="font-medium text-xs truncate max-w-[100px]">{data.label}</p>
      </div>
    </div>
  );
}

export const nodeTypes = {
  manager: ManagerNode,
  teamMember: TeamMemberNode,
  project: ProjectNode,
};
