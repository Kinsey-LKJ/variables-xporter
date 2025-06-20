import { cn } from "@app/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const tagVariants = cva("w-fit text-sm border-1 bg-muted shadow-[0_0_4px_rgba(255,255,255,0.49)] inset-shadow-[0_0_6px_-2px_rgba(255,255,255,1)] px-3 py-0.5 rounded-full", {
  variants: {
    color: {
      primary: "border-tag-primary-border text-tag-primary-foreground shadow-[0_0_24px_var(--color-primary)]",
      red: "border-tag-red-border text-tag-red-foreground",
      green: "border-tag-green-border text-tag-green-foreground",
      purple: "border-tag-purple-border text-tag-purple-foreground",
      fuchsia: "border-tag-fuchsia-border text-tag-fuchsia-foreground",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});
const Tag = ({
  color,
  children,
  className,
}: React.ComponentProps<"button"> & VariantProps<typeof tagVariants>) => {
  return <div className={cn(tagVariants({ color }), className)}>{children}</div>;
};

export default Tag;
