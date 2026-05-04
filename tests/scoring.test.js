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

const { DEFAULT_STATE, scoreProfile, sanitizeStoredState } = api;

test("scores a single applicant baseline", () => {
  const result = scoreProfile(fixtureState({
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

  assert.equal(result.total, 374);
  assert.deepEqual(result.breakdown, {
    core: 349,
    spouse: 0,
    transferability: 25,
    additional: 0
  });
  assert.equal(DEFAULT_STATE.maritalStatus, "single");
});

test("scores accompanying-spouse path separately", () => {
  const result = scoreProfile(fixtureState({
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

  assert.equal(result.total, 373);
  assert.deepEqual(result.breakdown, {
    core: 323,
    spouse: 25,
    transferability: 25,
    additional: 0
  });
});

test("matches official age point boundaries for single and spouse paths", () => {
  const expected = {
    "17-less": [0, 0],
    "18": [99, 90],
    "19": [105, 95],
    "20-26": [110, 100],
    "27": [110, 100],
    "28": [110, 100],
    "29": [110, 100],
    "30": [105, 95],
    "31": [99, 90],
    "32": [94, 85],
    "33": [88, 80],
    "34": [83, 75],
    "35": [77, 70],
    "36": [72, 65],
    "37": [66, 60],
    "38": [61, 55],
    "39": [55, 50],
    "40": [50, 45],
    "41": [39, 35],
    "42": [28, 25],
    "43": [17, 15],
    "44": [6, 5],
    "45-plus": [0, 0]
  };

  Object.entries(expected).forEach(([age, [single, spouse]]) => {
    assert.equal(scoreProfile(baseScoringState({ age })).details.core.age, single, `single age ${age}`);
    assert.equal(
      scoreProfile(baseScoringState({ maritalStatus: "spouse-accompanying", age })).details.core.age,
      spouse,
      `spouse age ${age}`
    );
  });
});

test("matches official education and Canadian-work tables for both marital paths", () => {
  const educationExpected = {
    lessSecondary: [0, 0],
    secondary: [30, 28],
    oneYear: [90, 84],
    twoYear: [98, 91],
    bachelor: [120, 112],
    twoOrMore: [128, 119],
    masters: [135, 126],
    phd: [150, 140]
  };
  const canadianWorkExpected = {
    "0": [0, 0],
    "1": [40, 35],
    "2": [53, 46],
    "3": [64, 56],
    "4": [72, 63],
    "5": [80, 70]
  };

  Object.entries(educationExpected).forEach(([education, [single, spouse]]) => {
    assert.equal(scoreProfile(baseScoringState({ education })).details.core.education, single);
    assert.equal(
      scoreProfile(baseScoringState({ maritalStatus: "spouse-accompanying", education })).details.core.education,
      spouse
    );
  });
  Object.entries(canadianWorkExpected).forEach(([canadianWork, [single, spouse]]) => {
    assert.equal(scoreProfile(baseScoringState({ canadianWork })).details.core.canadianWork, single);
    assert.equal(
      scoreProfile(baseScoringState({ maritalStatus: "spouse-accompanying", canadianWork })).details.core.canadianWork,
      spouse
    );
  });
});

test("matches official first-language per-ability tables", () => {
  const expected = {
    A: [0, 0],
    B: [24, 24],
    C: [24, 24],
    D: [36, 32],
    E: [68, 64],
    F: [92, 88],
    G: [124, 116],
    H: [136, 128]
  };

  Object.entries(expected).forEach(([score, [single, spouse]]) => {
    assert.equal(
      scoreProfile(baseScoringState(languageFixture("first", "celpip", score))).details.core.firstLanguage,
      single,
      `single first language ${score}`
    );
    assert.equal(
      scoreProfile(baseScoringState({
        maritalStatus: "spouse-accompanying",
        ...languageFixture("first", "celpip", score)
      })).details.core.firstLanguage,
      spouse,
      `spouse first language ${score}`
    );
  });
});

test("caps second-language and spouse-language points correctly", () => {
  const secondLanguageSingle = scoreProfile(baseScoringState({
    ...languageFixture("first", "celpip", "A"),
    ...languageFixture("second", "tef", "H")
  }));
  const secondLanguageSpouse = scoreProfile(baseScoringState({
    maritalStatus: "spouse-accompanying",
    ...languageFixture("first", "celpip", "A"),
    ...languageFixture("second", "tef", "H"),
    ...languageFixture("spouse", "celpip", "H")
  }));

  assert.equal(secondLanguageSingle.details.core.secondLanguage, 24);
  assert.equal(secondLanguageSpouse.details.core.secondLanguage, 22);
  assert.equal(secondLanguageSpouse.details.spouse.language, 20);
});

test("handles core skill-transferability edges", () => {
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
  const canadianWork = scenarioById(transferStart, "canadian-work-year");

  assert.equal(canadianWork.delta, 48);
  assert.equal(componentDeltaByLabel(canadianWork, "Canadian work"), 35);
  assert.equal(componentDeltaByLabel(canadianWork, "Skill transferability: education"), 13);
});

test("caps transferability groups at 50 each and total transferability at 100", () => {
  const result = scoreProfile(baseScoringState({
    education: "masters",
    ...languageFixture("first", "celpip", "G"),
    canadianWork: "2",
    foreignWork: "3",
    certificate: true
  }));

  assert.deepEqual(result.details.transferGroups, {
    education: 50,
    foreignWork: 50,
    certificate: 50
  });
  assert.equal(result.breakdown.transferability, 100);
});

test("keeps removed job-offer points out of state, controls, and scoring", () => {
  const stateKeys = Object.keys(DEFAULT_STATE).join(" ").toLowerCase();
  assert.equal(/job|offer/.test(stateKeys), false);
  assert.equal(/job|offer/.test(JSON.stringify(scoreProfile(DEFAULT_STATE)).toLowerCase()), false);
});

test("caps additional and total CRS points at official maximums", () => {
  const result = scoreProfile(baseScoringState({
    age: "20-26",
    education: "phd",
    ...languageFixture("first", "celpip", "H"),
    ...languageFixture("second", "tef", "H"),
    canadianWork: "5",
    foreignWork: "3",
    canadianEducation: "threePlus",
    sibling: true,
    nomination: true,
    certificate: true
  }));

  assert.equal(result.breakdown.additional, 600);
  assert.equal(result.total, 1200);
  assert.equal(result.caps.total, 1200);
});

test("scores provincial nomination as additional points, not an opportunity card", () => {
  const result = scoreProfile(fixtureState({
    maritalStatus: "single",
    age: "30",
    education: "bachelor",
    ...languageFixture("first", "celpip", "G"),
    nomination: true
  }));

  assert.equal(result.breakdown.additional, 600);
  assert.equal(result.total, 974);
});

test("normalizes stored state without writing browser storage on initial load", () => {
  const storedState = sanitizeStoredState({
    maritalStatus: "single",
    age: "44",
    education: "masters",
    nomination: true,
    sibling: true
  });

  assert.equal(storedState.age, "44");
  assert.equal(storedState.education, "masters");
  assert.equal(storedState.nomination, true);
  assert.equal(sanitizeStoredState({ age: "23" }).age, "20-26");
  assert.equal(sanitizeStoredState({ age: "20-25" }).age, "20-26");
  assert.equal(sanitizeStoredState({ age: "26" }).age, "20-26");
});
