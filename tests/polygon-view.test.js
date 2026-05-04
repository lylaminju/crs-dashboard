const assert = require("node:assert/strict");
const test = require("node:test");

const {
  api,
  assertIncludes,
  assertNotIncludes,
  css,
  html,
  script
} = require("./context");

const {
  easePolygonMorph,
  interpolatePolygonPoints,
  normalizeThemeMode,
  normalizeViewMode,
  nextThemeMode,
  polygonAbilityLabel,
  polygonEditorControls,
  polygonFactors,
  scoreDigitSequence,
  scoreDigitShouldRoll,
  scoreProfile,
  themeModeIcon
} = api;

test("theme mode single-button cycle remains stable", () => {
  assertIncludes(html, 'id="themeToggle"');
  assertIncludes(html, 'aria-label="Theme: System. Click to switch theme."');
  assertIncludes(html, '>◐</button>');
  assertIncludes(html, 'data-theme-mode="system"');
  assertNotIncludes(html, 'data-theme-mode="light"');
  assertNotIncludes(html, 'data-theme-mode="dark"');
  assert.equal(normalizeThemeMode("auto"), "system");
  assert.equal(normalizeThemeMode("light"), "light");
  assert.equal(nextThemeMode("system"), "light");
  assert.equal(nextThemeMode("light"), "dark");
  assert.equal(nextThemeMode("dark"), "system");
  assert.equal(themeModeIcon("system"), "⚙");
  assert.equal(themeModeIcon("light"), "☀");
  assert.equal(themeModeIcon("dark"), "☾");
});

test("score roller changes only changing digits", () => {
  assert.deepEqual(scoreDigitSequence("1", "4"), ["1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "4"]);
  assert.equal(scoreDigitShouldRoll("411", "423", 0), false);
  assert.equal(scoreDigitShouldRoll("411", "423", 1), true);
  assert.equal(scoreDigitShouldRoll("411", "423", 2), true);
});

test("polygon view markup and URL routing hooks exist", () => {
  assertIncludes(html, 'id="polygonView"');
  assertIncludes(html, 'id="scorePolygon"');
  assertIncludes(html, 'viewBox="0 0 760 540"');
  assertIncludes(html, 'id="polygonEditors"');
  assertIncludes(html, 'id="polygonMaritalStatus"');
  assertIncludes(html, "<foreignObject");
  assertNotIncludes(html, "polygon-legend");
  assertNotIncludes(html, "Score polygon");
  assertNotIncludes(html, "Factor shape");
  assertIncludes(script, 'url.searchParams.set("view", POLYGON_VIEW)');
  assertIncludes(script, "renderPolygonMaritalControl();");
  assertIncludes(script, 'const MOBILE_POLYGON_QUERY = "(max-width: 900px)"');
  assertIncludes(css, 'body[data-view="polygon"] .controls');
  assertIncludes(css, 'body[data-view="polygon"] .dashboard');
  assert.equal(normalizeViewMode("other"), "dashboard");
  assert.equal(normalizeViewMode("polygon"), "polygon");
});

test("polygon factors adapt to spouse path", () => {
  const single = scoreProfile(api.DEFAULT_STATE);
  const spouse = scoreProfile({ ...api.DEFAULT_STATE, maritalStatus: "spouse-accompanying" });

  assert.equal(polygonFactors(single).some((factor) => factor.label === "Languages"), true);
  assert.equal(polygonFactors(single).some((factor) => factor.label === "Additional"), true);
  assert.equal(polygonFactors(single).some((factor) => factor.label === "Spouse factors"), false);
  assert.equal(polygonFactors(spouse).some((factor) => factor.label === "Spouse factors"), true);
  assert.deepEqual(
    polygonFactors(spouse).map((factor) => factor.key),
    ["age", "education", "languages", "canadianWork", "additional", "spouse", "transferability"]
  );
});

test("polygon editors expose full CRS input paths", () => {
  assertIncludes(polygonEditorControls("age"), 'data-polygon-field="age"');
  assertIncludes(polygonEditorControls("age"), 'aria-label="Age"');
  assertNotIncludes(polygonEditorControls("age"), "<label");
  assertIncludes(polygonEditorControls("education"), 'aria-label="Education"');
  assertNotIncludes(polygonEditorControls("education"), "<label");
  ["firstListening", "firstReading", "firstWriting", "firstSpeaking"].forEach((field) => {
    assertIncludes(polygonEditorControls("languages"), `data-polygon-field="${field}"`);
  });
  assertNotIncludes(polygonEditorControls("languages"), "CLB");
  assert.equal(polygonAbilityLabel("Listening"), "L");
  assertIncludes(script, 'polygonLanguageControls("second", "Second test", secondOfficialLanguageTestOptions(state))');
  assertIncludes(script, 'polygonLanguageControls("spouse", "Language test", OPTIONAL_LANGUAGE_TEST_OPTIONS)');
  assertIncludes(polygonEditorControls("transferability"), 'data-polygon-field="foreignWork"');
  assertIncludes(polygonEditorControls("additional"), 'data-polygon-field="nomination"');
});

test("polygon animation helpers interpolate deterministically", () => {
  assert.equal(easePolygonMorph(0), 0);
  assert.equal(easePolygonMorph(1), 1);
  assert.deepEqual(
    interpolatePolygonPoints([{ x: 0, y: 0 }], [{ x: 10, y: 20 }], 0.5),
    [{ x: 5, y: 10 }]
  );
});
