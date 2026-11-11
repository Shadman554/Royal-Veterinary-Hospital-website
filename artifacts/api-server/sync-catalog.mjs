import { readFile, writeFile } from "node:fs/promises";
import { syncLocales } from "../royal-veterinary-hospital/sync-locales.mjs";
await syncLocales();
import {
  services,
  categories,
  categorySteps,
} from "../royal-veterinary-hospital/src/services-data.ts";
import { defaultSettings } from "../royal-veterinary-hospital/src/site-defaults.ts";
import { defaultFeaturedServices, defaultSectionOrder, defaultSections } from "../royal-veterinary-hospital/src/page-sections.ts";
const source = await readFile(
  new URL("../royal-veterinary-hospital/src/content.ts", import.meta.url),
  "utf8",
);
const data = source.slice(source.indexOf("export const plans ="));
const { plans, team, faqs } = await import(
  "data:text/javascript," + encodeURIComponent(data)
);
const copy = JSON.parse(
  await readFile(
    new URL(
      "../royal-veterinary-hospital/src/copy-defaults.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const media = JSON.parse(
  await readFile(
    new URL(
      "../royal-veterinary-hospital/src/media-defaults.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
await writeFile(
  new URL("./src/catalog.json", import.meta.url),
  JSON.stringify(
    {
      services,
      settings: defaultSettings,
      sections: defaultSections,
      sectionOrder: defaultSectionOrder,
      homepageServices: defaultFeaturedServices,
      plans,
      team,
      faqs,
      copy,
      media,
      categories,
      categorySteps,
    },
    null,
    2,
  ),
);
