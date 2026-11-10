// Converts src/_data/genealogie.yaml into a GEDCOM 5.5.1 file that Gramps or webtrees can import.
// Usage: node old/yaml-to-gedcom.mjs [input.yaml] [output.ged]
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const here = path.dirname(new URL(import.meta.url).pathname);
const input = process.argv[2] || path.join(here, "../src/_data/genealogie.yaml");
const output = process.argv[3] || path.join(here, "genealogie.ged");

// "Loly /Garcia de la Cruz/" -> { given: "Loly", surname: "Garcia de la Cruz" }
// "Philippe Giboulot"        -> { given: "Philippe", surname: "Giboulot" }
// "Antony"                   -> { given: "Antony", surname: "" }
function parseName(raw) {
  const s = String(raw).trim();
  const slashed = /^(.*?)\s*\/(.*)\/\s*$/.exec(s);
  if (slashed) return { given: slashed[1], surname: slashed[2] };
  const words = s.split(/\s+/);
  if (words.length === 1) return { given: s, surname: "" };
  return { given: words.slice(0, -1).join(" "), surname: words.at(-1) };
}

const opposite = { M: "F", F: "M" };
const people = []; // { id, names: [{given, surname, type}], sex, fams: [], famc: [] }
const families = []; // { id, husb, wife, children: [] }

function addPerson(names, sex) {
  const person = { id: `@I${people.length + 1}@`, names, sex, fams: [], famc: [] };
  people.push(person);
  return person;
}

// inheritedSurname: the father's surname, for a child written with a first name only
function walk(node, inheritedSurname, parentFamily) {
  const current = parseName(node.name);
  const names = [];
  if (node.born_name) {
    names.push({ ...parseName(node.born_name), type: "birth" });
    names.push({ ...current, type: "married" });
  } else {
    names.push({ ...current, surname: current.surname || inheritedSurname || "" });
  }
  const person = addPerson(names, node.sex);
  if (parentFamily) {
    person.famc.push(parentFamily.id);
    parentFamily.children.push(person.id);
  }

  if (!node.partner && !node.children?.length) return;

  const family = { id: `@F${families.length + 1}@`, husb: null, wife: null, children: [] };
  families.push(family);
  person.fams.push(family.id);

  let partner = null;
  if (node.partner) {
    const partnerSex = node.partner_sex || opposite[node.sex];
    partner = addPerson([parseName(node.partner)], partnerSex);
    partner.fams.push(family.id);
  }

  // GEDCOM 5.5.1 records a couple as HUSB / WIFE
  const pair = [person, partner].filter(Boolean);
  family.husb = pair.find((p) => p.sex === "M")?.id ?? null;
  family.wife = pair.find((p) => p.sex === "F")?.id ?? null;
  for (const p of pair) {
    if (p.id !== family.husb && p.id !== family.wife) {
      if (!family.husb) family.husb = p.id;
      else family.wife = p.id;
    }
  }

  // Children take the father's birth surname, when the father is known
  const father = pair.find((p) => p.sex === "M");
  const childSurname = father ? father.names[0].surname : "";
  for (const child of node.children || []) walk(child, childSurname, family);
}

const tree = yaml.load(fs.readFileSync(input, "utf8"));
for (const root of tree) walk(root, "", null);

const lines = [
  "0 HEAD",
  "1 SOUR yaml-to-gedcom",
  "1 GEDC",
  "2 VERS 5.5.1",
  "2 FORM LINEAGE-LINKED",
  "1 CHAR UTF-8",
  "1 LANG French",
];
for (const p of people) {
  lines.push(`0 ${p.id} INDI`);
  for (const n of p.names) {
    lines.push(`1 NAME ${n.given ? n.given + " " : ""}/${n.surname}/`);
    if (n.given) lines.push(`2 GIVN ${n.given}`);
    if (n.surname) lines.push(`2 SURN ${n.surname}`);
    if (n.type) lines.push(`2 TYPE ${n.type}`);
  }
  lines.push(`1 SEX ${p.sex || "U"}`);
  for (const f of p.famc) lines.push(`1 FAMC ${f}`);
  for (const f of p.fams) lines.push(`1 FAMS ${f}`);
}
for (const f of families) {
  lines.push(`0 ${f.id} FAM`);
  if (f.husb) lines.push(`1 HUSB ${f.husb}`);
  if (f.wife) lines.push(`1 WIFE ${f.wife}`);
  for (const c of f.children) lines.push(`1 CHIL ${c}`);
}
lines.push("0 TRLR");

fs.writeFileSync(output, lines.join("\n") + "\n");
console.log(`${people.length} people, ${families.length} families -> ${output}`);
