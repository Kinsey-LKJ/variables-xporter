import BentoItem from "@/components/bento-item";
import Blurer from "@/components/blurer";
import Illustration from "@/components/illustration";
import Tag from "@/components/tag";
import { Button } from "@/components/ui/button";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import Image from "next/image";
export const metadata = {};

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center max-w-[1200px]">
      <Blurer className="w-[736px] h-[137px] -translate-y-1/2 blur-[140px]" />
      <div className=" flex flex-col items-center justify-center top-36 absolute z-10">
        <div className=" flex flex-col gap-16 items-center">
          <div className=" flex flex-col gap-4 items-center">
            <Tag color="primary">支持 Tailwind CSS V4</Tag>
            <h1 className=" text-foreground text-display">Variables Xporter</h1>
            <p className=" text-body text-muted-foreground">
              让 Figma Variables 无缝集成到 Tailwind CSS 或 CSS Variables
            </p>
          </div>
          <div className=" flex gap-4">
            <Button>开始使用</Button>
            <Button variant="outline">了解更多</Button>
          </div>
        </div>
      </div>
      <Illustration className="mt-36" />
      <div className="w-full relative flex flex-col items-center">
        <Blurer className="w-full h-[137px] translate-y-full blur-[300px]" />
        <div className="relative z-10 border-1 border-border-subtlest w-full grid grid-cols-3 gap-px bg-border-subtlest ">
          <BentoItem
            tag="独家提供"
            title="多模式支持"
            description="支持导出复合的多维模式的变量"
            className=" col-span-2 "
          >
            <div className="flex flex-col h-full items-center *:absolute *:bottom-0">
              <Image
                src="/website/brand-modes.png"
                alt="brand-modes"
                width={706}
                height={333}
                className="w-[90%] scale-[0.85] -translate-y-[32%] shadow-[0_-3px_200px_rgba(255,255,255,0.13)]"
              />
              <Image
                src="/website/density-modes.png"
                alt="density-modes"
                width={706}
                height={333}
                className="w-[90%] scale-[0.9] -translate-y-[17%] shadow-[0_-32px_93px_-77px_var(--color-secondary)]"
              />
              <Image
                src="/website/device-modes.png"
                alt="device-modes"
                width={706}
                height={333}
                className="w-[90%] scale-[0.95] translate-y-[3%] shadow-[0_-32px_93px_-77px_var(--color-secondary)]"
              />
              <Image
                src="/website/theme-modes.png"
                alt="theme-modes"
                width={706}
                height={333}
                className="w-[90%] shadow-[0_-32px_93px_-77px_var(--color-secondary)]"
              />
            </div>
          </BentoItem>
          <BentoItem
            title="合并排版变量"
            description="将文字和排版相关变量合并导出"
            className=" col-span-1 "
          >
            <div></div>
          </BentoItem>
          <BentoItem
            title="单位转换"
            description="将 px 转为为 rem 单位"
            className=" col-span-1 "
          >
            <TextRevealCard
              className="w-full h-full bg-background flex items-center justify-center"
              text="font-size:16px"
              revealText="font-size:1rem"
            ></TextRevealCard>
          </BentoItem>
          <BentoItem
            tag="独家提供"
            title="CSS 媒体查询模式"
            description="导出响应式代码"
            className=" col-span-2 "
          >
            <div className="grid w-full h-full justify-center">
              <div className="w-fit h-fit self-end">
                <div className="w-[26.7%] right-[13%] bottom-[20.5%] aspect-[213/215] border-1  border-secondary absolute z-10 shadow-[0_0_300px_-33px_var(--color-secondary)]"></div>
                <Image
                  src="/website/css-media-query.png"
                  alt="css-media-query"
                  width={672}
                  height={356}
                />
              </div>
            </div>
          </BentoItem>
        </div>
      </div>
    </div>
  );
}
