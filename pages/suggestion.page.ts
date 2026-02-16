import { Page, expect } from '@playwright/test';

export class SuggestionPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.getByRole('button', { name: 'Submit a Suggestion', exact: true }).click();
    await expect(this.page.getByRole('combobox', { name: 'Entity *' })).toBeVisible();
  }

  async selectEntity(value: string) {
    const combo = this.page.getByRole('combobox', { name: 'Entity *' });
    await combo.click();
    await combo.fill(value);
    await this.page.getByText(value, { exact: false }).click();
  }

  async selectService(value: string) {
    const combo = this.page.getByRole('combobox', { name: 'Service catalogue *' });
    await expect(combo).toBeEnabled();
    await combo.click();
    await this.page.getByText(value, { exact: false }).click();
  }

  async selectGovernorate(value: string) {
    await this.page.getByRole('combobox', { name: 'Governorate *' }).click();
    await this.page.getByText(value).click();
  }

  async selectWilayat(value: string) {
    await this.page.getByRole('combobox', { name: 'Wilayat *' }).click();
    await this.page.getByText(value).click();
  }

  async selectVillage(value: string) {
    await this.page.getByRole('combobox', { name: 'Village' }).click();
    await this.page.getByText(value).click();
  }

  async fillDescription(text: string) {
    await this.page.getByRole('textbox', { name: /maximum/i }).fill(text);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Yes' }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }
}
