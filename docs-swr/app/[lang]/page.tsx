import BentoItem from "@/components/bento-item";
import Blurer from "@/components/blurer";
import Card from "@/components/card";
import Illustration from "@/components/illustration";
import Tag from "@/components/tag";
import { Button } from "@/components/ui/button";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import Image from "next/image";
import { BookOpen, Box, Columns3, Palette, Ruler, Type } from "lucide-react";
import BrandModes from "@/public/website/brand-modes.png";
import DensityModes from "@/public/website/density-modes.png";
import DeviceModes from "@/public/website/device-modes.png";
import ThemeModes from "@/public/website/theme-modes.png";
import CssMediaQuery from "@/public/website/css-media-query.png";
import FigmaTemplate from "@/public/website/figma-template.png";


export const metadata = {};

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center max-w-[1200px] relative">
      <Blurer className="w-[736px] h-[137px] -translate-y-1/2 blur-[140px]" />
      <div className=" flex flex-col items-center justify-center top-24 absolute z-10">
        <div className=" flex flex-col gap-12 items-center">
          <div className=" flex flex-col gap-4 items-center">
            <Tag color="primary">支持 Tailwind CSS V4</Tag>
            <h1 className=" text-foreground text-display special-text">
              Variables Xporter
            </h1>
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
      <Illustration className="mt-40" />
      <div className="w-full border-1 border-border-subtlest bg-border-subtlest relative grid gap-px">
        <Blurer className="w-full h-[137px] translate-y-full blur-[300px]" />
        <div className="relative z-10  w-full grid grid-cols-3 gap-px bg-border-subtlest ">
          <BentoItem
            tag="独家提供"
            title="多模式支持"
            description="支持导出复合的多维模式的变量"
            className=" col-span-2 "
          >
            <div className="flex flex-col h-full items-center *:absolute *:bottom-0">
              <Image
                src={BrandModes}
                alt="brand-modes"
                className="w-[90%] scale-[0.85] -translate-y-[32%] shadow-[0_-3px_200px_rgba(255,255,255,0.13)]"
              />
              <Image
                src={DensityModes}
                alt="density-modes"
                className="w-[90%] scale-[0.9] -translate-y-[17%] shadow-[0_-32px_93px_-77px_var(--color-secondary)]"
              />
              <Image
                src={DeviceModes}
                alt="device-modes"
                className="w-[90%] scale-[0.95] translate-y-[3%] shadow-[0_-32px_93px_-77px_var(--color-secondary)]"
              />
              <Image
                src={ThemeModes}
                alt="theme-modes"
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
              className="w-full h-full bg-background flex items-center justify-center rounded-none border-none"
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
                  src={CssMediaQuery}
                  alt="css-media-query"
                  width={672}
                  height={356}
                />
              </div>
            </div>
          </BentoItem>
        </div>
        <div className="h-6 bg-background"></div>

        <div className="w-full  grid gap-px bg-border-subtlest">
          <div className="bg-background text-heading text-foreground p-10">
            Figma 变量组织建议
          </div>

          <div className="relative z-10  w-full grid grid-cols-3 gap-px bg-border-subtlest ">
            <Card
              color="pink"
              title="基本原则"
              description="变量的命名与分组"
              icon={<BookOpen absoluteStrokeWidth={true} size={54} />}
            />
            <Card
              color="purple"
              title="颜色系统"
              description="颜色变量的组织建议"
              icon={<Palette absoluteStrokeWidth={true} size={54} />}
            />

            <Card
              color="blue"
              title="排版系统"
              description="排版变量的组织建议"
              icon={<Type absoluteStrokeWidth={true} size={54} />}
            />

            <Card
              color="green"
              title="间距系统"
              description="间距变量的组织建议"
              icon={<Ruler absoluteStrokeWidth={true} size={54} />}
            />

            <Card
              color="orange"
              title="其他变量"
              description="其他变量的组织建议"
              icon={<Box absoluteStrokeWidth={true} size={54} />}
            />

            <Card
              color="cyan"
              title="多模式变量"
              description="构建多维变量系统"
              icon={<Columns3 absoluteStrokeWidth={true} size={54} />}
            />
          </div>
        </div>

        <div className="h-6 bg-background"></div>

        <div className="w-full  grid gap-px bg-border-subtlest">
          <div className="bg-background text-heading text-foreground p-10">
            Figma 模板
          </div>

          <div className="relative z-10  w-full grid  bg-background p-10 overflow-hidden">
            <div className="grid gap-6 max-w-112">
              <div className="text-heading text-primary">
                包含构建 Design Tokens <br /> 所需的基础变量
              </div>
              <div className="text-body text-muted-foreground">
                从这里开始构建属于你的 Design Tokens，包含
                Colors、Spacing、Font、等变量，并且具有 Theme、Brand、Device
                Modes、Density Modes 多个模式。
              </div>
              <Button className="w-fit">在Figna里打开</Button>
            </div>

            <div className="absolute -right-[5%] -bottom-[30%]">
              <Image
                className="border-1  border-secondary  shadow-[0_0_300px_-33px_var(--color-secondary)]"
                src={FigmaTemplate}
                alt="figma-template"
                width={672}
                height={316}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
