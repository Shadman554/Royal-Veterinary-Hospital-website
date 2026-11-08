import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { services } from "./src/services-data.ts";

export async function syncLocales() {
  const read = async (name) =>
    JSON.parse(await readFile(new URL(name, import.meta.url), "utf8"));
  const copy = await read("./src/copy-defaults.json");
  const groups = await read("./src/copy-groups.json");
  const dictionaries = await Promise.all(
    ["copy", "common", "services"].map((name) =>
      read(`./src/locales/ckb-${name}.json`),
    ),
  );
  const translated = Object.assign({}, ...dictionaries);
  for (const key of Object.keys(copy))
    if (key.startsWith("ckb::")) delete copy[key];
  for (const key of Object.keys(groups))
    if (key.startsWith("Kurdish · ")) delete groups[key];
  for (const [key, value] of Object.entries(translated))
    copy[`ckb::${key}`] = value;
  for (const [group, keys] of Object.entries({ ...groups })) {
    groups[`Kurdish · ${group}`] = keys
      .filter((key) => translated[key])
      .map((key) => `ckb::${key}`);
  }
  groups["Kurdish · Hospital and booking"] = Object.keys(dictionaries[1]).map(
    (key) => `ckb::${key}`,
  );
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(strings)
        : value && typeof value === "object"
          ? Object.values(value).flatMap(strings)
          : [];
  for (const service of services) {
    groups[`Kurdish · ${service.title}`] = [...new Set(strings(service))]
      .filter((key) => translated[key])
      .map((key) => `ckb::${key}`);
  }
  const covered = new Set(Object.values(groups).flat());
  groups["Kurdish · Care categories and steps"] = Object.keys(translated)
    .map((key) => `ckb::${key}`)
    .filter((key) => !covered.has(key));
  await writeFile(
    new URL("./src/copy-defaults.json", import.meta.url),
    JSON.stringify(copy, null, 2) + "\n",
  );
  await writeFile(
    new URL("./src/copy-groups.json", import.meta.url),
    JSON.stringify(groups, null, 2) + "\n",
  );
  console.log(
    `Registered ${Object.keys(translated).length} editable Kurdish translations.`,
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await syncLocales();
