
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function DashboardHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: DashboardHeaderProps) {
  return (
    <Card className="p-4">
      <CardContent className="p-2 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="text-sm font-medium mb-1 block">Buscar por nombre o ID</label>
            <Input
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label className="text-sm font-medium mb-1 block">Filtrar por estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="in-process">En Progreso</SelectItem>
                <SelectItem value="on-hold">En Espera</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
