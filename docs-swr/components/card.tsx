import { cn } from "@/lib/utils";
import Blurer from "./blurer";
import { cva, VariantProps } from "class-variance-authority";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const cardVariants = cva("", {
  variants: {
    color: {
      pink: "text-pink-400",
      blue: "text-blue-400",
      green: "text-green-400",
      yellow: "text-yellow-400",
      orange: "text-orange-400",
      red: "text-red-400",
      purple: "text-purple-400",
      gray: "text-gray-400",
      cyan: "text-cyan-400",
      fuchsia: "text-fuchsia-400",
    },
  },
});

const Card = ({
  color,
  title,
  description,
  icon,
  ...props
}: CardProps & VariantProps<typeof cardVariants>) => {
  return (
    <div
      {...props}
      className={cn(
        `${cardVariants({ color })} grid gap-32 bg-background overflow-hidden relative py-7 px-5`,
        props.className
      )}
    >
      <div className="text-current">{icon}</div>

      <Blurer
        className={`bg-current/5 w-full aspect-square right-0 top-0 -translate-x-1/2 -translate-y-1/2`}
      />
      <div className="grid gap-4">
        <h3 className="text-title text-foreground">{title}</h3>
        <p className="text-body text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default Card;
