"use client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PermissionCheckboxProps {
  id: string;
  label: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function PermissionCheckbox({
  id,
  label,
  description,
  checked,
  onChange,
}: PermissionCheckboxProps) {
  return (
    <Label
      htmlFor={id}
      className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3
                 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50
                 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange?.(!!value)}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600
                   data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700
                   dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">
          {label}
        </p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Label>
  );
}
