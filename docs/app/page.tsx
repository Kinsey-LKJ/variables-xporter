import Blurer from "@/components/blurer";
import Illustration from "@/components/illustration";
import { Button } from "@/components/ui/button";

export const metadata = {};

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center">
      <Blurer className="w-[736px] h-[137px] -translate-y-1/2 blur-[200px]" />
      <div className=" flex flex-col items-center justify-center mt-24 relative z-10">
        <div className=" flex flex-col gap-16 items-center">
          <div className=" flex flex-col gap-4 items-center">
            <h1 className=" text-foreground text-display">Variables Xporter</h1>
            <p className=" text-body">
              让 Figma Variables 无缝集成到 Tailwind CSS 或 CSS Variables
            </p>
          </div>
          <div className=" flex gap-4">
            <Button>开始使用</Button>
            <Button variant="outline">了解更多</Button>
          </div>
        </div>
      </div>
      <Illustration className="absolute top-54" />
    </div>
  );
}
