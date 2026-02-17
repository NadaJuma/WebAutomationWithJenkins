import { test, expect } from '@playwright/test';

test.describe('Complaint submission flow', () => {
  test('submit a complaint successfully', async ({ page }) => {
    const baseHome = 'https://stg.tajawob.om/p/home';

    // Use env vars (recommended). No fallbacks for security.
    const username = process.env.TAJAWOB_USER1;
    const password = process.env.TAJAWOB_PASS1;

    if (!username || !password) {
      throw new Error('Missing env vars: TAJAWOB_USER1 and/or TAJAWOB_PASS1');
    }

    await test.step('1) Open portal home', async () => {
      await page.goto(baseHome, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /login old/i })).toBeVisible();
    });

    await test.step('2) Login', async () => {
      await page.getByRole('button', { name: /login old/i }).click();

      await page.getByRole('textbox', { name: /username/i }).fill(username);
      await page.getByRole('textbox', { name: /password/i }).fill(password);

      await page.getByRole("button", { name: "Sign in", exact: true }).click();

      // Post-login assertion (keep the one that is reliable in your app)
      await expect(page.getByRole('button', { name: /my enquiries/i })).toBeVisible({ timeout: 15000 });

      // If the speech bubble is the real indicator, assert it here
      await expect(page.getByRole('button', { name: /speech bubble/i })).toBeVisible({ timeout: 15000 });
    });

    await test.step('3) Open complaint form', async () => {
      await page.getByRole('button', { name: /speech bubble/i }).click();
      await expect(page.getByRole('combobox', { name: /entity \*/i })).toBeVisible();
    });

    // Helpers
    const pickFromCombobox = async (label: RegExp, searchText: string, optionText: RegExp) => {
      const combo = page.getByRole('combobox', { name: label });
      await expect(combo).toBeVisible();
      await combo.click();
      await combo.fill(searchText);

      // Prefer exact option click (less flaky than generic page.getByText)
      await page.getByRole('option', { name: optionText }).click();

      // Verify selection
      await expect(combo).toHaveValue(/.+/);
    };

    const pickByClick = async (label: RegExp, optionText: RegExp) => {
      const combo = page.getByRole('combobox', { name: label });
      await expect(combo).toBeVisible();
      await combo.click();

      await page.getByRole('option', { name: optionText }).click();

      await expect(combo).toHaveValue(/.+/);
    };

    await test.step('4) Fill form fields', async () => {
      await pickFromCombobox(/entity \*/i, 'minstr', /ministry of information/i);

      await pickByClick(/service catalogue \*/i, /get a permit for electronic/i);

      await pickByClick(/complaint type \*/i, /general compalint/i);

      const complaintCatalogue = page.getByLabel(/complaint catalogue/i);
      await expect(complaintCatalogue).toBeVisible();
      await complaintCatalogue.selectOption('155092712167572379');

      await pickByClick(/governorate \*/i, /al wusta/i);
      await pickByClick(/wilayat \*/i, /haima/i);
      await pickByClick(/^village$/i, /al-housayn/i);

      const description = page.getByRole('textbox', { name: /maximum/i });
      await expect(description).toBeVisible();
      await description.fill('Test complaint description');

      const mapsSearch = page.getByRole('textbox', { name: /search google maps/i });
      await expect(mapsSearch).toBeVisible();
      await mapsSearch.fill('al wasta');

      // If this is a suggestion item, it might be an option too
      await page.getByText(/madinet al wasta/i).click();
    });

    await test.step('5) Submit complaint', async () => {
      await Promise.all([
        page.waitForLoadState('networkidle'),
        page.getByRole('button', { name: /^submit$/i }).click(),
      ]);

      await page.getByRole('button', { name: /^yes$/i }).click();

      const okButton = page.getByRole('button', { name: /^ok$/i });
      await expect(okButton).toBeVisible();
      await okButton.click();

      // TODO: Replace with your actual success confirmation (ticket number / toast / status)
      // await expect(page.getByText(/success|submitted|ticket/i)).toBeVisible();
    });
  });
});
