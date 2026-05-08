import { expect, test } from "@playwright/test";

test("analyzes a SMILES query and runs docking", async ({ page }) => {
  await page.goto("/cheminformatics-workbench/");
  await expect(
    page.getByRole("heading", { name: "Cheminformatics Workbench" }),
  ).toBeVisible();
  await page.getByLabel("SMILES").fill("CC(=O)Oc1ccccc1C(=O)O");
  await page.getByRole("button", { name: "Analyze" }).click();
  await expect(page.getByText("Molecular weight")).toBeVisible();
  await expect(page.getByText("Bioactivity")).toBeVisible();
  await page.getByRole("button", { name: "Score pocket" }).click();
  await expect(page.getByText("Estimated affinity")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Star on GitHub/ }),
  ).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/cheminformatics-workbench",
  );
});
