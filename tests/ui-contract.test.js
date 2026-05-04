const assert = require("node:assert/strict");
const test = require("node:test");

const {
  analytics,
  assertInOrder,
  assertIncludes,
  assertNotIncludes,
  css,
  fs,
  html,
  paths,
  script
} = require("./context");

const officialCriteriaUrl = "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html";

test("page uses production external assets, not visible fixture copy", () => {
  assertNotIncludes(html, "Fixture checks");
  assertNotIncludes(html, "Passing (");
  assertIncludes(html, '<link rel="stylesheet" href="styles.css">');
  assertIncludes(html, '<script src="app.js" defer></script>');
  assert.equal(html.includes("<style>"), false);
  assert.equal(Boolean(html.match(/<script>\s*[\s\S]*?\s*<\/script>/)), false);
  assertIncludes(script, "globalThis.CRS_DASHBOARD = api");
});

test("Google Analytics is configured as an external script", () => {
  assertIncludes(html, '<script src="analytics.js"></script>');
  assertIncludes(html, '<script async src="https://www.googletagmanager.com/gtag/js?id=G-513EMLKBMX"></script>');
  assertIncludes(analytics, 'const GA_MEASUREMENT_ID = "G-513EMLKBMX";');
  assertIncludes(analytics, "globalThis.dataLayer = globalThis.dataLayer || [];");
  assertIncludes(analytics, 'globalThis.gtag("config", GA_MEASUREMENT_ID);');
});

test("official source links are safe, visible, and section-specific", () => {
  ["core", "spouse", "skill", "extra"].forEach((hash) => {
    assertIncludes(html, `href="${officialCriteriaUrl}#${hash}"`);
  });
  assertIncludes(html, 'target="_blank" rel="noopener noreferrer"');
  assertIncludes(html, 'class="factor-source-link"');
  assertIncludes(html, 'data-source-tooltip="Official source: Core"');
  assertIncludes(html, 'data-source-tooltip="Official source: Skill"');
  assertIncludes(html, 'data-source-tooltip="Official source: Additional"');
  assertIncludes(html, 'data-source-tooltip="Official source: Spouse"');
  assertNotIncludes(html, "ⓘ");
  assertNotIncludes(html, ">source</a>");
  assert.equal(fs.existsSync(paths.sourceIcon), true);
  assert.equal(fs.existsSync(paths.sourceIconBlue), true);
  assertIncludes(css, 'background: url("assets/link-outline.svg")');
  assertIncludes(css, 'background-image: url("assets/link-outline-blue.svg");');
  assertIncludes(css, "content: attr(data-source-tooltip);");
});

test("left rail follows official CRS section order", () => {
  assertInOrder(html, [
    '<span class="factor-title-text">Marital status</span>',
    '<span class="factor-title-text">Age</span>',
    '<span class="factor-title-text">Education</span>',
    '<span class="factor-title-text">Official languages</span>',
    '<span class="factor-title-text">Canadian skilled work</span>',
    '<span class="factor-title-text">Spouse or partner factors</span>',
    '<span class="factor-title-text">Skill transferability</span>',
    '<span class="factor-title-text">Additional points</span>'
  ], "official factor order");

  const skillIndex = html.indexOf('<span class="factor-title-text">Skill transferability</span>');
  const certificateIndex = html.indexOf('data-field="certificate"');
  const additionalIndex = html.indexOf('<span class="factor-title-text">Additional points</span>');
  assert.ok(skillIndex < certificateIndex && certificateIndex < additionalIndex);
  assertNotIncludes(html, '<span class="factor-title-text">Work experience</span>');
  assertNotIncludes(html, '<span class="factor-title-text">Additional factors</span>');
  assertNotIncludes(html, 'aria-label="Open Canada.ca CRS criteria source for spouse Canadian work"');
  assertNotIncludes(html, 'aria-label="Open Canada.ca CRS criteria source for foreign skilled work"');
  assertNotIncludes(html, 'aria-label="Open Canada.ca CRS criteria source for certificate of qualification"');
});

test("skill transferability controls keep the compact production layout", () => {
  assertIncludes(html, '<div class="skill-transferability-controls">');
  assertIncludes(html, '<div class="skill-transferability-item foreign-work-panel">');
  assertIncludes(html, '<div class="work-grid foreign-work-grid" id="foreignWorkControls"></div>');
  assertIncludes(html, '<div class="skill-transferability-item certificate-item">');
  assertIncludes(html, '<span>Certificate of qualification</span>');
  assertIncludes(html, '<span>(Trade occupations)</span>');
  assertNotIncludes(html, '<div class="language-panel certificate-panel">');
  assertNotIncludes(html, "<small>Total years</small>");
  assertNotIncludes(html, "Education, foreign work and trade certificate combinations");

  assertIncludes(css, "grid-template-columns: minmax(0, 1fr) max-content;");
  assertIncludes(css, "align-items: stretch;");
  assertIncludes(css, ".foreign-work-panel");
  assertIncludes(css, "grid-template-columns: repeat(4, minmax(0, 1fr));");
  assertIncludes(css, ".certificate-switch-grid");
  assertIncludes(css, "height: 100%;");
  assertIncludes(css, ".certificate-switch-text");
  assertIncludes(css, "gap: 4px;");
});

test("dashboard controls expose mobile dropdown alternatives", () => {
  assertIncludes(html, 'id="maritalStatus" data-field="maritalStatus"');
  assertIncludes(html, 'id="ageMobile" data-field="age"');
  assertIncludes(html, 'id="canadianWorkMobile" data-field="canadianWork"');
  assertIncludes(html, 'id="foreignWorkMobile" data-field="foreignWork"');
  assertIncludes(html, 'id="spouseCanadianWorkMobile" data-field="spouseCanadianWork"');
  assertIncludes(css, "@media (max-width: 900px)");
  assertIncludes(css, ".mobile-button-select {\n    display: block;");
  assertIncludes(css, ".view-toggle {\n    display: none;");
  assertIncludes(css, ".polygon-view {\n    display: none !important;");
});

test("second language and spouse language sections have expected dashboard markup", () => {
  assertIncludes(html, 'data-language-group="second" data-hide-when-no-test hidden');
  assertIncludes(html, '<div class="ability-grid" data-language-group="spouse">');
  assertIncludes(css, ".ability-grid[hidden]");
  assertIncludes(script, 'group.hasAttribute("data-hide-when-no-test")');
  assertNotIncludes(script, 'group.dataset.hideWhenNoTest === "true"');
});

test("reset, theme, storage, and score-opportunity controls remain wired", () => {
  assertInOrder(html, ['id="resetButton"', 'id="viewToggle"', 'id="themeToggle"'], "topbar action order");
  assertIncludes(html, 'aria-label="Reset all factors to the default profile"');
  assertIncludes(script, 'document.getElementById("resetButton").addEventListener("click"');
  assertIncludes(script, "state = cloneState(DEFAULT_STATE);");
  assertIncludes(script, "localStorage.removeItem(STORAGE_KEY);");
  assertIncludes(script, "let shouldPersistState = false;");
  assertIncludes(script, "function markStateChangedForPersistence()");
  assertIncludes(script, "if (shouldPersistState) {\n      persistState(result);\n    }");
  assertIncludes(html, "Score Opportunities");
  assertIncludes(html, "Provincial or territorial nomination adds 600 CRS points");
  assertIncludes(html, 'id="opportunityAgeNote" hidden');
});
