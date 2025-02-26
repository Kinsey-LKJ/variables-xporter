import { cn } from "@app/lib/utils";
import { ReactNode } from "react";
import Tag from "./tag";
import Blurer from "./blurer";

interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tag?: string;
  title?: string;
  description?: string;
}

const BentoItem = ({
  children,
  tag,
  title,
  description,
  ...props
}: BentoItemProps) => {
  return (
    <div
      {...props}
      className={cn(
        "bg-background h-[487px] p-6 flex flex-col justify-between items-center relative overflow-hidden",
        props.className
      )}
    >
      <div className="w-full">{tag && <Tag color="primary">{tag}</Tag>}</div>

      <div className="absolute top-0 left-0 w-full h-full z-[1]">
        {children}

        <div className="absolute bottom-0 left-0 w-full h-full bg-linear-to-t from-background to-background/0 pointer-events-none"></div>
      </div>

      <div className="grid gap-4 w-full z-[3]">
        <h3 className="text-title">{title}</h3>
        <p className="text-body text-muted-foreground">{description}</p>
      </div>
      <Blurer className="bottom-0 w-[100%] h-[177px] translate-y-[200%] blur-[160px] z-[2]" />
    </div>
  );
};

export default BentoItem;
