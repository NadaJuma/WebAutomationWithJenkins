// tests/submit-complaints-single.spec.ts
import { test, expect, type Browser, type Page } from '@playwright/test';

const users = [
 /* {
    username: 'nada1',
    password: 'V*!m@KB518',
    details: 'aaaaaaaaaaaaaaaaaaaaaa',
    catalogueId: '155092712167571616',
    governorate: 'Muscat',
    wilayat: 'Al Seeb',
    village: 'Al Koudh',
  },*/
  {
    username: 'nada2',
    password: 'V*!m@KB518',
    details: 'bbbbbbbbbbbbbbbbbbbbbb',
    catalogueId: '155092712167571616',
    governorate: 'Al Buraymi',
    wilayat: 'As Sunainah',
    village: 'Al-Awida',
  }
 /* {
    username: 'nada3',
    password: 'V*!m@KB518',
    details: 'cccccccccccccccccccccc',
    catalogueId: '155092712167571616',
    governorate: 'Al Batinah North',
    wilayat: 'Liwa',
    village: 'Abu Afan',
  },*/
];

// ✅ CHANGE #1: stronger helper to enforce English (retries + wait for stability)
async function ensureEnglish(page: Page) {
  const englishBtn = page.getByRole('button', { name: 'English', exact: true });

  for (let i = 0; i < 3; i++) {
    const visible = await englishBtn.isVisible().catch(() => false);
    if (!visible) return;

    await englishBtn.click().catch(() => {});
    // wait a bit for language to apply / rerender
    await page.waitForTimeout(400);

    // if Home appears in English, we are good (soft check)
    const homeMenu = page.getByRole('menuitem', { name: 'Home' });
    const ok = await homeMenu.isVisible().catch(() => false);
    if (ok) return;
  }
}

test('Submit complaints for 3 users (single test, parallel contexts)', async ({ browser }) => {
  await Promise.all(users.map((user) => runFlowForUser(browser, user)));
});

async function runFlowForUser(browser: Browser, user: typeof users[number]) {
  // ✅ CHANGE #2 (MOST IMPORTANT): force English at context level
  const context = await browser.newContext({
    locale: 'en-US',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const page = await context.newPage();

  // ✅ CHANGE #3: re-apply English after every main navigation (login sometimes switches to Arabic)
  page.on('framenavigated', async (frame) => {
    if (frame === page.mainFrame()) {
      await ensureEnglish(page).catch(() => {});
    }
  });

  try {
    await page.goto('https://stg.tajawob.om/p/home', { waitUntil: 'domcontentloaded' });

    // ✅ CHANGE #4: ensure English before login
    await ensureEnglish(page);

    // --- Login ---
    const loginOld = page.getByRole('button', { name: 'Login OLD' });
    await loginOld.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(150);
    await loginOld.click({ timeout: 15000 });

    // (fields should exist regardless of language if placeholders are stable; otherwise we’ll handle later)
    await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(user.password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: 'Sign in', exact: true }).click(),
    ]);

    // ✅ CHANGE #5: ensure English right after login
    await ensureEnglish(page);

    // --- My Complaints ---
    const myComplaints = page.getByRole('button', { name: 'My Complaints' });
    await myComplaints.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(150);
    await myComplaints.click({ timeout: 15000 });

    // --- Submit a Complaint ---
    const submitBtn = page
      .locator('#controllableTabContainer1')
      .getByRole('button', { name: 'Submit a Complaint', exact: true });

    await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
    await submitBtn.click({ timeout: 15000 });

    // --- Create Complaint form ---
    await expect(page.getByRole('heading', { name: 'Create Complaint' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('combobox', { name: 'Entity *' }).click();
    await page.getByText('Ministry of information').click();

    await page.getByRole('combobox', { name: 'Service catalogue *' }).click();
    await page.getByText('Get a Permit to Hold a Local Book Fair').click();

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

    await page.getByRole('button', { name: 'Submit' }).click({ timeout: 15000 });
    await page.getByRole('button', { name: 'Yes' }).click({ timeout: 15000 });
    await page.getByRole('button', { name: 'OK' }).click({ timeout: 15000 });

    // soft verify
    await myComplaints.isVisible().catch(() => {});
  } finally {
    await context.close().catch(() => {});
  }
}
