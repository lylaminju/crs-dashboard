const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "index.html");
const cssPath = path.join(__dirname, "styles.css");
const jsPath = path.join(__dirname, "app.js");
const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const script = fs.readFileSync(jsPath, "utf8");

new Function(script)();

const {
  DEFAULT_STATE,
  scoreProfile,
  buildScenario,
  scenarioDefinitions,
  sanitizeStoredState,
  polygonFactors,
  normalizeViewMode,
  scoreDigitSequence,
  scoreDigitShouldRoll,
  interpolatePolygonPoints,
  easePolygonMorph,
  polygonEditorControls,
  polygonAbilityLabel,
  languageScoreOptions,
  secondOfficialLanguageTestOptions,
  normalizeThemeMode,
  nextThemeMode,
  themeModeIcon
} = globalThis.CRS_DASHBOARD;

const failures = [];

function fixtureState(overrides) {
  return { ...DEFAULT_STATE, ...overrides };
}

function languageFixture(prefix, test, score) {
  return {
    [`${prefix}Test`]: test,
    [`${prefix}Listening`]: score,
    [`${prefix}Reading`]: score,
    [`${prefix}Writing`]: score,
    [`${prefix}Speaking`]: score
  };
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${expected}, got ${actual}`);
  }
}

function expect(condition, label) {
  if (!condition) {
    failures.push(label);
  }
}

function componentDeltaByLabel(scenario, label) {
  const row = scenario.componentDeltas.find(([rowLabel]) => rowLabel === label);
  return row ? row[1] : 0;
}

function scenarioById(state, id) {
  return buildScenario(
    state,
    scenarioDefinitions(state).find((scenario) => scenario.id === id)
  );
}

const singleBaseline = scoreProfile(fixtureState({
  maritalStatus: "single",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "G"),
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
}));
expectEqual("singleBaseline.total", singleBaseline.total, 374);
expectEqual("singleBaseline.core", singleBaseline.breakdown.core, 349);
expectEqual("singleBaseline.spouse", singleBaseline.breakdown.spouse, 0);
expectEqual("singleBaseline.transferability", singleBaseline.breakdown.transferability, 25);
expectEqual("singleBaseline.additional", singleBaseline.breakdown.additional, 0);
expectEqual("defaultState.maritalStatus", DEFAULT_STATE.maritalStatus, "single");

const spousePathBaseline = scoreProfile(fixtureState({
  maritalStatus: "spouse-accompanying",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "G"),
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "0",
  spouseEducation: "bachelor",
  ...languageFixture("spouse", "celpip", "E"),
  spouseCanadianWork: "1",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
}));
expectEqual("spousePathBaseline.total", spousePathBaseline.total, 373);
expectEqual("spousePathBaseline.core", spousePathBaseline.breakdown.core, 323);
expectEqual("spousePathBaseline.spouse", spousePathBaseline.breakdown.spouse, 25);
expectEqual("spousePathBaseline.transferability", spousePathBaseline.breakdown.transferability, 25);
expectEqual("spousePathBaseline.additional", spousePathBaseline.breakdown.additional, 0);

const transferStart = fixtureState({
  maritalStatus: "spouse-accompanying",
  age: "25",
  education: "bachelor",
  ...languageFixture("first", "celpip", "E"),
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "0",
  spouseEducation: "lessSecondary",
  ...languageFixture("spouse", "none", "none"),
  spouseCanadianWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
});
const transferScenario = buildScenario(
  transferStart,
  scenarioDefinitions(transferStart).find((scenario) => scenario.id === "canadian-work-year")
);
expectEqual("transferabilityCanadianWorkEdge.delta", transferScenario.delta, 48);
expectEqual("transferabilityCanadianWorkEdge.canadianWork", componentDeltaByLabel(transferScenario, "Canadian work"), 35);
expectEqual("transferabilityCanadianWorkEdge.educationTransfer", componentDeltaByLabel(transferScenario, "Skill transferability: education"), 13);

const frenchStart = fixtureState({
  maritalStatus: "spouse-accompanying",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "E"),
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "0",
  spouseEducation: "lessSecondary",
  ...languageFixture("spouse", "none", "none"),
  spouseCanadianWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
});
const frenchSeven = buildScenario(
  frenchStart,
  scenarioDefinitions(frenchStart).find((scenario) => scenario.id === "french-nclc-seven")
);
const frenchNine = buildScenario(
  frenchStart,
  scenarioDefinitions(frenchStart).find((scenario) => scenario.id === "french-nclc-nine")
);
expectEqual("frenchNclcSeven.delta", frenchSeven.delta, 62);
expectEqual("frenchNclcSeven.secondLanguage", componentDeltaByLabel(frenchSeven, "Second official language"), 12);
expectEqual("frenchNclcSeven.additional", componentDeltaByLabel(frenchSeven, "Additional points"), 50);
expectEqual("frenchNclcNine.delta", frenchNine.delta, 72);
expectEqual("frenchNclcNine.secondLanguage", componentDeltaByLabel(frenchNine, "Second official language"), 22);
expectEqual("frenchNclcNine.additional", componentDeltaByLabel(frenchNine, "Additional points"), 50);

const firstLanguageClbSixStart = fixtureState({
  maritalStatus: "spouse-accompanying",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "D"),
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "1",
  spouseEducation: "lessSecondary",
  ...languageFixture("spouse", "none", "none"),
  spouseCanadianWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
});
const firstLanguageClbSeven = scenarioById(firstLanguageClbSixStart, "first-language-clb-7");
expectEqual("firstLanguageOpportunity.clbSeven.delta", firstLanguageClbSeven.delta, 58);
expectEqual("firstLanguageOpportunity.clbSeven.directLanguage", componentDeltaByLabel(firstLanguageClbSeven, "First official language"), 32);
expectEqual("firstLanguageOpportunity.clbSeven.educationTransfer", componentDeltaByLabel(firstLanguageClbSeven, "Skill transferability: education"), 13);
expectEqual("firstLanguageOpportunity.clbSeven.foreignTransfer", componentDeltaByLabel(firstLanguageClbSeven, "Skill transferability: foreign work"), 13);

expectEqual(
  "secondOfficialLanguage.englishFirstOptions",
  secondOfficialLanguageTestOptions(fixtureState({ firstTest: "celpip" })).map((option) => option.value).join(","),
  "none,tef,tcf"
);
expectEqual(
  "secondOfficialLanguage.frenchFirstOptions",
  secondOfficialLanguageTestOptions(fixtureState({ firstTest: "tef" })).map((option) => option.value).join(","),
  "none,celpip,ielts,pte"
);
const invalidSameLanguageSecond = scoreProfile(fixtureState({
  maritalStatus: "single",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "G"),
  ...languageFixture("second", "ielts", "G"),
  canadianWork: "0",
  foreignWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
}));
expectEqual("secondOfficialLanguage.invalidSameLanguageIgnored", invalidSameLanguageSecond.details.core.secondLanguage, 0);

const strategyStart = fixtureState({
  maritalStatus: "spouse-accompanying",
  age: "25",
  education: "bachelor",
  firstTest: "celpip",
  firstListening: "H",
  firstReading: "H",
  firstWriting: "G",
  firstSpeaking: "H",
  ...languageFixture("second", "none", "none"),
  canadianWork: "0",
  foreignWork: "3",
  spouseEducation: "lessSecondary",
  ...languageFixture("spouse", "none", "none"),
  spouseCanadianWork: "0",
  sibling: false,
  nomination: false,
  certificate: false,
  canadianEducation: "none"
});
expectEqual("strategy.canadianWork1", scenarioById(strategyStart, "canadian-work-year").delta, 48);
expectEqual("strategy.canadianWork2", scenarioById(strategyStart, "canadian-work-two-years").delta, 71);
expectEqual("strategy.frenchNclc7", scenarioById(strategyStart, "french-nclc-seven").delta, 62);
expectEqual("strategy.frenchNclc9", scenarioById(strategyStart, "french-nclc-nine").delta, 72);
expectEqual("strategy.firstLanguageClb10", scenarioById(strategyStart, "first-language-clb-10").delta, 3);
expectEqual("strategy.firstLanguageClb10DirectLanguage", componentDeltaByLabel(scenarioById(strategyStart, "first-language-clb-10"), "First official language"), 3);
expectEqual("strategy.canadianEducationOneTwo", scenarioById(strategyStart, "canadian-education-one-two").delta, 47);
expectEqual("strategy.canadianEducationThreePlus", scenarioById(strategyStart, "canadian-education-three-plus").delta, 62);
expectEqual("strategy.canadianMasters", scenarioById(strategyStart, "canadian-masters").delta, 69);
expectEqual("strategy.ecaTwoOrMore", scenarioById(strategyStart, "eca-two-or-more").delta, 32);
expectEqual("strategy.ecaMasters", scenarioById(strategyStart, "eca-masters").delta, 39);
expectEqual("strategy.pnp", scenarioById(strategyStart, "provincial-nomination").delta, 600);
expect(
  scenarioDefinitions({ ...strategyStart, firstWriting: "H" }).every((scenario) => !scenario.id.startsWith("first-language-clb")),
  "firstLanguageOpportunity.noCardAtClbTen"
);

const agePenaltyStart = { ...strategyStart, age: "27" };
const canadianEducationThreePlusAt27 = scenarioById(agePenaltyStart, "canadian-education-three-plus");
expectEqual("agePenalty.canadianEducationThreePlus.delta", canadianEducationThreePlusAt27.delta, 57);
expectEqual("agePenalty.canadianEducationThreePlus.age", componentDeltaByLabel(canadianEducationThreePlusAt27, "Age"), -5);

const agePenaltyAt30 = { ...strategyStart, age: "30" };
const canadianMastersAt30 = scenarioById(agePenaltyAt30, "canadian-masters");
expectEqual("agePenalty.canadianMasters.delta", canadianMastersAt30.delta, 59);
expectEqual("agePenalty.canadianMasters.age", componentDeltaByLabel(canadianMastersAt30, "Age"), -10);

const sortedStrategyDeltas = scenarioDefinitions(strategyStart)
  .map((definition) => buildScenario(strategyStart, definition))
  .filter((scenario) => scenario.delta > 0)
  .sort((a, b) => b.delta - a.delta)
  .map((scenario) => scenario.delta);
expectEqual("scenarioSort.descendingFirst", sortedStrategyDeltas[0], 600);
expect(
  sortedStrategyDeltas.every((delta, index, list) => index === 0 || list[index - 1] >= delta),
  "scenarioSort.descendingOrder"
);

const additionalNomination = scoreProfile(fixtureState({
  maritalStatus: "single",
  age: "30",
  education: "bachelor",
  ...languageFixture("first", "celpip", "G"),
  nomination: true
}));
expectEqual("additionalNomination.additional", additionalNomination.breakdown.additional, 600);
expectEqual("additionalNomination.total", additionalNomination.total, 974);

const stateKeys = Object.keys(DEFAULT_STATE).join(" ").toLowerCase();
expect(!stateKeys.includes("job") && !stateKeys.includes("offer"), "jobOfferInvariant.stateKey");
expect(!JSON.stringify(scoreProfile(DEFAULT_STATE)).toLowerCase().match(/job|offer/), "jobOfferInvariant.scorePath");
expect(!html.match(/data-field="[^"]*(job|offer)/i), "jobOfferInvariant.control");

const storedState = sanitizeStoredState({
  maritalStatus: "single",
  age: "44",
  education: "masters",
  nomination: true,
  sibling: true
});
expectEqual("storageRestore.age", storedState.age, "44");
expectEqual("storageRestore.education", storedState.education, "masters");
expectEqual("storageRestore.nomination", storedState.nomination, true);
expectEqual("storageRestore.compactAgeRange", sanitizeStoredState({ age: "23" }).age, "20-25");
const storagePayload = {
  factors: storedState,
  score: scoreProfile(storedState)
};
expect(Boolean(storagePayload.factors), "storagePayload.factors");
expect(typeof storagePayload.score.total === "number", "storagePayload.score.total");

expect(!html.includes("Fixture checks"), "productionUi.fixtureCopy");
expect(!html.includes("Passing ("), "productionUi.passingLabel");
expect(html.includes('<link rel="stylesheet" href="styles.css">'), "productionUi.externalStylesheet");
expect(!html.includes("<style>"), "productionUi.noInlineStyleTag");
expect(html.includes('<script src="app.js" defer></script>'), "productionUi.externalScript");
expect(!html.match(/<script>\s*[\s\S]*?\s*<\/script>/), "productionUi.noInlineScriptTag");
expect(script.includes("globalThis.CRS_DASHBOARD = api"), "productionUi.externalScriptExportsApi");
expect(!html.includes("Desktop workspace"), "productionUi.noDesktopWorkspacePill");
expect(html.includes("Score Opportunities"), "productionUi.scoreOpportunitiesHeading");
expect(!html.includes("What-if scenarios"), "productionUi.noWhatIfHeading");
expect(script.includes('class="scenario-metrics"'), "productionUi.scenarioHeaderMetrics");
expect(script.includes('class="scenario-projected"'), "productionUi.scenarioProjectedBesideDelta");
expect(!script.includes("Projected score"), "productionUi.noProjectedScoreLabel");
expect(!script.includes("scenario-scoreline"), "productionUi.noScenarioScorelineMarkup");
expect(css.includes(".scenario-metrics"), "productionUi.scenarioMetricsStyles");
expect(!css.includes(".scenario-scoreline"), "productionUi.noScenarioScorelineCss");
expect(script.includes('["17-less", "≤17"]'), "productionUi.compactAgeSeventeenLabel");
expect(script.includes('["20-25", "20-25"]'), "productionUi.compactAgeTwentyToTwentyFiveLabel");
expect(!script.includes('["20", "20"]'), "productionUi.noIndividualAgeTwentyButton");
expect(!script.includes("17 or less"), "productionUi.noLongAgeSeventeenLabel");
expect(css.includes("grid-template-columns: repeat(8, 54px)"), "productionUi.tightAgeButtonColumns");
expect(css.includes("font-size: 12px"), "productionUi.ageFontSizeKept");
expect(html.includes('data-language-group="second" data-hide-when-no-test hidden'), "productionUi.secondLanguageHiddenByDefault");
expect(css.includes(".ability-grid[hidden]"), "productionUi.hiddenAbilityGridCssFile");
expect(html.includes('<div class="ability-grid" data-language-group="spouse">'), "productionUi.spouseLanguagePanelFormat");
expect(!html.includes('<div class="field"></div>'), "productionUi.noEmptySpouseGridSpacer");
expect(html.includes('id="viewToggle"'), "viewMode.toggleButton");
expect(html.includes('id="themeToggle"'), "themeMode.singleButton");
expect(html.includes('aria-label="Theme: System. Click to switch theme."'), "themeMode.systemDefaultAccessibleLabel");
expect(html.includes('>◐</button>'), "themeMode.systemDefaultIcon");
expect(html.includes('data-theme-mode="system"'), "themeMode.defaultButtonMode");
expect(!html.includes('data-theme-mode="light"'), "themeMode.noSeparateLightButton");
expect(!html.includes('data-theme-mode="dark"'), "themeMode.noSeparateDarkButton");
expect(script.includes('const THEME_STORAGE_KEY = "canada-crs-dashboard:theme"'), "themeMode.storageKey");
expect(script.includes("document.documentElement.dataset.theme = normalized"), "themeMode.appliesHtmlDataset");
expect(script.includes("syncThemeControls();"), "themeMode.syncsButtons");
expect(script.includes("setThemeMode(nextThemeMode(themeMode))"), "themeMode.cyclesSingleButton");
expect(script.includes("button.textContent = themeModeIcon(themeMode)"), "themeMode.usesIconText");
expect(css.includes(".theme-toggle"), "themeMode.toggleStyles");
expect(css.includes("width: 42px"), "themeMode.compactIconButton");
expect(css.includes("color: var(--white-soft);"), "themeMode.whiteScaleIconColor");
expect(css.includes('.theme-toggle[data-theme-mode="system"]'), "themeMode.systemIconSizing");
expect(css.includes('.theme-toggle[data-theme-mode="light"]'), "themeMode.lightIconSizing");
expect(css.includes('.theme-toggle[data-theme-mode="dark"]'), "themeMode.darkIconSizing");
expect(css.includes('@media (prefers-color-scheme: light)'), "themeMode.systemLightCss");
expect(css.includes(':root[data-theme="light"]'), "themeMode.lightOverrideCss");
expect(css.includes(':root[data-theme="dark"]'), "themeMode.darkOverrideCss");
expectEqual("themeMode.normalizeUnknown", normalizeThemeMode("auto"), "system");
expectEqual("themeMode.normalizeLight", normalizeThemeMode("light"), "light");
expectEqual("themeMode.nextSystem", nextThemeMode("system"), "light");
expectEqual("themeMode.nextLight", nextThemeMode("light"), "dark");
expectEqual("themeMode.nextDark", nextThemeMode("dark"), "system");
expectEqual("themeMode.iconSystem", themeModeIcon("system"), "⚙");
expectEqual("themeMode.iconLight", themeModeIcon("light"), "☀");
expectEqual("themeMode.iconDark", themeModeIcon("dark"), "☾");
expect(html.includes('id="polygonView"'), "viewMode.polygonPanel");
expect(html.includes('id="scorePolygon"'), "viewMode.polygonSvg");
expect(html.includes('viewBox="0 0 760 540"'), "viewMode.shorterPolygonSvg");
expect(html.includes('id="polygonEditors"'), "viewMode.polygonEditors");
expect(html.includes('id="polygonMaritalStatus"'), "viewMode.polygonMaritalDropdown");
expect(html.includes('data-polygon-field="maritalStatus"'), "viewMode.polygonMaritalStateField");
const svgStart = html.indexOf('<svg id="scorePolygon"');
const svgEnd = html.indexOf("</svg>", svgStart);
const polygonMarital = html.indexOf('id="polygonMaritalStatus"');
expect(svgStart !== -1 && polygonMarital > svgStart && polygonMarital < svgEnd, "viewMode.polygonMaritalInsideSvg");
expect(html.includes("<foreignObject"), "viewMode.polygonMaritalForeignObject");
expect(!html.includes("polygonLegend"), "viewMode.noPolygonLegendRenderTarget");
expect(!html.includes("polygon-legend"), "viewMode.noPolygonLegendMarkup");
expect(!css.includes("polygon-legend"), "viewMode.noPolygonLegendCss");
expect(!html.includes("Score polygon"), "viewMode.noPolygonTitleLabel");
expect(!html.includes("Factor shape"), "viewMode.noPolygonPillLabel");
expect(script.includes('url.searchParams.set("view", POLYGON_VIEW)'), "viewMode.polygonUrlRoute");
expect(script.includes("renderPolygonMaritalControl();"), "viewMode.rendersPolygonMaritalDropdown");
expect(script.includes('document.getElementById("polygonView").addEventListener("change"'), "viewMode.polygonViewChangeHandler");
expect(script.includes("syncPolygonControls();"), "viewMode.syncsPolygonControls");
expect(css.includes(".polygon-view"), "viewMode.polygonStyles");
expect(css.includes(".polygon-svg-toolbar-field"), "viewMode.polygonToolbarStyles");
expect(!html.includes('class="polygon-toolbar"'), "viewMode.noExternalPolygonToolbar");
expect(css.includes("width: 300px"), "viewMode.polygonMaritalDropdownWidth");
expect(css.includes('body[data-view="polygon"] .controls'), "viewMode.polygonHidesLeftRail");
expect(css.includes('body[data-view="polygon"] .dashboard'), "viewMode.polygonSingleColumn");
expectEqual("viewMode.normalizeUnknown", normalizeViewMode("other"), "dashboard");
expectEqual("viewMode.normalizePolygon", normalizeViewMode("polygon"), "polygon");

const polygonFactorRows = polygonFactors(singleBaseline);
expect(polygonFactorRows.some((factor) => factor.label === "Languages"), "viewMode.polygonLanguageFactor");
expect(polygonFactorRows.some((factor) => factor.label === "Additional"), "viewMode.polygonAdditionalFactor");
expect(polygonFactorRows.some((factor) => factor.key === "age"), "viewMode.polygonFactorKeys");
expect(!polygonFactorRows.some((factor) => factor.label === "Spouse factors"), "viewMode.singlePolygonNoSpouseFactor");
expect(
  polygonFactors(spousePathBaseline).some((factor) => factor.label === "Spouse factors"),
  "viewMode.spousePolygonFactor"
);
const spousePolygonKeys = polygonFactors(spousePathBaseline).map((factor) => factor.key);
expect(
  spousePolygonKeys.indexOf("transferability") < spousePolygonKeys.indexOf("spouse"),
  "viewMode.transferabilityBeforeSpouseInPolygon"
);
expect(polygonEditorControls("age").includes('data-polygon-field="age"'), "polygonEditors.ageInput");
expect(!polygonEditorControls("age").includes("<label"), "polygonEditors.ageNoRepeatedLabel");
expect(polygonEditorControls("age").includes('aria-label="Age"'), "polygonEditors.ageAccessibleSelect");
expect(!polygonEditorControls("education").includes("<label"), "polygonEditors.educationNoCredentialLabel");
expect(polygonEditorControls("education").includes('aria-label="Education"'), "polygonEditors.educationAccessibleSelect");
expect(polygonEditorControls("languages").includes('data-polygon-field="firstListening"'), "polygonEditors.firstListeningInput");
expect(polygonEditorControls("languages").includes('data-polygon-field="firstReading"'), "polygonEditors.firstReadingInput");
expect(polygonEditorControls("languages").includes('data-polygon-field="firstWriting"'), "polygonEditors.firstWritingInput");
expect(polygonEditorControls("languages").includes('data-polygon-field="firstSpeaking"'), "polygonEditors.firstSpeakingInput");
expect(!polygonEditorControls("languages").includes("CLB"), "polygonEditors.noClbInAbilityOptions");
expectEqual("polygonEditors.abbreviatedListeningLabel", polygonAbilityLabel("Listening"), "L");
expect(polygonEditorControls("languages").includes('aria-label="Listening"'), "polygonEditors.fullListeningAriaLabel");
expectEqual("polygonEditors.abilityOptionLabel", languageScoreOptions("first", "listening")[0].label, "10-12");
expect(script.includes('polygonLanguageControls("second", "Second test", secondOfficialLanguageTestOptions(state))'), "polygonEditors.secondLanguageAccuracyPath");
expect(script.includes('polygonLanguageControls("spouse", "Language test", OPTIONAL_LANGUAGE_TEST_OPTIONS)'), "polygonEditors.spouseLanguageAccuracyPath");
expect(!script.includes("data-polygon-action"), "polygonEditors.noLanguageShortcutActions");
expect(!polygonEditorControls("canadianWork").includes("<label"), "polygonEditors.canadianWorkNoYearsLabel");
expect(polygonEditorControls("canadianWork").includes('aria-label="Years"'), "polygonEditors.canadianWorkAccessibleSelect");
expect(polygonEditorControls("transferability").includes('data-polygon-field="foreignWork"'), "polygonEditors.transferabilityInput");
expect(polygonEditorControls("additional").includes('data-polygon-field="nomination"'), "polygonEditors.additionalInput");
expect(css.includes(".polygon-editor"), "polygonEditors.styles");
expect(css.includes("width: 210px"), "polygonEditors.compactVertexCards");
expect(css.includes('.polygon-editor[data-factor-key="age"]'), "polygonEditors.ageSpecificWidth");
expect(css.includes("width: 142px"), "polygonEditors.narrowAgeCard");
expect(css.includes('.polygon-editor[data-factor-key="education"]'), "polygonEditors.educationSpecificWidth");
expect(css.includes("width: 300px"), "polygonEditors.compactEducationCard");
expect(css.includes('.polygon-editor[data-factor-key="languages"]'), "polygonEditors.languageSpecificWidth");
expect(css.includes("width: 312px"), "polygonEditors.compactLanguageCard");
expect(css.includes('.polygon-editor[data-factor-key="spouse"]'), "polygonEditors.spouseSpecificWidth");
expect(css.includes("width: 312px"), "polygonEditors.compactSpouseCard");
expect(css.includes(".polygon-editor-ability-grid"), "polygonEditors.abilityGridStyles");
expect(css.includes("grid-template-columns: repeat(4, 68px)"), "polygonEditors.compactAbilityColumns");
expect(css.includes(".polygon-editor-ability-grid .polygon-editor-field select"), "polygonEditors.compactAbilitySelects");
expect(css.includes("font-size: 11px"), "polygonEditors.compactAbilityFont");
expect(css.includes(".polygon-editor-title b {\n  color: var(--white-soft);\n  font-size: 15px;"), "polygonEditors.largerTitle");
expect(css.includes(".polygon-editor-title span {\n  color: var(--blue-bright);\n  font-size: 14px;"), "polygonEditors.largerScore");
expect(css.includes(".polygon-canvas {\n  position: relative;\n  width: 100%;"), "polygonCanvas.fillsParentWidth");
expect(css.includes("aspect-ratio: 760 / 540"), "polygonCanvas.shorterAspectRatio");
expect(script.includes("const POLYGON_HEIGHT = 540"), "polygonCanvas.shorterGeometryConstant");
expect(script.includes("radius + 18"), "polygonEditors.nearVertexOffset");
expect(css.includes('.polygon-editor[data-anchor="top"] {\n  transform: translate(-50%, -100%);'), "polygonEditors.topAnchorsOutward");
expect(css.includes('.polygon-editor[data-anchor="bottom"] {\n  transform: translate(-50%, 0);'), "polygonEditors.bottomAnchorsOutward");
expect(css.includes('.polygon-editor[data-anchor="left"] {\n  transform: translate(-100%, -50%);'), "polygonEditors.leftAnchorsOutward");
expect(css.includes('.polygon-editor[data-anchor="right"] {\n  transform: translate(0, -50%);'), "polygonEditors.rightAnchorsOutward");
expect(!css.match(/\.polygon-canvas\s*\{[^}]*border:/s), "polygonCanvas.noOuterBoxBorder");
expect(script.includes("animatePolygonShape(document.getElementById(\"polygonShape\"), scorePoints)"), "polygonMorph.renderUsesAnimator");
expect(script.includes("interpolatePolygonPoints(previous, next, eased)"), "polygonMorph.interpolatesPoints");
expect(css.includes(".polygon-shape.is-morphing"), "polygonMorph.morphingCssState");
expect(css.includes("filter 620ms cubic-bezier"), "polygonMorph.smoothCssEffect");
expectEqual("polygonMorph.interpolateMidX", interpolatePolygonPoints([{ x: 0, y: 0 }], [{ x: 10, y: 20 }], 0.5)[0].x, 5);
expectEqual("polygonMorph.interpolateMidY", interpolatePolygonPoints([{ x: 0, y: 0 }], [{ x: 10, y: 20 }], 0.5)[0].y, 10);
expect(easePolygonMorph(0.5) > 0.5, "polygonMorph.easeOutProgress");
expect(html.includes('class="score-summary"'), "scoreSummary.summaryRow");
expect(html.includes('class="breakdown-panel"'), "scoreSummary.breakdownPanel");
expect(css.includes("grid-template-columns: max-content minmax(0, 1fr)"), "scoreSummary.sideBySideColumns");
expect(css.includes("width: max-content"), "scoreSummary.contentDrivenScoreWidth");
expect(css.includes("min-width: 214px"), "scoreSummary.compactScoreMinWidth");
expect(script.includes("let lastRenderedResult = null"), "detailChangeAnimation.tracksPreviousScore");
expect(script.includes("renderDetails(result, lastRenderedResult)"), "detailChangeAnimation.comparesPreviousScore");
expect(script.includes("lastRenderedResult = result"), "detailChangeAnimation.storesLatestScore");
expect(script.includes('class="detail-score ${changeClass}"'), "detailChangeAnimation.appliesChangeClass");
expect(script.includes('data-detail-key="${escapeHtml(row.key)}"'), "detailChangeAnimation.keysDetailRows");
expect(script.includes('class="detail-arrow"'), "detailChangeAnimation.arrowMarkup");
expect(script.includes('delta > 0 ? "▲" : "▼"'), "detailChangeAnimation.arrowDirection");
expect(css.includes(".detail-score"), "detailChangeAnimation.scoreWrapper");
expect(css.includes(".detail-arrow"), "detailChangeAnimation.arrowBaseClass");
expect(css.includes(".detail-score.detail-score-up"), "detailChangeAnimation.upClass");
expect(css.includes(".detail-score.detail-score-down"), "detailChangeAnimation.downClass");
expect(css.includes("font-size: 17px"), "detailChangeAnimation.largerArrow");
expect(css.includes(".detail-score.detail-score-up .detail-arrow"), "detailChangeAnimation.arrowDirectUpColorAnimation");
expect(css.includes(".detail-score.detail-score-down .detail-arrow"), "detailChangeAnimation.arrowDirectDownColorAnimation");
expect(css.includes("detailValueUp 2400ms ease both"), "detailChangeAnimation.arrowUsesUpColorKeyframes");
expect(css.includes("detailValueDown 2400ms ease both"), "detailChangeAnimation.arrowUsesDownColorKeyframes");
expect(css.includes("color: inherit"), "detailChangeAnimation.numberInheritsWrapperColor");
expect(css.includes("@keyframes detailArrowFade"), "detailChangeAnimation.arrowKeyframes");
expect(css.includes("opacity: 0;"), "detailChangeAnimation.arrowFadeOut");
expect(css.includes("@keyframes detailValueUp"), "detailChangeAnimation.upKeyframes");
expect(css.includes("@keyframes detailValueDown"), "detailChangeAnimation.downKeyframes");
expect(css.includes("color: var(--positive);"), "detailChangeAnimation.positiveColor");
expect(css.includes("color: var(--negative);"), "detailChangeAnimation.negativeColor");
expect(css.includes("--active-bg: rgba(79, 140, 255, 0.18);"), "inputButtons.darkActiveNoGradient");
expect(css.includes("--active-bg: rgba(37, 99, 235, 0.12);"), "inputButtons.lightActiveNoGradient");
expect(!css.includes("--active-bg: linear-gradient"), "inputButtons.noActiveGradient");
expect(script.includes("root.dataset.breakdownSignature"), "breakdownBars.preservesRows");
expect(script.includes("updateBreakdownBars(root, rows)"), "breakdownBars.updatesExistingRows");
expect(css.includes("transition: width 620ms cubic-bezier"), "breakdownBars.smoothWidthTransition");
expect(css.includes("will-change: width"), "breakdownBars.widthWillChange");
expect(html.includes('class="score-value score-roller"'), "scoreRoller.mainScoreUsesRoller");
expect(html.includes('class="score-roller polygon-score"'), "scoreRoller.polygonScoreUsesRoller");
expect(script.includes("renderRollingNumber(document.getElementById(\"totalScore\"), result.total)"), "scoreRoller.mainRenderPath");
expect(script.includes("renderRollingNumber(document.getElementById(\"polygonScore\"), result.total)"), "scoreRoller.polygonRenderPath");
expect(css.includes("@keyframes scoreDigitRoll"), "scoreRoller.keyframes");
expect(css.includes(".score-digit-strip"), "scoreRoller.digitStripCss");
expect(css.includes("width: 0.68em"), "scoreRoller.digitSlotAvoidsNineCrop");
expectEqual("scoreRoller.sequenceStart", scoreDigitSequence("4", "9")[0], "4");
expectEqual("scoreRoller.sequenceTarget", scoreDigitSequence("4", "9").at(-1), "9");
expectEqual("scoreRoller.sequenceFallback", scoreDigitSequence(undefined, "7")[0], "0");
expectEqual("scoreRoller.unchangedHundredsStill", scoreDigitShouldRoll("411", "423", 0), false);
expectEqual("scoreRoller.changedTensRoll", scoreDigitShouldRoll("411", "423", 1), true);
expectEqual("scoreRoller.changedOnesRoll", scoreDigitShouldRoll("411", "423", 2), true);
expectEqual("scoreRoller.lengthChangeSameOnesStill", scoreDigitShouldRoll("974", "1,174", 4), false);
expectEqual("scoreRoller.lengthChangeSameTensStill", scoreDigitShouldRoll("974", "1,174", 3), false);
expectEqual("scoreRoller.lengthChangeNewThousandsRoll", scoreDigitShouldRoll("974", "1,174", 0), true);

if (failures.length) {
  console.error(`FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: 8 CRS fixture groups");
