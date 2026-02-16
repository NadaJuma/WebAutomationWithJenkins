import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://stg.tajawob.om/p/home');
  }

  async loginOld(username: string, password: string) {
    await this.page.getByRole('button', { name: 'Login OLD' }).click();

    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);

    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();

   
    
  }
}
