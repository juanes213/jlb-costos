
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface CategoryItemActionsProps {
  onDelete: () => void;
}

export function CategoryItemActions({ onDelete }: CategoryItemActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}
