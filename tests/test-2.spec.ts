// tests/submit-complaints-single.spec.ts
import { test, expect, type Browser } from '@playwright/test';

const users = [
  {
    username: 'nada1',
    password: 'V*!m@KB518',
    details: 'aaaaaaaaaaaaaaaaaaaaaa',
    catalogueId: '155092712167571616',
    governorate: 'Muscat',
    wilayat: 'Al Seeb',
    village: 'Al Koudh',
  },
  {
    username: 'nada2',
    password: 'V*!m@KB518',
    details: 'bbbbbbbbbbbbbbbbbbbbbb',
    catalogueId: '155092712167571616',
    governorate: 'Al Buraymi',
    wilayat: 'As Sunainah',
    village: 'Al-Awida',
  },
  {
    username: 'nada3',
    password: 'V*!m@KB518',
    details: 'cccccccccccccccccccccc',
    catalogueId: '155092712167571616',
    governorate: 'Al Batinah North',
    wilayat: 'Liwa',
    village: 'Abu Afan',
  },
];

test('Submit complaints for 3 users (single test, parallel contexts)', async ({ browser }) => {
  await Promise.all(users.map(user => runFlowForUser(browser, user)));
});

async function runFlowForUser(browser: Browser, user: typeof users[number]) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://stg.tajawob.om/p/home', { waitUntil: 'domcontentloaded' });

    // --- Ensure English quietly (no throw if not present) ---
    const englishBtn = page.getByRole('button', { name: 'English', exact: true });
    if (await englishBtn.isVisible().catch(() => false)) {
      await englishBtn.click().catch(() => {});
      // small sanity check (don’t fail test if not present)
      await page.getByRole('menuitem', { name: 'Home' }).isVisible().catch(() => {});
    }

    // --- Login ---
    const loginOld = page.getByRole('button', { name: 'Login OLD' });
    await loginOld.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(80);
    await loginOld.click({ timeout: 15000 });

    await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: 'Sign in', exact: true }).click(),
    ]);

    // --- My Complaints ---
    const myComplaints = page.getByRole('button', { name: 'My Complaints' });
    await myComplaints.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(80);
    await myComplaints.click({ timeout: 15000 });

    // --- Submit a Complaint (disambiguated to the real <button>) ---
    const submitBtn = page
      .locator('#controllableTabContainer1')
      .getByRole('button', { name: 'Submit a Complaint', exact: true });

    await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
    await submitBtn.click();

    // --- Create Complaint form ---
    await expect(page.getByRole('heading', { name: 'Create Complaint' })).toBeVisible();

    await page.getByRole('combobox', { name: 'Entity *' }).click();
    await page.getByText('Ad Dhahirah Governorate').click();

    await page.getByRole('combobox', { name: 'Service catalogue *' }).click();
    await page.getByText('Advertisement License Cancel').click();

    await page.getByRole('combobox', { name: 'Complaint Type *' }).click();
    await page.getByText('General compalint').click();

    await page.getByLabel('Complaint catalogue').selectOption(user.catalogueId);

    await page.getByRole('combobox', { name: 'Governorate *' }).click();
    await page.getByText(user.governorate).click();

    await page.getByRole('combobox', { name: 'Wilayat *' }).click();
    await page.getByText(user.wilayat).click();

    await page.getByRole('combobox', { name: 'Village' }).click();
    await page.getByText(user.village).click();

    await page.locator('.form-control.mx-textarea-input.mx-textarea-noresize').fill(user.details);

    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'OK' }).click();

    // (Optional) Quick verify: ensure we’re back in My Complaints
    await myComplaints.isVisible().catch(() => {});
  } finally {
    await context.close();
  }
}
