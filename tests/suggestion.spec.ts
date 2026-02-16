import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SuggestionPage } from '../pages/suggestion.page';
import { suggestionData } from '../data/suggestion.data';


test.describe('Tajawob - Suggestions', () => {

  for (const data of suggestionData) {

    test(`Submit suggestion - ${data.description.slice(0, 15)}`, async ({ page }) => {

      const login = new LoginPage(page);
      const suggestion = new SuggestionPage(page);

      const username = process.env.TAJAWOB_USER!;
      const password = process.env.TAJAWOB_PASS!;

      await login.goto();
      await login.loginOld(username, password);

      await suggestion.open();
      await suggestion.selectEntity(data.entityOption);
      await suggestion.selectService(data.service);
      await suggestion.selectGovernorate(data.governorate);
      await suggestion.selectWilayat(data.wilayat);
      await suggestion.selectVillage(data.village);
      await suggestion.fillDescription(data.description);

      await suggestion.submit();
    });

  }

});
