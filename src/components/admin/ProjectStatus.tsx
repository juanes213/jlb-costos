import { Circle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "@/types/project";

interface ProjectStatusProps {
  status: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

export function ProjectStatus({ status, onStatusChange }: ProjectStatusProps) {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "in-process":
        return "#42A5F5"; // Yellow
      case "on-hold":
        return "#FFC107"; // Blue
      case "paused":
        return "#F44336"; // Red
      case "completed":
        return "#81C784"; // Green
      default:
        return "#000000";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Circle
        className="w-4 h-4"
        fill={getStatusColor(status)}
        color={getStatusColor(status)}
      />
      <Select value={status} onValueChange={(value) => onStatusChange(value as ProjectStatus)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in-process">In Process</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
