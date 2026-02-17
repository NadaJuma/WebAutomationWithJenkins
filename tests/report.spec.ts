import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { ReportsPage } from "../pages/report.page";
import { build350Cases } from "../data/report.factory";

const cases = build350Cases();

test.describe("Tajawob - Reports (POM + Data Factory) @smoke", () => {
  test.beforeEach(async ({ page }) => {
    // const username = process.env.TAJAWOB_USER3!;
    // const password = process.env.TAJAWOB_PASS3!;

    // const login = new LoginPage(page);
    // await login.gotoHome();
    // await login.openOldLogin();
    // await login.login(username, password);
    // await login.assertLoggedIn();

    const login = new LoginPage(page);
        const reports = new ReportsPage(page);

        const username = process.env.TAJAWOB_USER3!;
        const password = process.env.TAJAWOB_PASS3!;

        await login.goto();
        await login.loginOld(username, password);


  });

  


  for (const tc of cases) {
    test(`${tc.id} - ${tc.title}`, async ({ page }) => {
      const reports = new ReportsPage(page);

      await reports.openSubmitReport();
      await reports.fillForm(tc.data);
      await reports.pickMapPoint(tc.data.map);

      await reports.submit(tc.confirm ?? "yes");

      // Expectations
      if (tc.expected.type === "success") {
        await reports.expectSuccess();
        // Optional: verify in list
        await page.getByRole("button", { name: "My Reports" }).click();
        await expect(page.getByText(/My Reports/i)).toBeVisible();
      }

      if (tc.expected.type === "validation") {
        await reports.expectValidationMessage(tc.expected.message);
      }

      if (tc.expected.type === "cancel") {
        // Example: confirm "no" returns to form
        await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
      }

      if (tc.expected.type === "serverError") {
        await expect(page.getByText(tc.expected.message)).toBeVisible();
      }
    });
  }
});
