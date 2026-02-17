import { Page, expect } from "@playwright/test";

export async function selectFromCombobox(
  page: Page,
  label: string,
  query: string,
  optionText: string
) {
  const cb = page.getByRole("combobox", { name: label });
  await cb.click();
  await cb.fill(query);
  await page.getByText(optionText).click();
  await expect(cb).toHaveValue(/.+/); // basic sanity (optional)
}
