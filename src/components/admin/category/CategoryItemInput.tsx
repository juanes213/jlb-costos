import { Input } from "@/components/ui/input";

interface CategoryItemInputProps {
  name: string;
  onChange: (value: string) => void;
}

export function CategoryItemInput({ name, onChange }: CategoryItemInputProps) {
  return (
    <Input
      value={name}
      onChange={(e) => onChange(e.target.value)}
      className="w-48 border-blue-200 focus:border-blue-400"
      placeholder="Nombre del item"
    />
  );
}