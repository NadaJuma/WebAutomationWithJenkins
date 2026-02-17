import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Tajawob - Suggestions', () => {
  test('Submit a suggestion', async ({ page }) => {
    const username = process.env.TAJAWOB_USER4!;
    const password = process.env.TAJAWOB_PASS4!;

    // File path for upload
    const filePath = path.resolve(
  process.cwd(),
  'tests/fixtures/Edit_Request_Test_Scenarios.xlsx'
);

    await page.goto('https://stg.tajawob.om/p/home');

    await page.getByRole('button', { name: 'Login OLD' }).click();

    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await page.getByRole('button', { name: 'Submit a Suggestion', exact: true }).click();

    // Entity
    await page.locator('#downshift-0-toggle-button svg').click();
    await page.getByRole('combobox', { name: 'Entity *' }).fill('minstry of');
    await page.getByText('Ministry of information').click();

    // Service catalogue
    await page.getByRole('combobox', { name: 'Service catalogue *' }).click();
    await page.getByText('Cinema film permit.').click();

    // Location fields
    await page.getByRole('combobox', { name: 'Governorate *' }).click();
    await page.getByText('Ad Dhahirah').click();

    await page.getByRole('combobox', { name: 'Wilayat *' }).click();
    await page.getByText('Ibri').click();

    await page.getByRole('combobox', { name: 'Village' }).click();
    await page.getByText('Al-Bidah').click();

    // Suggestion text
    await page.getByRole('textbox', { name: 'The field allows a maximum of' }).fill('terwetwt');

    // Google maps (fragile part)
    await page.getByRole('textbox', { name: 'Search Google Maps' }).fill('muscat');
    await page.getByText('Oman', { exact: true }).click();
    await page.locator('.gm-style > div > div:nth-child(2) > div > div:nth-child(3) > div').click();

    // Upload attachment
    //await page.setInputFiles('input[type="file"]', filePath);

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    // Confirmation
    await page.getByRole('button', { name: 'OK' }).click();

    // Optional: add an assertion if there's a success message or reference number
    // await expect(page.getByText(/Success|Submitted|Reference/i)).toBeVisible();
  });
});
