import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { EnquiryPage } from "../pages/enquiry.page";
import { buildEnquiryCases } from "../data/enquiry.factory";

test.describe("Tajawob - Submit Enquiry (POM + Data Factory) @smoke", () => {
  const baseApp = "https://stg.tajawob.om/";

  // ✅ Read credentials once (fail fast)
  const username = process.env.TAJAWOB_USER2;
  const password = process.env.TAJAWOB_PASS2;

  if (!username || !password) {
    throw new Error("Missing env vars: TAJAWOB_USER2 and/or TAJAWOB_PASS2");
  }

  // ✅ Generate 350 test cases from factory
  const cases = buildEnquiryCases(350);

  for (const c of cases) {
     test(`${c.caseId} - ${c.description} @smoke`, async ({ page }, testInfo) => {
          // Optional: add it to annotations too
    testInfo.annotations.push({ type: "description", description: c.description })
    
      const login = new LoginPage(page);
      const enquiry = new EnquiryPage(page);

      await test.step("1) Login using unified LoginPage", async () => {
        await login.goto();
        await login.loginOld(username, password);

        // ✅ IMPORTANT: LoginPage does not wait, so spec must assert login completed
        await expect(page.getByRole("button", { name: "My Enquiries" })).toBeVisible({
          timeout: 15000,
        });
      });

      await test.step("2) Navigate to Submit an Enquiry", async () => {
        await page.goto(baseApp, { waitUntil: "domcontentloaded" });

        // If EnquiryPage.goToSubmitEnquiry() does NOT click My Enquiries first,
        // then call it here or update that method.
        await enquiry.goToSubmitEnquiry();

        await expect(page.getByRole("combobox", { name: "Entity *" })).toBeVisible({
          timeout: 15000,
        });
      });

      await test.step("3) Fill form (data-driven)", async () => {
        // Optional: keep notes unique if system blocks duplicates
        const data = { ...c, notes: `${c.notes}-${Date.now()}` };

        await enquiry.fillForm(data);

        // ✅ Extra stability check: service catalogue should be resolved (optional)
        await expect(page.getByRole("combobox", { name: "Governorate *" })).toBeVisible();
      });

      await test.step("4) Map selection", async () => {
        await enquiry.selectMapLocation(c.mapQuery, c.mapPick);
      });

      await test.step("5) Submit and confirm", async () => {
        await enquiry.submitAndConfirm();

        // ✅ Post-submit sanity check
        await expect(page.getByRole("button", { name: "My Enquiries" })).toBeVisible({
          timeout: 15000,
        });
      });

      await test.step("6) Open My Enquiries", async () => {
        await enquiry.openMyEnquiries();
      });
    });
  }
});
