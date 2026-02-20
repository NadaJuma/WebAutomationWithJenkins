import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SuggestionPage } from '../pages/suggestion.page';
import { suggestionData } from '../data/suggestion.data';

test.describe('Tajawob - Suggestions (POM + Data Factory @smoke)', () => {

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    const username = process.env.TAJAWOB_USER4!;
    const password = process.env.TAJAWOB_PASS4!;

    await login.goto();
    await login.loginOld(username, password);
  });

  suggestionData.forEach((data, i) => {
    test(`Submit suggestion #${i + 1} - ${data.title ?? `${data.governorate}/${data.wilayat}`}`, async ({ page }) => {
      const suggestion = new SuggestionPage(page);

      await suggestion.open();

      // Entity
      await suggestion.selectEntity(data.entitySearch, data.entityOption);

      // Service
      const serviceOk = await suggestion.trySelectService(data.service);
      if (!serviceOk) {
        await suggestion.fillDescription(data.description);

        const result = await suggestion.submitConfirmAndWaitForResult();
        if (result === 'validation') await suggestion.expectRequiredValidation();
        return;
      }

      // Governorate (depends)
      const govOk = await suggestion.trySelectGovernorate(data.governorate);
      if (!govOk) {
        await suggestion.fillDescription(data.description);

        const result = await suggestion.submitConfirmAndWaitForResult();
        if (result === 'validation') await suggestion.expectRequiredValidation();
        return;
      }

      // Wilayat (depends on governorate)
      const wilOk = await suggestion.trySelectWilayat(data.wilayat);
      if (!wilOk) {
        await suggestion.fillDescription(data.description);

        const result = await suggestion.submitConfirmAndWaitForResult();
        if (result === 'validation') await suggestion.expectRequiredValidation();
        return;
      }

      // Village (optional, depends on wilayat)
      if (data.village) {
        const villageOk = await suggestion.trySelectVillage(data.village);
        if (!villageOk) {
          await suggestion.fillDescription(data.description);

          const result = await suggestion.submitConfirmAndWaitForResult();
          if (result === 'validation') await suggestion.expectRequiredValidation();
          return;
        }
      }

      // Description (always)
      await suggestion.fillDescription(data.description);

      // Submit and decide outcome
      const result = await suggestion.submitConfirmAndWaitForResult();

      // If this dataset is meant to produce errors
      if (data.expectError) {
        expect(result, 'Expected validation but got success/unknown').toBe('validation');
        await suggestion.expectRequiredValidation();
        return;
      }

      // Success path
      expect(result, 'Expected success but got validation/unknown').toBe('success');
      await suggestion.clickOKIfVisible();
    });
  });
});