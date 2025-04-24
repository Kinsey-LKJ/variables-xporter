"use client";

import { CardsDemo } from "../shadcn-ui-cards";
import { useTheme } from "nextra-theme-docs";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { useState } from "react";
import { cn } from "@app/lib/utils";

const Example = () => {
  // const { theme, setTheme } = useTheme();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<"default" | "compact">("default");
  const [brand, setBrand] = useState<"brand-a" | "brand-b">("brand-a");

  return (
    <div className="grid gap-6">
      <div className="flex gap-4">
        <Tabs
          value={theme}
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

      <div
        className={cn(
          theme === "dark" ? "dark" : "light",
          density === "compact" ? "compact" : "",
          brand === "brand-b" ? "brand-b" : "",
          "example"
        )}
      >
        <CardsDemo />
      </div>
    </div>
  );
};

export default Example;
