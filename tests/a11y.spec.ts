import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility tests', () => {
  test(`for Map view`, async ({ page }) => {
    await page.goto('http://localhost:1234');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test(`for List view`, async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.getByRole('button', { name: 'List' }).click();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test(`for Timeline view`, async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.getByRole('button', { name: 'Timeline' }).click();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
