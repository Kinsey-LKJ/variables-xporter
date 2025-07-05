"use client";

import { CardsDemo } from "../shadcn-ui-cards";
import { useTheme } from "nextra-theme-docs";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { useEffect, useState } from "react";
import type { Dictionary } from "../../_dictionaries/i18n-config";
import { Button } from "@app/components/ui/button";
import Link from "next/link";

interface ExampleProps {
  params?: {
    lang: string;
  };
  dictionary: Dictionary;
}

const Example = ({ params, dictionary }: ExampleProps) => {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<"default" | "compact">("default");
  const [brand, setBrand] = useState<"brand-a" | "brand-b">("brand-a");
  const [radius, setRadius] = useState<
    "default" | "radius-none" | "radius-large"
  >("default");

  // 在全局改变主题或部分区域改变主题时都需要以下代码，部分区域需要是因为解决 shadcn/ui chart 的样式无法覆盖的问题
  useEffect(() => {
    document.documentElement.classList.toggle("compact", density === "compact");
    document.documentElement.classList.toggle("brand-b", brand === "brand-b");
    document.documentElement.classList.toggle(
      "radius-large",
      radius === "radius-large"
    );
    document.documentElement.classList.toggle(
      "radius-none",
      radius === "radius-none"
    );

    return () => {
      document.documentElement.classList.remove("compact");
      document.documentElement.classList.remove("brand-b");
      document.documentElement.classList.remove("radius-large");
    };
  }, [density, brand, radius]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-2xl font-medium">{dictionary.example.description}</p>
        <p className="text-base">{dictionary.example.note}</p>

      </div>
      <div className="flex gap-4">
        <Tabs
          value={theme === "dark" ? "dark" : "light"}
          onValueChange={(value) => setTheme(value as "light" | "dark")}
        >
          <div className="text-sm text-muted-foreground">{dictionary.example.theme.title}</div>
          <TabsList>
            <TabsTrigger value="light">{dictionary.example.theme.light}</TabsTrigger>
            <TabsTrigger value="dark">{dictionary.example.theme.dark}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={density}
          onValueChange={(value: "default" | "compact") => setDensity(value)}
        >
          <div className="text-sm text-muted-foreground">{dictionary.example.density.title}</div>
          <TabsList>
            <TabsTrigger value="default">
              {dictionary.example.density.default}
            </TabsTrigger>
            <TabsTrigger value="compact">
              {dictionary.example.density.compact}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={brand}
          onValueChange={(value: "brand-a" | "brand-b") => setBrand(value)}
        >
          <div className="text-sm text-muted-foreground">{dictionary.example.brand.title}</div>
          <TabsList>
            <TabsTrigger value="brand-a">{dictionary.example.brand.a}</TabsTrigger>
            <TabsTrigger value="brand-b">{dictionary.example.brand.b}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={radius}
          onValueChange={(value: "default" | "radius-none" | "radius-large") =>
            setRadius(value)
          }
        >
          <div className="text-sm text-muted-foreground">{dictionary.example.radius.title}</div>
          <TabsList>
            <TabsTrigger value="radius-none">
              {dictionary.example.radius.none}
            </TabsTrigger>
            <TabsTrigger value="default">
              {dictionary.example.radius.small}
            </TabsTrigger>
            <TabsTrigger value="radius-large">
              {dictionary.example.radius.large}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Button asChild className="w-fit">
          <Link
            href="https://www.figma.com/design/1234567890/Example"
            target="_blank"
          >
            {dictionary.example.checkInFigma}
          </Link>
        </Button>

      <div>
        <CardsDemo />
      </div>
    </div>
  );
};

export default Example;
