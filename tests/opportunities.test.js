const assert = require("node:assert/strict");
const test = require("node:test");

const {
  api,
  baseScoringState,
  componentDeltaByLabel,
  fixtureState,
  languageFixture,
  scenarioById
} = require("./context");

const { languageScoreOptionLabel, scenarioDefinitions, scoreOpportunities } = api;

function assertLanguageTitle(scenario, { language, benchmark, secondLanguage = false, allowOtherBenchmark = false }) {
  assert.match(scenario.title, /\bRaise\b/);
  assert.match(scenario.title, new RegExp(`\\b${language}\\b`));
  assert.match(scenario.title, new RegExp(`\\b${benchmark}\\b`));
  if (secondLanguage) {
    assert.match(scenario.title, /\bsecond-language\b/);
  }
  if (!allowOtherBenchmark) {
    const otherBenchmark = benchmark === "NCLC" ? "CLB" : "NCLC";
    assert.doesNotMatch(scenario.title, new RegExp(`\\b${otherBenchmark}\\b`));
  }
}

test("builds certificate opportunity under skill transferability", () => {
  const start = fixtureState({
    maritalStatus: "single",
    age: "30",
    education: "bachelor",
    ...languageFixture("first", "celpip", "E"),
    ...languageFixture("second", "none", "none"),
    canadianWork: "0",
    foreignWork: "0",
    sibling: false,
    nomination: false,
    certificate: false,
    canadianEducation: "none"
  });
  const scenario = scenarioById(start, "certificate-qualification");

  assert.equal(scenario.title, "🛠️ Add certificate of qualification");
  assert.equal(scenario.delta, 50);
  assert.equal(componentDeltaByLabel(scenario, "Skill transferability: certificate"), 50);
});

test("builds French and second-language opportunities with correct benchmark labels", () => {
  const start = fixtureState({
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

  const frenchSeven = scenarioById(start, "french-nclc-seven");
  const frenchNine = scenarioById(start, "french-nclc-nine");
  const frenchFive = scenarioById(start, "second-language-clb-5");

  assertLanguageTitle(frenchSeven, { language: "French", benchmark: "NCLC" });
  assert.equal(frenchSeven.delta, 62);
  assert.equal(componentDeltaByLabel(frenchSeven, "Second official language"), 12);
  assert.equal(componentDeltaByLabel(frenchSeven, "Additional"), 50);
  assertLanguageTitle(frenchNine, { language: "French", benchmark: "NCLC" });
  assert.equal(frenchNine.delta, 72);
  assert.equal(componentDeltaByLabel(frenchNine, "Second official language"), 22);
  assert.equal(componentDeltaByLabel(frenchNine, "Additional"), 50);
  assert.equal(frenchFive.delta, 4);
  assertLanguageTitle(frenchFive, { language: "French", benchmark: "NCLC", secondLanguage: true });
  assert.equal(componentDeltaByLabel(frenchFive, "Second official language"), 4);

  assert.equal(
    languageScoreOptionLabel({ language: "english" }, { clb: 7, listening: "6.0" }, "listening"),
    "6.0 (CLB 7)"
  );
  assert.equal(
    languageScoreOptionLabel({ language: "french" }, { clb: 7, listening: "249-279" }, "listening"),
    "249-279 (NCLC 7)"
  );
});

test("does not duplicate French opportunity when French is the first language", () => {
  const start = fixtureState({
    maritalStatus: "single",
    age: "30",
    education: "bachelor",
    ...languageFixture("first", "tef", "E"),
    ...languageFixture("second", "none", "none"),
    canadianWork: "0",
    foreignWork: "0",
    sibling: false,
    nomination: false,
    certificate: false,
    canadianEducation: "none"
  });

  const englishAdditional = scenarioById(start, "english-clb-five-french-additional");
  assert.equal(englishAdditional.delta, 29);
  assert.equal(componentDeltaByLabel(englishAdditional, "Second official language"), 4);
  assert.equal(componentDeltaByLabel(englishAdditional, "Additional"), 25);
  assert.equal(scenarioDefinitions(start).some((scenario) => scenario.id.startsWith("french-nclc")), false);
  assert.equal(scenarioDefinitions(start).some((scenario) => scenario.id === "second-language-clb-7"), true);
  assertLanguageTitle(englishAdditional, { language: "English", benchmark: "CLB", allowOtherBenchmark: true });
  assertLanguageTitle(scenarioById(start, "second-language-clb-7"), {
    language: "English",
    benchmark: "CLB",
    secondLanguage: true
  });
});

test("builds first-language improvement cards through transferability milestones", () => {
  const clbSixStart = fixtureState({
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
  const clbSeven = scenarioById(clbSixStart, "first-language-clb-7");

  assert.equal(clbSeven.delta, 58);
  assert.equal(componentDeltaByLabel(clbSeven, "First official language"), 32);
  assert.equal(componentDeltaByLabel(clbSeven, "Skill transferability: education"), 13);
  assert.equal(componentDeltaByLabel(clbSeven, "Skill transferability: foreign work"), 13);
  assert.deepEqual(
    scenarioDefinitions(clbSixStart)
      .filter((scenario) => scenario.id.startsWith("first-language-clb"))
      .map((scenario) => scenario.id),
    ["first-language-clb-7", "first-language-clb-8", "first-language-clb-9", "first-language-clb-10"]
  );

  const frenchFirstStart = { ...clbSixStart, ...languageFixture("first", "tef", "E") };
  assertLanguageTitle(scenarioById(frenchFirstStart, "first-language-clb-8"), {
    language: "French",
    benchmark: "NCLC"
  });
});

test("builds work-experience and education opportunities without duplicates", () => {
  const start = fixtureState({
    maritalStatus: "single",
    age: "25",
    education: "bachelor",
    ...languageFixture("first", "celpip", "G"),
    ...languageFixture("second", "none", "none"),
    canadianWork: "0",
    foreignWork: "0",
    sibling: false,
    nomination: false,
    certificate: false,
    canadianEducation: "none"
  });

  assert.equal(scenarioById(start, "foreign-work-year").delta, 25);
  assert.equal(scenarioById(start, "foreign-work-three-years").delta, 50);
  assert.equal(scenarioById(start, "foreign-work-year").title, "🌎 Add foreign skilled work: 1 year");
  assert.equal(scenarioById(start, "foreign-work-three-years").title, "🌎 Reach 3+ years foreign skilled work");
  assert.equal(scenarioDefinitions({ ...start, foreignWork: "2" }).some((scenario) => scenario.id === "foreign-work-year"), false);
  assert.equal(scenarioDefinitions({ ...start, foreignWork: "2" }).some((scenario) => scenario.id === "foreign-work-three-years"), true);
  assert.equal(scenarioDefinitions({ ...start, canadianWork: "1" }).some((scenario) => scenario.id === "canadian-work-two-years"), false);
  assert.equal(scenarioDefinitions({ ...start, canadianWork: "1" }).some((scenario) => scenario.id === "canadian-work-year"), true);
});

test("returns only positive score opportunities in descending order and excludes PNP card", () => {
  const start = fixtureState({
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
  const opportunities = scoreOpportunities(start);
  const deltas = opportunities.map((scenario) => scenario.delta);

  assert.equal(scenarioById(start, "canadian-work-year").delta, 48);
  assert.equal(scenarioById(start, "canadian-work-two-years").delta, 71);
  assert.equal(scenarioById(start, "french-nclc-nine").delta, 72);
  assert.equal(scenarioById(start, "eca-masters").title, "🎓 Complete non-Canadian master's credential");
  assert.equal(scenarioDefinitions(start).some((scenario) => scenario.id === "provincial-nomination"), false);
  assert.equal(deltas[0], 72);
  assert.equal(deltas.every((delta, index, list) => index === 0 || list[index - 1] >= delta), true);
  assert.equal(opportunities.every((scenario) => scenario.delta > 0), true);
});

test("keeps opportunity IDs unique and hides exhausted work and certificate paths", () => {
  const start = baseScoringState({
    ...languageFixture("first", "celpip", "H"),
    ...languageFixture("second", "tef", "H"),
    canadianWork: "5",
    foreignWork: "3",
    certificate: true
  });
  const ids = scenarioDefinitions(start).map((scenario) => scenario.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.includes("canadian-work-year"), false);
  assert.equal(ids.includes("canadian-work-two-years"), false);
  assert.equal(ids.includes("foreign-work-year"), false);
  assert.equal(ids.includes("foreign-work-three-years"), false);
  assert.equal(ids.includes("certificate-qualification"), false);
  assert.equal(ids.some((id) => id.startsWith("first-language-clb")), false);
});

test("scenario mutations model expected elapsed time through age changes", () => {
  const start = baseScoringState({
    age: "30",
    education: "bachelor",
    ...languageFixture("first", "celpip", "G"),
    canadianWork: "0",
    foreignWork: "0"
  });

  assert.deepEqual(
    {
      age: scenarioById(start, "canadian-work-year").nextState.age,
      canadianWork: scenarioById(start, "canadian-work-year").nextState.canadianWork
    },
    { age: "31", canadianWork: "1" }
  );
  assert.deepEqual(
    {
      age: scenarioById(start, "canadian-work-two-years").nextState.age,
      canadianWork: scenarioById(start, "canadian-work-two-years").nextState.canadianWork
    },
    { age: "32", canadianWork: "2" }
  );
  assert.deepEqual(
    {
      age: scenarioById(start, "foreign-work-three-years").nextState.age,
      foreignWork: scenarioById(start, "foreign-work-three-years").nextState.foreignWork
    },
    { age: "33", foreignWork: "3" }
  );
  assert.equal(scenarioById(start, "eca-two-or-more").nextState.age, "31");
  assert.equal(scenarioById(start, "canadian-masters").nextState.age, "32");
});

test("shows age penalty deltas for future education paths", () => {
  const start = fixtureState({
    maritalStatus: "spouse-accompanying",
    age: "30",
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

  const masters = scenarioById(start, "canadian-masters");
  const ecaMasters = scenarioById(start, "eca-masters");

  assert.equal(masters.delta, 59);
  assert.equal(componentDeltaByLabel(masters, "Age"), -10);
  assert.equal(ecaMasters.delta, 29);
  assert.equal(componentDeltaByLabel(ecaMasters, "Age"), -10);
});
