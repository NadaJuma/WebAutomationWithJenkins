import { ComplaintFactory } from "./complaint.factory";


export type ComplaintCase = {
  id: string;
  title: string;
  data: any;
  expected: "success";
};

const pad = (n: number) => String(n).padStart(3, "0");

export function build350ComplaintCases(): ComplaintCase[] {
  const cases: ComplaintCase[] = [];

  for (let i = 1; i <= 350; i++) {
    cases.push({
      id: `C-${pad(i)}`,
      title: `Auto generated complaint ${i}`,
      data: ComplaintFactory.valid({
        description: `Auto case ${i}`,
      }),
      expected: "success",
    });
  }

  return cases;
}
