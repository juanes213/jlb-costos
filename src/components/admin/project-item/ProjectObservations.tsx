
interface ProjectObservationsProps {
  observations: string;
}

export function ProjectObservations({ observations }: ProjectObservationsProps) {
  if (!observations) return null;

  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-md">
      <h4 className="text-sm font-medium mb-1">Observaciones:</h4>
      <p className="text-sm text-gray-600">{observations}</p>
    </div>
  );
}
