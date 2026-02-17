import { test, expect } from "@playwright/test";

test.describe("Tajawob - Submit Enquiry", () => {
  test("Submit an enquiry successfully  @smoke", async ({ page }) => {
    const baseHome = "https://stg.tajawob.om/p/home";
    const baseApp = "https://stg.tajawob.om/";

    // Use env vars (recommended). Fallbacks removed for security best practice.
    const username = process.env.TAJAWOB_USER2;
    const password = process.env.TAJAWOB_PASS2;

    if (!username || !password) {
      throw new Error("Missing env vars: TAJAWOB_USER and/or TAJAWOB_PASS");
    }

    await test.step("1) Open portal home", async () => {
      await page.goto(baseHome, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: "Login OLD" })).toBeVisible();
    });

    await test.step("2) Login", async () => {
      await page.getByRole("button", { name: "Login OLD" }).click();

      await page.getByRole("textbox", { name: "Username" }).fill(username);
      await page.getByRole("textbox", { name: "Password" }).fill(password);

      await page.getByRole("button", { name: "Sign in", exact: true }).click();

      // Post-login assertion
      await expect(page.getByRole("button", { name: "My Enquiries" })).toBeVisible({ timeout: 15000 });
    });

    await test.step("3) Navigate to Submit an Enquiry", async () => {
      await page.goto(baseApp, { waitUntil: "domcontentloaded" });

      await page.getByRole("button", { name: "My Enquiries" }).click();
      await page.getByRole("button", { name: "Submit an Enquiry", exact: true }).click();

      await expect(page.getByRole("combobox", { name: "Entity *" })).toBeVisible();
    });

    await test.step("4) Fill enquiry form fields", async () => {
      // Entity
      const entity = page.getByRole("combobox", { name: "Entity *" });
      await entity.click();
      await entity.fill("ministr");
      await page.getByText("Ministry of information").click();

      // Service catalogue
      const serviceCatalogue = page.getByRole("combobox", { name: "Service catalogue *" });

// Wait until it becomes enabled (important!)
await expect(serviceCatalogue).toBeEnabled();

await serviceCatalogue.click();

// Wait for option to appear
await page.getByText("Get a Permit to Hold a Local", { exact: false })
  .waitFor({ state: "visible" });

await page.getByText("Get a Permit to Hold a Local", { exact: false }).click();

      // Governorate
      await page.getByRole("combobox", { name: "Governorate *" }).click();
      await page.getByText("Ash Sharqiyah South").click();

      // Wilayat
      await page.getByRole("combobox", { name: "Wilayat *" }).click();
      await page.getByText("Jalan Bani Buali").click();

      // Village (optional field)
      await page.getByRole("combobox", { name: "Village" }).click();
      await page.getByRole("option", { name: "Al Ayoon" }).click();

      // Description / Notes (label as recorded)
      await page.getByRole("textbox", { name: "The field allows a maximum of" }).fill("ssdsadad");
    });

    await test.step("5) Select location on map", async () => {
      const mapSearch = page.getByRole("textbox", { name: "Search Google Maps" });
      await mapSearch.click();
      await mapSearch.fill("ash shar");

      await page.getByText("Ash Sharqiyah North").click();

      // Recorder locator (fragile). Keep it, but add a safer fallback click.
      const recordedMapClick = page.locator(
        ".gm-style > div > div:nth-child(2) > div > div:nth-child(3) > div"
      );

      if (await recordedMapClick.count()) {
        await recordedMapClick.first().click();
      } else {
        // Fallback: click inside map canvas area
        await page.locator(".gm-style").click({ position: { x: 220, y: 220 } });
      }
    });

    await test.step("6) Submit enquiry and confirm", async () => {
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("button", { name: "Yes" }).click();
      await page.getByRole("button", { name: "OK" }).click();

      // Basic assertion after submit (replace with success toast / reference number if available)
      await expect(page.getByRole("button", { name: "My Enquiries" })).toBeVisible();
    });

    await test.step("7) Open My Enquiries (post-submit)", async () => {
      await page.getByRole("button", { name: "My Enquiries" }).click();
      // If you have a result table or last submitted record, assert it here.
    });
  });
});