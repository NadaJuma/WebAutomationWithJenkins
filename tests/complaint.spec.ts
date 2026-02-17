import { test, expect } from '@playwright/test';

test('Submit complaint (enhanced) @smoke', async ({ page }) => {
  // Base navigation
  await test.step('Open home page', async () => {
    await page.goto('https://stg.tajawob.om/p/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/p\/home/);
  });

  // Login
  await test.step('Login (OLD)', async () => {
    await page.getByRole('button', { name: 'Login OLD' }).click();

    await page.getByRole('textbox', { name: 'Username' }).fill('nada1');
    await page.getByRole('textbox', { name: 'Password' }).fill('V*!m@KB518');

    await Promise.all([
      // If login triggers navigation or network activity, this helps stabilize
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: 'Sign in', exact: true }).click(),
    ]);

    // Assert login success (pick one stable indicator)
    await expect(page.getByRole('button', { name: 'My Complaints' })).toBeVisible({ timeout: 15000 });
  });

  // Navigate to Submit Complaint
  await test.step('Go to Submit a Complaint', async () => {
    await page.getByRole('button', { name: 'My Complaints' }).click();
    await expect(page.getByRole('button', { name: 'Submit a Complaint', exact: true }))
      .toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Submit a Complaint', exact: true }).click();

    // Optional: assert the form opened (use any stable label/heading from your UI)
    await expect(page.getByRole('combobox', { name: 'Entity *' })).toBeVisible({ timeout: 15000 });
  });

  // Fill the complaint form
  await test.step('Fill complaint form', async () => {
    await page.getByRole('combobox', { name: 'Entity *' }).click();
    await page.getByText('Ash Sharqiyah South', { exact: true }).click();

    await page.getByRole('combobox', { name: 'Service catalogue *' }).click();
    await page.getByRole('option', { name: 'Renewal of lease contract' }).click();

    await page.getByRole('combobox', { name: 'Complaint Type *' }).click();
    await page.getByText('General compalint', { exact: true }).click();

    await page.getByLabel('Complaint catalogue').selectOption('155092712167572628');

    await page.getByRole('combobox', { name: 'Governorate *' }).click();
    await page.getByText('Ash Sharqiyah North', { exact: true }).click();

    await page.getByRole('combobox', { name: 'Wilayat *' }).click();
    await page.getByRole('option', { name: 'Ibra' }).click();

    await page.getByRole('combobox', { name: 'Village' }).click();
    await page.getByRole('option', { name: 'Al-Haymah' }).click();

    const desc = page.getByRole('textbox', { name: 'The field allows a maximum of' });
    await desc.fill(`hghfhf-${Date.now()}`); // unique text reduces collisions/flakiness

    const mapsSearch = page.getByRole('textbox', { name: 'Search Google Maps' });
    await mapsSearch.fill('ibra');

    // If map results can be slow, wait for the result text
    await expect(page.getByText('Oman')).toBeVisible({ timeout: 15000 });
    await page.getByText('Oman').click();
  });

  // Submit + confirm
  await test.step('Submit and confirm', async () => {
    await page.getByRole('button', { name: 'Submit' }).click();

    // Confirm dialog
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Yes' }).click();

    // Success dialog
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'OK' }).click();
  });

  // Post-condition: back to complaints list
  await test.step('Verify we are back on My Complaints', async () => {
    await page.getByRole('button', { name: 'My Complaints' }).click();

    // Put an assertion that confirms the list page is loaded.
    // Replace with a stable element on that page (table heading, filter, etc.)
    await expect(page.getByRole('button', { name: 'Submit a Complaint', exact: true }))
      .toBeVisible({ timeout: 15000 });
  });
});
