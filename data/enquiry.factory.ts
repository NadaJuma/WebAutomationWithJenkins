export type EnquiryData = {
  caseId: string;
  description: string;
  tags?: string[];

  entitySearch: string;
  entityOption: string;
  serviceOption: string;
  governorate: string;
  wilayat: string;
  village?: string;
  notes: string;
  mapQuery: string;
  mapPick: string;
};

function pad(n: number, width = 3) {
  return String(n).padStart(width, "0");
}

function makeDesc(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" | ");
}

export function buildEnquiryCases(count = 350): EnquiryData[] {
  const cases: EnquiryData[] = [];
  let n = 1;

  const nextId = () => `TC${pad(n++)}`;

  const push = (c: Omit<EnquiryData, "caseId">) => {
    if (cases.length >= count) return;
    cases.push({ caseId: nextId(), ...c });
  };

  // -----------------------
  // Base / Defaults
  // -----------------------
  const base = {
    entitySearch: "ministr",
    entityOption: "Ministry of information",
    serviceOption: "Get a Permit to Hold a Local",
    governorate: "Ash Sharqiyah South",
    wilayat: "Jalan Bani Buali",
    village: "Al Ayoon",
    mapQuery: "ash shar",
    mapPick: "Ash Sharqiyah North",
  };

  // Deterministic uniqueness: stable across suite but still unique per case
  // (Avoid Date.now() so runs are reproducible in report comparisons)
  const runSeed = 20260217; // fixed seed (you can change per run manually if needed)
  const uniqueNotes = (caseId: string) => `Auto-${caseId}-${runSeed}`;

  // -----------------------
  // 1) Happy paths (few)
  // -----------------------
  push({
    description: makeDesc([
      "Happy path - submit enquiry",
      `Entity="${base.entityOption}"`,
      `Service="${base.serviceOption}"`,
      `Gov="${base.governorate}"`,
      `Wilayat="${base.wilayat}"`,
      `Village="${base.village}"`,
      `MapPick="${base.mapPick}"`,
    ]),
    tags: ["smoke", "happy"],
    ...base,
    notes: uniqueNotes(`TC${pad(n)}`), // preview id; still ok if you don’t rely on it
  });

  push({
    description: makeDesc([
      "Happy path - emoji notes",
      `Entity="${base.entityOption}"`,
      `Service="${base.serviceOption}"`,
    ]),
    tags: ["happy", "text"],
    ...base,
    notes: `Hello 😊 ${uniqueNotes(`TC${pad(n)}`)}`,
  });

  // -----------------------
  // 2) Required field validations (negative-style data)
  // NOTE: we keep fields but set them empty so POM can skip/select invalid.
  // -----------------------
  const requiredVariants: Array<{
    title: string;
    mutate: (d: EnquiryData) => void;
  }> = [
    { title: "Missing Entity", mutate: (d) => { d.entitySearch = ""; d.entityOption = ""; } },
    { title: "Missing Service", mutate: (d) => { d.serviceOption = ""; } },
    { title: "Missing Governorate", mutate: (d) => { d.governorate = ""; } },
    { title: "Missing Wilayat", mutate: (d) => { d.wilayat = ""; } },
    { title: "Missing Notes", mutate: (d) => { d.notes = ""; } },
    { title: "Missing Map Pick", mutate: (d) => { d.mapPick = ""; } },
  ];

  for (const v of requiredVariants) {
    if (cases.length >= count) break;

    const d: EnquiryData = {
      caseId: "TEMP",
      description: "",
      tags: ["negative", "required"],
      ...base,
      notes: uniqueNotes(`TC${pad(n)}`),
    };

    v.mutate(d);

    d.description = makeDesc([
      `Validation - ${v.title}`,
      `Entity="${d.entityOption || "(empty)"}"`,
      `Service="${d.serviceOption || "(empty)"}"`,
      `Gov="${d.governorate || "(empty)"}"`,
      `Wilayat="${d.wilayat || "(empty)"}"`,
      `Village="${d.village || "(skipped)"}"`,
      `MapPick="${d.mapPick || "(empty)"}"`,
    ]);

    // remove TEMP id, push with generated id
    // (copy without caseId)
    const { caseId, ...rest } = d;
    push(rest);
  }

  // -----------------------
  // 3) Notes boundary & text variants (build many)
  // Adjust max length based on your real UI limit
  // -----------------------
  const MAX_NOTES = 250;

  const notesVariants: Array<{ name: string; value: (caseId: string) => string; tag: string }> = [
    { name: "short", value: (id) => `ok-${id}`, tag: "text" },
    { name: "arabic", value: (id) => `وصف-${id}`, tag: "i18n" },
    { name: "emoji", value: (id) => `Test 😊 ${id}`, tag: "text" },
    { name: "maxMinus1", value: (id) => "a".repeat(MAX_NOTES - 1) + id, tag: "boundary" },
    { name: "max", value: (id) => "a".repeat(MAX_NOTES) + id, tag: "boundary" },
    { name: "maxPlus1", value: (id) => "a".repeat(MAX_NOTES + 1) + id, tag: "boundary" },
  ];

  for (const nv of notesVariants) {
    if (cases.length >= count) break;

    const idPreview = `TC${pad(n)}`;
    push({
      description: makeDesc([
        `Notes - ${nv.name}`,
        `Entity="${base.entityOption}"`,
        `Service="${base.serviceOption}"`,
      ]),
      tags: ["notes", nv.tag],
      ...base,
      notes: nv.value(idPreview),
    });
  }

  // -----------------------
  // 4) Controlled matrix (location/service) to scale toward 350
  // Keep combos realistic (not full cartesian unless you want that).
  // -----------------------
  const locationCombos = [
    { governorate: "Ash Sharqiyah South", wilayat: "Jalan Bani Buali", village: "Al Ayoon" },
    { governorate: "Muscat", wilayat: "Seeb", village: "Al Khoud" },
    { governorate: "Dhofar", wilayat: "Salalah", village: undefined }, // skip village
  ];

  const serviceOptions = [
    "Get a Permit to Hold a Local",
    // add real values from the UI if you have them:
    // "Another Service Name",
    // "Third Service Name",
  ];

  // rotate through combos until we near count
  while (cases.length < count - 10) {
    const idx = cases.length; // deterministic rotation
    const loc = locationCombos[idx % locationCombos.length];
    const service = serviceOptions[idx % serviceOptions.length];

    const idPreview = `TC${pad(n)}`;

    push({
      description: makeDesc([
        "Matrix - submit enquiry",
        `Gov="${loc.governorate}"`,
        `Wilayat="${loc.wilayat}"`,
        loc.village ? `Village="${loc.village}"` : "Village=(skipped)",
        `Service="${service}"`,
        `MapPick="${base.mapPick}"`,
      ]),
      tags: ["matrix"],
      ...base,
      governorate: loc.governorate,
      wilayat: loc.wilayat,
      village: loc.village,
      serviceOption: service,
      notes: `Auto-${idPreview}-${runSeed}-MATRIX`,
    });
  }

  // -----------------------
  // 5) Map variants (some negative)
  // -----------------------
  const mapVariants: Array<{ title: string; mapQuery: string; mapPick: string; tags: string[] }> = [
    { title: "Map - valid search", mapQuery: "ash shar", mapPick: "Ash Sharqiyah North", tags: ["map"] },
    { title: "Map - no results search", mapQuery: "zzzzzzzzzz", mapPick: "", tags: ["map", "negative"] },
  ];

  for (const mv of mapVariants) {
    if (cases.length >= count) break;
    const idPreview = `TC${pad(n)}`;

    push({
      description: makeDesc([
        mv.title,
        `MapQuery="${mv.mapQuery}"`,
        `MapPick="${mv.mapPick || "(empty)"}"`,
      ]),
      tags: mv.tags,
      ...base,
      mapQuery: mv.mapQuery,
      mapPick: mv.mapPick,
      notes: `Auto-${idPreview}-${runSeed}-MAP`,
    });
  }

  // -----------------------
  // 6) Pad remaining to exactly count (safe repeats but traceable)
  // -----------------------
  while (cases.length < count) {
    const idPreview = `TC${pad(n)}`;
    push({
      description: makeDesc([
        `Pad - happy repeat`,
        `Entity="${base.entityOption}"`,
        `Service="${base.serviceOption}"`,
      ]),
      tags: ["pad"],
      ...base,
      notes: `Auto-${idPreview}-${runSeed}-PAD`,
    });
  }

  return cases.slice(0, count);
}
