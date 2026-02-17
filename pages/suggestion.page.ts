import { Page, expect } from '@playwright/test';

export class SuggestionPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.getByRole('button', { name: 'Submit a Suggestion', exact: true }).click();
    await expect(this.page.getByRole('combobox', { name: 'Entity *' })).toBeVisible();
  }

  // Entity: search text + selected option text (because option != search)
  async selectEntity(search: string, option: string) {
    const combo = this.page.getByRole('combobox', { name: 'Entity *' });
    await combo.click();
    await combo.fill(search);

    const opt = this.page.getByText(option, { exact: false });
    await opt.waitFor({ state: 'visible', timeout: 6000 });
    await opt.click();
  }

  // ✅ Generic safe selector for dropdowns
  private async trySelectOption(comboLabel: string, optionText: string, timeout = 4000): Promise<boolean> {
    const combo = this.page.getByRole('combobox', { name: comboLabel });

    await combo.click();

    // some combos allow typing to filter; if not supported it usually doesn't break
    await combo.fill(optionText).catch(() => {});

    const opt = this.page.getByText(optionText, { exact: false });

    try {
      await opt.first().waitFor({ state: 'visible', timeout });
      await opt.first().click();
      return true;
    } catch {
      // close dropdown if it stays open
      await this.page.keyboard.press('Escape').catch(() => {});
      return false;
    }
  }

  // ✅ Service catalogue: list takes time
  async trySelectService(value: string): Promise<boolean> {
    // sometimes service list depends on entity - you may want to ensure entity selected first
    return this.trySelectOption('Service catalogue *', value, 7000);
  }

  async trySelectGovernorate(value: string): Promise<boolean> {
    return this.trySelectOption('Governorate *', value, 5000);
  }

  async trySelectWilayat(value: string): Promise<boolean> {
    return this.trySelectOption('Wilayat *', value, 5000);
  }

  async trySelectVillage(value: string): Promise<boolean> {
    // Village can be optional; if you pass empty, treat as "skip"
    if (!value) return true;
    return this.trySelectOption('Village', value, 5000);
  }

  async fillDescription(text: string) {
    await this.page.getByRole('textbox', { name: /maximum/i }).fill(text);
  }

  // ✅ Submit then click Yes ONLY if popup appears
  async submitAndConfirmYes() {
    await this.page.getByRole('button', { name: 'Submit' }).click();

    const yesBtn = this.page.getByRole('button', { name: 'Yes' });
    const yesVisible = await yesBtn.isVisible().catch(() => false);

    if (yesVisible) {
      await yesBtn.click();
    }
  }

  // ✅ Only for success flow
  async clickOKIfVisible() {
    const okBtn = this.page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible().catch(() => false)) {
      await okBtn.click();
    }
  }

  // ✅ Validation check (Required)
  async expectRequiredValidation() {
    // keep it flexible: sometimes messages are different per field
    await expect(this.page.locator('.mx-validation-message')).toContainText(/Required/i);
  }
}
