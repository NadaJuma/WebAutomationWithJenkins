import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SuggestionPage } from '../pages/suggestion.page';
import { suggestionData } from '../data/suggestion.data';

test.describe('Tajawob - Suggestions (POM + Data Factory @smoke)', () => {
  suggestionData.forEach((data, i) => {
    test(
      `Submit suggestion #${i + 1} - ${data.title ?? data.governorate + '/' + data.wilayat}`,
      async ({ page }) => {
        const login = new LoginPage(page);
        const suggestion = new SuggestionPage(page);

        const username = process.env.TAJAWOB_USER4!;
        const password = process.env.TAJAWOB_PASS4!;

        await login.goto();
        await login.loginOld(username, password);

        await suggestion.open();

        // ✅ Entity (use search + option if your data has both)
        if ('entitySearch' in data && data.entitySearch) {
          await suggestion.selectEntity(data.entitySearch, data.entityOption);
        } else {
          // fallback if you only stored the option text
          await suggestion.selectEntity(data.entitySearch, data.entityOption);

        }

        await suggestion.trySelectService(data.service);
       // await suggestion.selectGovernorate(data.governorate);
      //  await suggestion.selectWilayat(data.wilayat);

        // ✅ Village optional
        // if (data.village) {
        //   await suggestion.selectVillage(data.village);
        // }
    // Governorate
        // -------------------------
        const govOk = await suggestion.trySelectGovernorate(data.governorate);
        if (!govOk) {
          // If governorate not found, do NOT continue to wilayat/village (they depend on governorate)
          await suggestion.fillDescription(data.description);
          await suggestion.submitAndConfirmYes();
          await suggestion.expectRequiredValidation();
          return;
        }

        // -------------------------
        // Wilayat (depends on governorate)
        // -------------------------
        const wilOk = await suggestion.trySelectWilayat(data.wilayat);
        if (!wilOk) {
          // If wilayat not found, submit and validate required/validation
          await suggestion.fillDescription(data.description);
          await suggestion.submitAndConfirmYes();
          await suggestion.expectRequiredValidation();
          return;
        }

        // -------------------------
        // Village (optional, depends on wilayat)
        // -------------------------
        // If village is provided, try select it safely.
        if (data.village) {
          const villageOk = await suggestion.trySelectVillage(data.village);
          if (!villageOk) {
            // If village not found, submit and validate required/validation
            await suggestion.fillDescription(data.description);
            await suggestion.submitAndConfirmYes();
            await suggestion.expectRequiredValidation();
            return;
          }
        }





        await suggestion.fillDescription(data.description);

        // ✅ Submit always requires Yes in your system
        await suggestion.submitAndConfirmYes();

        // ✅ Validate expected outcome
        if (data.expectError) {
          await suggestion.expectRequiredValidation();
          return;
        }

        await suggestion.clickOKIfVisible();

        // Optional: add a success assertion if you have any stable message/element
        // await expect(page.getByText(/submitted|success/i)).toBeVisible();
      }
    );
  });
});
