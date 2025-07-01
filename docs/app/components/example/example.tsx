"use client";

import { CardsDemo } from "../shadcn-ui-cards";
import { useTheme } from "nextra-theme-docs";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { useEffect, useState } from "react";
import type { Dictionary } from "../../_dictionaries/i18n-config";

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

  // 在全局改变主题或部分区域改变主题时都需要以下代码，部分区域需要是因为解决 shadcn/ui chart 的样式无法覆盖的问题
  useEffect(() => {
    document.documentElement.classList.toggle("compact", density === "compact");
    document.documentElement.classList.toggle("brand-b", brand === "brand-b");

    return () => {
      document.documentElement.classList.remove("compact");
      document.documentElement.classList.remove("brand-b");
    };
  }, [density, brand]);


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
          <TabsList>
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={density}
          onValueChange={(value: "default" | "compact") => setDensity(value)}
        >
          <TabsList>
            <TabsTrigger value="default">
              {dictionary.example.default}
            </TabsTrigger>
            <TabsTrigger value="compact">
              {dictionary.example.compact}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={brand}
          onValueChange={(value: "brand-a" | "brand-b") => setBrand(value)}
        >
          <TabsList>
            <TabsTrigger value="brand-a">Brand A</TabsTrigger>
            <TabsTrigger value="brand-b">Brand B</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <CardsDemo />
      </div>
    </div>
  );
};

export default Example;
