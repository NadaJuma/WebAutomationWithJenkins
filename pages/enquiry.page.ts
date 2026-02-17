import { expect, Locator, Page } from "@playwright/test";
import type { EnquiryData } from "../data/enquiry.factory";

export class EnquiryPage {
  readonly page: Page;

  readonly myEnquiriesBtn: Locator;
  readonly submitEnquiryBtn: Locator;

  readonly entityCbx: Locator;
  readonly serviceCatalogueCbx: Locator;
  readonly governorateCbx: Locator;
  readonly wilayatCbx: Locator;
  readonly villageCbx: Locator;

  readonly notesRecordedTxt: Locator;
  readonly notesFallbackTxtArea: Locator;

  readonly mapSearchTxt: Locator;
  readonly mapRoot: Locator;

  readonly submitBtn: Locator;
  readonly yesBtn: Locator;
  readonly okBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.myEnquiriesBtn = page.getByRole("button", { name: "My Enquiries" });
    this.submitEnquiryBtn = page.getByRole("button", { name: "Submit an Enquiry", exact: true });

    this.entityCbx = page.getByRole("combobox", { name: "Entity *" });
    this.serviceCatalogueCbx = page.getByRole("combobox", { name: "Service catalogue *" });
    this.governorateCbx = page.getByRole("combobox", { name: "Governorate *" });
    this.wilayatCbx = page.getByRole("combobox", { name: "Wilayat *" });
    this.villageCbx = page.getByRole("combobox", { name: "Village" });

    this.notesRecordedTxt = page.getByRole("textbox", { name: "The field allows a maximum of" });
    this.notesFallbackTxtArea = page.locator("textarea").first();

    this.mapSearchTxt = page.getByRole("textbox", { name: "Search Google Maps" });
    this.mapRoot = page.locator(".gm-style").first();

    this.submitBtn = page.getByRole("button", { name: "Submit" });
    this.yesBtn = page.getByRole("button", { name: "Yes" });
    this.okBtn = page.getByRole("button", { name: "OK" });
  }

  async open(baseApp: string) {
    await this.page.goto(baseApp, { waitUntil: "domcontentloaded" });
  }

  async goToSubmitEnquiry() {
    await this.myEnquiriesBtn.click();
    await this.submitEnquiryBtn.click();
    await expect(this.entityCbx).toBeVisible({ timeout: 15000 });
  }

  private async selectComboboxOption(combobox: Locator, optionText: string) {
    await expect(combobox).toBeVisible();
    await expect(combobox).toBeEnabled();
    await combobox.click();

    const optionByRole = this.page.getByRole("option", { name: optionText }).first();
    const optionByText = this.page.getByText(optionText, { exact: true }).first();

    if (await optionByRole.count()) {
      await expect(optionByRole).toBeVisible({ timeout: 15000 });
      await optionByRole.click();
    } else {
      await expect(optionByText).toBeVisible({ timeout: 15000 });
      await optionByText.click();
    }
  }

  async fillForm(data: EnquiryData) {
    // Entity (typeahead)
    await this.entityCbx.click();
    await this.entityCbx.fill(data.entitySearch);

    const entityPick = this.page.getByText(data.entityOption, { exact: false }).first();
    await expect(entityPick).toBeVisible({ timeout: 15000 });
    await entityPick.click();

    // Service catalogue
    await expect(this.serviceCatalogueCbx).toBeEnabled({ timeout: 15000 });
    await this.serviceCatalogueCbx.click();

    const servicePick = this.page.getByText(data.serviceOption, { exact: false }).first();
    await expect(servicePick).toBeVisible({ timeout: 15000 });
    await servicePick.click();

    await this.selectComboboxOption(this.governorateCbx, data.governorate);
    await this.selectComboboxOption(this.wilayatCbx, data.wilayat);

    if (data.village) {
      await this.selectComboboxOption(this.villageCbx, data.village);
    }

    // Notes
    if (await this.notesRecordedTxt.count()) {
      await this.notesRecordedTxt.fill(data.notes);
    } else {
      await expect(this.notesFallbackTxtArea).toBeVisible();
      await this.notesFallbackTxtArea.fill(data.notes);
    }
  }

  async selectMapLocation(mapQuery: string, mapPick: string) {
    await expect(this.mapSearchTxt).toBeVisible({ timeout: 15000 });
    await this.mapSearchTxt.click();
    await this.mapSearchTxt.fill(mapQuery);

    const pick = this.page.getByText(mapPick, { exact: false }).first();
    await expect(pick).toBeVisible({ timeout: 15000 });
    await pick.click();

    const recordedMapClick = this.page.locator(
      ".gm-style > div > div:nth-child(2) > div > div:nth-child(3) > div"
    );

    if (await recordedMapClick.count()) {
      await recordedMapClick.first().click();
    } else {
      await expect(this.mapRoot).toBeVisible();
      await this.mapRoot.click({ position: { x: 220, y: 220 } });
    }
  }

  async submitAndConfirm() {
    await this.submitBtn.click();
    await this.yesBtn.click();
    await this.okBtn.click();

    await expect(this.myEnquiriesBtn).toBeVisible({ timeout: 15000 });
  }

  async openMyEnquiries() {
    await this.myEnquiriesBtn.click();
  }
}
