import { Page, expect } from '@playwright/test';

export class SuggestionPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.getByRole('button', { name: 'Submit a Suggestion', exact: true }).click();

    // Proof the Create Suggestion screen is open
    await expect(
      this.page.getByRole('heading', { name: 'Create Suggestion', exact: true })
    ).toBeVisible({ timeout: 30000 });

    // Wait for the form control (Entity) to be ready
    await expect(this.page.getByRole('combobox', { name: 'Entity *' })).toBeVisible({ timeout: 20000 });
  }

  // Entity: search text + selected option text (because option != search)
  async selectEntity(search: string, option: string) {
    const combo = this.page.getByRole('combobox', { name: 'Entity *' });
    await combo.click();
    await combo.fill(search);

    const opt = this.page.getByText(option, { exact: false }).first();
    await opt.waitFor({ state: 'visible', timeout: 10000 });
    await opt.click();
  }

  // Generic safe selector for dropdowns
  private async trySelectOption(comboLabel: string, optionText: string, timeout = 6000): Promise<boolean> {
    const combo = this.page.getByRole('combobox', { name: comboLabel });

    try {
      await combo.waitFor({ state: 'visible', timeout: 15000 });
      await combo.click();

      // Some combos allow typing; if not supported, ignore
      await combo.fill(optionText).catch(() => {});

      const opt = this.page.getByText(optionText, { exact: false }).first();
      await opt.waitFor({ state: 'visible', timeout });
      await opt.click();

      return true;
    } catch {
      await this.page.keyboard.press('Escape').catch(() => {});
      return false;
    }
  }

  async trySelectService(value: string): Promise<boolean> {
    return this.trySelectOption('Service catalogue *', value, 10000);
  }

  async trySelectGovernorate(value: string): Promise<boolean> {
    return this.trySelectOption('Governorate *', value, 8000);
  }

  async trySelectWilayat(value: string): Promise<boolean> {
    return this.trySelectOption('Wilayat *', value, 8000);
  }

  async trySelectVillage(value: string): Promise<boolean> {
    if (!value) return true;
    return this.trySelectOption('Village', value, 8000);
  }

  async fillDescription(text: string) {
    await this.page.getByRole('textbox', { name: /maximum/i }).fill(text);
  }

  /**
   * Submit and confirm Yes (if confirmation popup appears),
   * then wait for either Success OR Validation.
   */
  async submitConfirmAndWaitForResult(): Promise<'success' | 'validation' | 'unknown'> {
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Wait briefly for confirmation popup (if it appears)
    const yesBtn = this.page.getByRole('button', { name: 'Yes' });
    const yesAppeared = await yesBtn.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);

    if (yesAppeared) {
      await yesBtn.click();
    }

    // Now wait for one of two outcomes
    const okBtn = this.page.getByRole('button', { name: 'OK' });
    const validation = this.page.locator('.mx-validation-message');

    await Promise.race([
      okBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      validation.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    ]);

    if (await okBtn.isVisible().catch(() => false)) return 'success';
    if ((await validation.count().catch(() => 0)) > 0) return 'validation';
    return 'unknown';
  }

  async clickOKIfVisible() {
    const okBtn = this.page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible().catch(() => false)) {
      await okBtn.click();
    }
  }

  /**
   * Validation check: confirm at least one required message exists
   * and contains "Required" (case-insensitive).
   */
  async expectRequiredValidation() {
    const validation = this.page.locator('.mx-validation-message');
    const count = await validation.count();

    expect(count, 'Expected validation messages but none were found').toBeGreaterThan(0);

    await expect(validation.first()).toContainText(/Required/i);
  }
}