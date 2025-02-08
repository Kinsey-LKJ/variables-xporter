import { cn } from "@/lib/utils";

interface BlurerProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

const Blurer = ({ className, ...props }: BlurerProps) => {
  return <div className={cn("absolute bg-primary rounded-[50%] blur-3xl z-[9] pointer-events-none", className)} {...props}></div>;
};

export default Blurer;
