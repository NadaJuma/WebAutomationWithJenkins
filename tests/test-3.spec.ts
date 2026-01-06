// tests/no-id-duplication.spec.ts
import { test, expect, type Browser } from '@playwright/test';

type User = { username: string; password: string; name: string };

const users: User[] = [
  { name: 'user1', username: 'nada1', password: 'V*!m@KB518' },
  { name: 'user2', username: 'nada2', password: 'V*!m@KB518' },
  { name: 'user3', username: 'nada3', password: 'V*!m@KB518' },
];

const CMP_PATTERN = /^CMP\d{6}\d{4}$/; // e.g., CMP2511060068

const norm = (ids: string[]) =>
  ids.map(s => s.trim().toUpperCase()).filter(s => CMP_PATTERN.test(s));

const overlapList = (s1: Set<string>, s2: Set<string>) =>
  [...s1].filter(x => s2.has(x));

test('No ID duplication within or across users (desktop/table only)', async ({ browser }) => {
  const results = await Promise.all(users.map(u => collectComplaintIdsForUser(browser, u)));

  // Normalize per user
  const perUserIds: Record<string, string[]> = Object.fromEntries(
    results.map(({ user, ids }) => [user.name, norm(ids)])
  );

  // 1) No duplicates within each user
  for (const [userName, ids] of Object.entries(perUserIds)) {
    const set = new Set(ids);
    expect.soft(set.size, `Intra-user duplicates for ${userName}: ${ids}`).toBe(ids.length);
  }

  // 2) No overlap across users (log exact overlaps)
  const [A, B, C] = ['user1', 'user2', 'user3'].map(n => new Set(perUserIds[n] || []));
  const ab = overlapList(A, B);
  const ac = overlapList(A, C);
  const bc = overlapList(B, C);

  // Attach overlaps for easy debugging in the report
  test.info().attach('overlaps.json', {
    body: Buffer.from(JSON.stringify({ AB: ab, AC: ac, BC: bc }, null, 2), 'utf-8'),
    contentType: 'application/json',
  });

  expect.soft(ab.length, `Overlap between user1 and user2: ${ab.join(', ') || 'none'}`).toBe(0);
  expect.soft(ac.length, `Overlap between user1 and user3: ${ac.join(', ') || 'none'}`).toBe(0);
  expect.soft(bc.length, `Overlap between user2 and user3: ${bc.join(', ') || 'none'}`).toBe(0);

  // Also attach the per-user IDs for traceability
  test.info().attach('perUserIds.json', {
    body: Buffer.from(JSON.stringify(perUserIds, null, 2), 'utf-8'),
    contentType: 'application/json',
  });
});

/** Open a fresh context, login, go to "My Complaints", and extract complaint IDs (table view). */
async function collectComplaintIdsForUser(browser: Browser, user: User) {
  const context = await browser.newContext(); // isolated session
  const page = await context.newPage();

  try {
    await page.goto('https://stg.tajawob.om/p/home', { waitUntil: 'domcontentloaded' });

    // Optional: switch to English quietly if present
    const englishBtn = page.getByRole('button', { name: /^English$/, exact: true });
    if (await englishBtn.isVisible().catch(() => false)) {
      await englishBtn.click().catch(() => {});
    }

    // Login
    await page.getByRole('button', { name: 'Login OLD' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: /^Sign in$/ }).click(),
    ]);

    // My Complaints (desktop)
    const myComplaints = page.getByRole('button', { name: 'My Complaints' });
    await myComplaints.click();

    // Wait for the datagrid body (table)
    const gridBody = page.locator('.widget-datagrid-grid-body').first();
    await gridBody.waitFor({ state: 'visible', timeout: 15000 });

    // Extract IDs from first column cells
    const ids = await extractComplaintIdsFromTable(page);

    return { user, ids };
  } finally {
    await context.close().catch(() => {});
  }
}

/** Extract complaint IDs from the table’s first column; strict fallback regex for CMP IDs only. */
async function extractComplaintIdsFromTable(page: import('@playwright/test').Page): Promise<string[]> {
  // First column “Complaint ID”
  const idCells = page.locator('.widget-datagrid-grid-body .td[data-position^="0,"] .td-text');
  const count = await idCells.count();

  if (count > 0) {
    const ids = (await idCells.allInnerTexts()).map(s => s.trim());
    const cleaned = ids.filter(s => CMP_PATTERN.test(s));
    if (cleaned.length) return unique(cleaned);
  }

  // Fallback: scan page text but keep only CMP-style tokens
  const blob = (await page.locator('body').allInnerTexts()).join('\n');
  const tokens = blob.split(/\s+/).map(s => s.trim().toUpperCase());
  const onlyCmp = tokens.filter(t => CMP_PATTERN.test(t));
  return unique(onlyCmp);
}

function unique(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter(x => (seen.has(x) ? false : (seen.add(x), true)));
}
