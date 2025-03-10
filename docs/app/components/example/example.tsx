"use client";

import { CardsDemo } from "../shadcn-ui-cards";
import { useTheme } from "nextra-theme-docs";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { useState } from "react";
import { cn } from "@app/lib/utils";

const Example = () => {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<"default" | "compact">("default");

  return (
    <div className="grid gap-6">
      <div className="flex gap-4">
        <Tabs value={theme || "light"} onValueChange={setTheme}>
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
      </div>

      <div className={density === "compact" ? "compact" : "default"}>
        <CardsDemo />
      </div>
    </div>
  );
};

export default Example;
