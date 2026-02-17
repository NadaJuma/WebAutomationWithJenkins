import { Page, expect } from "@playwright/test";
import { selectFromCombobox } from "../utils/combobox";

export type ReportFormData = {
  entity?: { query: string; option: string };                 // required
  classification?: string;                                     // required
  reportType?: string;                                         // required
  governorate?: string;                                        // required
  wilayat?: string;                                            // required
  village?: string;                                            // optional
  description?: string;                                        // optional/required depends on app
  map?: { search: string; pickResultText: string; click: { x: number; y: number } };
};

export class ReportsPage {
  constructor(private page: Page) {}

  async openSubmitReport() {
    await this.page.getByRole("button", { name: "My Reports" }).click();
    await this.page.getByRole("button", { name: "Submit a Report", exact: true }).click();
    await expect(this.page.getByRole("combobox", { name: "Entity *" })).toBeVisible();
  }

  async fillForm(data: ReportFormData) {
    if (data.entity) {
      await selectFromCombobox(this.page, "Entity *", data.entity.query, data.entity.option);
    }

    if (data.classification) {
      await this.page.getByRole("combobox", { name: "Report Classification *" }).click();
      await this.page.getByText(data.classification).click();
    }

    if (data.reportType) {
      await this.page.getByRole("combobox", { name: "Report Type *" }).click();
      await this.page.getByText(data.reportType).click();
    }

    if (data.governorate) {
      await this.page.getByRole("combobox", { name: "Governorate *" }).click();
      await this.page.getByText(data.governorate).click();
    }

    if (data.wilayat) {
      await this.page.getByRole("combobox", { name: "Wilayat *" }).click();
      await this.page.getByText(data.wilayat).click();
    }

    if (data.village) {
      await this.page.getByRole("combobox", { name: "Village" }).click();
      await this.page.getByText(data.village).click();
    }

    if (typeof data.description === "string") {
      // Your locator is fragile. Prefer a stable label if possible.
      // Replace with: getByRole('textbox', { name: 'Description *' }) if exists.
      await this.page.getByRole("textbox", { name: "The field allows a maximum of" }).fill(data.description);
    }
  }

  async pickMapPoint(map?: ReportFormData["map"]) {
    if (!map) return;

    await this.page.getByRole("textbox", { name: "Search Google Maps" }).fill(map.search);
    await this.page.getByText(map.pickResultText).click();

    // Better than fixed timeout: wait for map container to be visible
    await expect(this.page.locator(".gm-style")).toBeVisible();
    await this.page.locator(".gm-style").click({ position: map.click });
  }

  async submit(confirm: "yes" | "no" = "yes") {
    await this.page.getByRole("button", { name: "Submit" }).click();
    if (confirm === "yes") await this.page.getByRole("button", { name: "Yes" }).click();
    else await this.page.getByRole("button", { name: "No" }).click();
  }

  async expectSuccess() {
    await expect(this.page.getByRole("button", { name: "OK" })).toBeVisible();
    await this.page.getByRole("button", { name: "OK" }).click();
  }

  async expectValidationMessage(textOrRegex: string | RegExp) {
    await expect(this.page.getByText(textOrRegex)).toBeVisible();
  }
}
