import { Page, expect } from "@playwright/test";
import type { ComplaintFactory } from "../data/complaint.factory";

export type ComplaintData = {
  entityText: string;
  serviceCatalogueOption: string;
  complaintTypeText: string;
  complaintCatalogueValue: string;
  governorateText: string;
  wilayatOption: string;
  villageOption: string;
  description: string;
  mapSearch: string;
  mapPickText: string;
};

export class ComplaintsPage {
  constructor(private page: Page) {}

  async openSubmitComplaint() {
    await this.page.getByRole("button", { name: "My Complaints" }).click();
    await this.page.getByRole("button", { name: "Submit a Complaint", exact: true }).click();
    await expect(this.page.getByRole("combobox", { name: "Entity *" })).toBeVisible();
  }

  async fillForm(data: ComplaintData) {
    await this.page.getByRole("combobox", { name: "Entity *" }).click();
    await this.page.getByText(data.entityText).click();

    await this.page.getByRole("combobox", { name: "Service catalogue *" }).click();
    await this.page.getByRole("option", { name: data.serviceCatalogueOption }).click();

    await this.page.getByRole("combobox", { name: "Complaint Type *" }).click();
    await this.page.getByText(data.complaintTypeText).click();

    await this.page.getByLabel("Complaint catalogue").selectOption(data.complaintCatalogueValue);

    await this.page.getByRole("combobox", { name: "Governorate *" }).click();
    await this.page.getByText(data.governorateText).click();

    await this.page.getByRole("combobox", { name: "Wilayat *" }).click();
    await this.page.getByRole("option", { name: data.wilayatOption }).click();

    await this.page.getByRole("combobox", { name: "Village" }).click();
    await this.page.getByRole("option", { name: data.villageOption }).click();

    await this.page.getByRole("textbox", { name: "The field allows a maximum of" }).fill(data.description);

    await this.page.getByRole("textbox", { name: "Search Google Maps" }).fill(data.mapSearch);
    await this.page.getByText(data.mapPickText).click();
  }

  async submitYes() {
    await this.page.getByRole("button", { name: "Submit" }).click();
    await this.page.getByRole("button", { name: "Yes" }).click();
  }

  async expectSuccessAndClose() {
    await expect(this.page.getByRole("button", { name: "OK" })).toBeVisible();
    await this.page.getByRole("button", { name: "OK" }).click();
  }
}
