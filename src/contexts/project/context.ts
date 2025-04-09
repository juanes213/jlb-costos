
import { createContext } from "react";
import { ProjectContextType } from "./types";

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
