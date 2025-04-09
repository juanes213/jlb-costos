
// This file is maintained for backward compatibility
// It re-exports the refactored ProjectContext components

import { ProjectProvider as InternalProjectProvider } from "./project/ProjectProvider";
import { useProjects as internalUseProjects } from "./project/useProjects";
import type { ProjectContextType } from "./project/types";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  return <InternalProjectProvider>{children}</InternalProjectProvider>;
}

export function useProjects() {
  return internalUseProjects();
}

export type { ProjectContextType };
