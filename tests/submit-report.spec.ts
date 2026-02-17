import { test, expect } from '@playwright/test';

test.describe('Tajawob - Reports', () => {
  test('Submit a Report', async ({ page }) => {
    const username = process.env.TAJAWOB_USER3!;
    const password = process.env.TAJAWOB_PASS3!;

    // -----------------------
    // Arrange: open app & login
    // -----------------------
    await page.goto('https://stg.tajawob.om/p/home');
    await page.getByRole('button', { name: 'Login OLD' }).click();

    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

   
  

    // -----------------------
    // Act: switch language + go to reports
    // -----------------------
   
    await page.getByRole('button', { name: 'My Reports' }).click();
    await page.getByRole('button', { name: 'Submit a Report', exact: true }).click();

    // Assert form opened
    await expect(page.getByRole('combobox', { name: 'Entity *' })).toBeVisible();

    // -----------------------
    // Act: fill report form
    // -----------------------
    await selectFromCombobox(page, 'Entity *', 'mi', 'Ministry of information');

    await page.getByRole('combobox', { name: 'Report Classification *' }).click();
    await page.getByText('Content Issue(Oman daily ,or').click();

    await page.getByRole('combobox', { name: 'Report Type *' }).click();
    await page.getByText('Bias Complaint').click();

    await page.getByRole('combobox', { name: 'Governorate *' }).click();
    await page.getByText('Dhofar').click();

    await page.getByRole('combobox', { name: 'Wilayat *' }).click();
    await page.getByText('Taqah').click();

    await page.getByRole('combobox', { name: 'Village' }).click();
    await page.getByText('Addamar').click();

    await page.getByRole('textbox', { name: 'The field allows a maximum of' })
      .fill('eeeeeeeeeeeeeeeeeeeeeeeeeeee');

    // -----------------------
    // Act: map search + select point (fragile area)
    // -----------------------
    await page.getByRole('textbox', { name: 'Search Google Maps' }).fill('dhofar');
    await page.getByText('Dhofar Governorate').click();

    // Wait a bit for map to render tiles/marker layer
    await page.waitForTimeout(800);
    await page.locator('.gm-style').click({ position: { x: 200, y: 200 } });

    // -----------------------
    // Act: submit + confirm
    // -----------------------
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    // -----------------------
    // Assert: success dialog
    // -----------------------
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // Optional: ensure we returned to reports list
    await page.getByRole('button', { name: 'My Reports' }).click();
    await expect(page.getByText(/My Reports/i)).toBeVisible();
  });
});

/**
 * Helper: Select value from a combobox that supports typing + selecting from list
 */
async function selectFromCombobox(page: any, label: string, query: string, optionText: string) {
  // Some comboboxes are implemented by downshift; open then type
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('combobox', { name: label }).fill(query);
  await page.getByText(optionText).click();
}
