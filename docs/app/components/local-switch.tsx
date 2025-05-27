"use client";

import { usePathname, useRouter } from "next/navigation";
import { I18NConfig } from "next/dist/server/config-shared";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

const LocalSwitch = ({
  i18n,
  lang,
}: {
  i18n: {
    locale: string;
    name: any;
  }[]; 
  lang: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  console.log(i18n);
  return (
    <Select
      onValueChange={(value) => {
        router.push(`${pathname.replace(`/${lang}`, `/${value}`)}`);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={i18n.find((item) => item.locale === lang)?.name} />
      </SelectTrigger>
      <SelectContent>
        {i18n?.map((item) => (
          <SelectItem key={item.locale} value={item.locale}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocalSwitch;
