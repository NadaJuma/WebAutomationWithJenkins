import type { ReportFormData } from "../pages/report.page";

export type Expected =
  | { type: "success" }
  | { type: "validation"; message: string | RegExp }
  | { type: "cancel" }
  | { type: "serverError"; message: string | RegExp };

export type ReportCase = {
  id: string;
  title: string;
  tags?: string[];
  data: ReportFormData;
  confirm?: "yes" | "no";
  expected: Expected;
};

// A good base "valid" record:
export const BASE_VALID: ReportFormData = {
  entity: { query: "mi", option: "Ministry of information" },
  classification: "Content Issue(Oman daily ,or",
  reportType: "Bias Complaint",
  governorate: "Dhofar",
  wilayat: "Taqah",
  village: "Addamar",
  description: "Valid description",
  map: { search: "dhofar", pickResultText: "Dhofar Governorate", click: { x: 200, y: 200 } },
};
