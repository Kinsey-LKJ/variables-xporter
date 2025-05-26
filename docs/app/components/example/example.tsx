"use client";

import { CardsDemo } from "../shadcn-ui-cards";
import { useTheme } from "nextra-theme-docs";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { useEffect, useState } from "react";
import { cn } from "@app/lib/utils";
import { Calendar } from "../ui/calendar";

const Example = () => {
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
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="compact">Compact</TabsTrigger>
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
