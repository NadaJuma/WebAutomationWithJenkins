import { test, expect } from '@playwright/test';

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

test.describe.parallel('Submit complaints for 3 users in English mode', () => {
  for (const user of users) {
    test(`Complaint submission for ${user.username}`, async ({ page }) => {
      await page.goto('https://stg.tajawob.om/p/home');
     


// Ensure app is in English (inline, no separate function)
const englishBtn = page.getByRole('button', { name: 'English', exact: true });

// Wait briefly for it to exist; ignore if it never shows up
await englishBtn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});

// If visible, click and verify language switched via a stable EN-only element
if (await englishBtn.isVisible().catch(() => false)) {
  await englishBtn.click();

  // Prefer a concrete UI signal that indicates English is active:
  await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible({ timeout: 5000 });
  // If your app doesn’t have that, you can check <html lang="en"> as a fallback:
  // await expect.poll(async () => (await page.evaluate(() => document.documentElement.lang || '')).toLowerCase().startsWith('en')).toBe(true);
}

 const loginOld = page.getByRole('button', { name: 'Login OLD' });
 // ensure present, scroll into view (works for web & mobile), then click

await loginOld.scrollIntoViewIfNeeded();
await page.waitForTimeout(80); // brief settle for layout/keyboard
await loginOld.click({ timeout: 15000 });



     /* await page.getByRole('button', { name: 'Login OLD' }).click(); */
      await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
      await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const MyComplaint = page.getByRole('button', { name: 'My Complaints' });     
 await MyComplaint.scrollIntoViewIfNeeded();
await page.waitForTimeout(80);
await MyComplaint.click();
    /*  await page.getByRole('button', { name: 'My Complaints' }).click();
      await page.getByRole('button', { name: 'Submit a Complaint', exact: true }).click(); */

const submitBtn = page
  .locator('#controllableTabContainer1')
  .getByRole('button', { name: 'Submit a Complaint', exact: true });

await submitBtn.scrollIntoViewIfNeeded();
await submitBtn.click();


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
    });
  }
});