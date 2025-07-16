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
import ShadcnUi from "@/public/website/shadcn-ui.png";
import Blur1 from "@/public/website/blur-1.png";
import Blur2 from "@/public/website/blur-2.png";
import { getDictionary } from "../_dictionaries/get-dictionary";
import { Locale } from "../_dictionaries/i18n-config";
import Link from "next/link";
import { MagicCard } from "@/components/magicui/magic-card";

export const metadata = {};

export default async function IndexPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <div className="flex flex-col items-center max-w-[1200px] relative">
        {/* <Blurer className="w-[736px] h-[137px] -translate-y-1/2 blur-[140px]" /> */}
        <Image
          src={Blur1}
          alt="background"
          className="absolute w-[150%] max-w-[150%]  -translate-y-[60%]"
        />
        <div className=" flex flex-col items-center justify-center top-24 absolute z-10">
          <div className=" flex flex-col gap-12 items-center">
            <div className=" flex flex-col gap-4 items-center">
              <Tag color="primary">{dictionary.supportTailwindCssV4}</Tag>
              <h1 className=" text-foreground text-display special-text">
                Variables Xporter
              </h1>
              <p className=" text-body text-muted-foreground text-center max-w-[800px]">
                {dictionary.pluginHighlight}
              </p>
            </div>
            <div className=" flex gap-4">
              <Button asChild className=" shadow-[0px_2px_20px_10px_var(--color-muted)]">
                <Link href="/docs">{dictionary.start}</Link>
              </Button>
              {/* <Button variant="outline"><Link href="/docs">{dictionary.learnMore}</Link></Button> */}
            </div>
          </div>
        </div>
        <Illustration className="mt-40" />
        <div className="w-full border-1 border-border bg-border relative grid gap-px ">
          {/* <Blurer className="w-full h-[137px] translate-y-full blur-[300px]" /> */}
          <Image
            src={Blur2}
            alt="background"
            className="absolute w-[180%] max-w-[180%] translate-y-[-30%] justify-self-center"
          />
          <div className="relative z-10  w-full grid grid-cols-3 gap-px bg-border ">
            <BentoItem
              tag={dictionary.exclusive}
              title={dictionary.features.shadcnUi.title}
              description={dictionary.features.shadcnUi.description}
              className=" col-span-full "
            >
              <Image
                src={ShadcnUi}
                alt="shadcn-ui"
                className="w-full h-full shadow-[0_-3px_200px_rgba(255,255,255,0.13)]"
              />
            </BentoItem>
            <BentoItem
              tag={dictionary.exclusive}
              title={dictionary.features.multiMode.title}
              description={dictionary.features.multiMode.description}
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
              title={dictionary.features.mergeTypographyStyles.title}
              description={
                dictionary.features.mergeTypographyStyles.description
              }
              className=" col-span-1 "
            >
              <div className=" w-full h-full flex flex-col justify-center items-center [mask:linear-gradient(90deg,transparent,black_40%_60%,transparent)]">
                <Tag
                  className=" absolute translate-x-16 -translate-y-30"
                  color="red"
                >
                  font-size/title/DEFAULT
                </Tag>
                <Tag
                  className=" absolute -translate-x-16 -translate-y-18"
                  color="fuchsia"
                >
                  font-size/title/font-weight
                </Tag>
                <Tag
                  className=" absolute translate-x-8 -translate-y-6 "
                  color="purple"
                >
                  font-size/title/line-height
                </Tag>
                <Tag
                  className=" absolute -translate-x-6 translate-y-6"
                  color="green"
                >
                  font-size/title/letter-spacing
                </Tag>
              </div>
            </BentoItem>
            <BentoItem
              title={dictionary.features.unitConversion.title}
              description={dictionary.features.unitConversion.description}
              className=" col-span-1 "
            >
              <TextRevealCard
                className="w-full h-full bg-background flex items-center justify-center rounded-none border-none"
                text="font-size:16px"
                revealText="font-size:1rem"
              ></TextRevealCard>
            </BentoItem>
            <BentoItem
              tag={dictionary.exclusive}
              title={dictionary.features.cssMediaQueryMode.title}
              description={dictionary.features.cssMediaQueryMode.description}
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

          <div className="w-full  grid bg-border">
            <div className="bg-background text-heading text-foreground p-10">
              {dictionary.organizingYourVariables.heading}
            </div>

            <div className="relative z-10  w-full grid grid-cols-3  ">
              <Link href="/docs/organizing-your-variables/principles">
                <MagicCard inset="1px 0.5px 0.5px 0.5px" color="pink">
                  <Card
                    color="pink"
                    title={dictionary.organizingYourVariables.principles.title}
                    description={
                      dictionary.organizingYourVariables.principles.description
                    }
                    icon={<BookOpen absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>

              <Link href="/docs/organizing-your-variables/colors">
                <MagicCard inset="1px 0.5px 0.5px 0.5px" color="purple">
                  <Card
                    color="purple"
                    title={dictionary.organizingYourVariables.colors.title}
                    description={
                      dictionary.organizingYourVariables.colors.description
                    }
                    icon={<Palette absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>

              <Link href="/docs/organizing-your-variables/typography">
                <MagicCard inset="1px 0.5px 0.5px 0.5px" color="blue">
                  <Card
                    color="blue"
                    title={dictionary.organizingYourVariables.typography.title}
                    description={
                      dictionary.organizingYourVariables.typography.description
                    }
                    icon={<Type absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>

              <Link href="/docs/organizing-your-variables/spacing">
                <MagicCard inset="0.5px 0.5px 0.5px 0.5px" color="green">
                  <Card
                    color="green"
                    title={dictionary.organizingYourVariables.spacing.title}
                    description={
                      dictionary.organizingYourVariables.spacing.description
                    }
                    icon={<Ruler absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>

              <Link href="/docs/organizing-your-variables/other-tokens">
                <MagicCard inset="0.5px 0.5px 0.5px 0.5px" color="orange">
                  <Card
                    color="orange"
                    title={dictionary.organizingYourVariables.other.title}
                    description={
                      dictionary.organizingYourVariables.other.description
                    }
                    icon={<Box absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>

              <Link href="/docs/organizing-your-variables/multi-mode">
                <MagicCard inset="0.5px 0.5px 0.5px 0.5px" color="cyan">
                  <Card
                    color="cyan"
                    title={dictionary.organizingYourVariables.multiMode.title}
                    description={
                      dictionary.organizingYourVariables.multiMode.description
                    }
                    icon={<Columns3 absoluteStrokeWidth={true} size={54} />}
                  />
                </MagicCard>
              </Link>
            </div>
          </div>

          <div className="h-6 bg-background"></div>

          <div className="w-full  grid gap-px bg-border">
            <div className="bg-background text-heading text-foreground p-10">
              {dictionary.figmaTemplate.heading}
            </div>

            <div className="relative z-10  w-full grid  bg-background p-10 overflow-hidden">
              <div className="grid gap-6 max-w-112">
                <div className="text-heading text-primary">
                  {dictionary.figmaTemplate.title}
                </div>
                <div className="text-body text-muted-foreground leading-tight">
                  {dictionary.figmaTemplate.description}
                </div>
                <Button className="w-fit" asChild>
                  <Link
                    href="https://www.figma.com/community/file/1522188131593288033"
                    target="_blank"
                  >
                    {dictionary.figmaTemplate.openInFigma}
                  </Link>
                </Button>
              </div>

              <div className="w-[80%] absolute right-0 bottom-0 translate-x-[30%] translate-y-[43%]">
                <Image
                  className="w-full"
                  src={FigmaTemplate}
                  alt="figma-template"
                  width={3216}
                  height={2149}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
