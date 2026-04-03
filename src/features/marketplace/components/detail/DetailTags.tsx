import { Tag } from "lucide-react";

interface Props { tags: string[] }

export default function DetailTags({ tags }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 text-[10px] font-mono bg-surface-2 text-muted-foreground px-2 py-0.5 rounded-md">
          <Tag className="w-2.5 h-2.5" />{t}
        </span>
      ))}
    </div>
  );
}
