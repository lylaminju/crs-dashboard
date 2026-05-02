(() => {
  "use strict";

  // ----- Source metadata and CRS constants/tables -----
  const SOURCE_URLS = [
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html",
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html"
  ];

  const AGE_OPTIONS = [
    ["17-less", "≤17"],
    ["18", "18"],
    ["19", "19"],
    ["20-25", "20-25"],
    ["26", "26"],
    ["27", "27"],
    ["28", "28"],
    ["29", "29"],
    ["30", "30"],
    ["31", "31"],
    ["32", "32"],
    ["33", "33"],
    ["34", "34"],
    ["35", "35"],
    ["36", "36"],
    ["37", "37"],
    ["38", "38"],
    ["39", "39"],
    ["40", "40"],
    ["41", "41"],
    ["42", "42"],
    ["43", "43"],
    ["44", "44"],
    ["45-plus", "45+"]
  ];

  const AGE_POINTS = {
    "17-less": { spouse: 0, single: 0 },
    "18": { spouse: 90, single: 99 },
    "19": { spouse: 95, single: 105 },
    "20-25": { spouse: 100, single: 110 },
    "26": { spouse: 100, single: 110 },
    "27": { spouse: 100, single: 110 },
    "28": { spouse: 100, single: 110 },
    "29": { spouse: 100, single: 110 },
    "30": { spouse: 95, single: 105 },
    "31": { spouse: 90, single: 99 },
    "32": { spouse: 85, single: 94 },
    "33": { spouse: 80, single: 88 },
    "34": { spouse: 75, single: 83 },
    "35": { spouse: 70, single: 77 },
    "36": { spouse: 65, single: 72 },
    "37": { spouse: 60, single: 66 },
    "38": { spouse: 55, single: 61 },
    "39": { spouse: 50, single: 55 },
    "40": { spouse: 45, single: 50 },
    "41": { spouse: 35, single: 39 },
    "42": { spouse: 25, single: 28 },
    "43": { spouse: 15, single: 17 },
    "44": { spouse: 5, single: 6 },
    "45-plus": { spouse: 0, single: 0 }
  };

  const EDUCATION_OPTIONS = [
    { value: "lessSecondary", label: "Less than secondary school", spouse: 0, single: 0, tier: "none" },
    { value: "secondary", label: "Secondary diploma", spouse: 28, single: 30, tier: "none" },
    { value: "oneYear", label: "One-year degree, diploma or certificate", spouse: 84, single: 90, tier: "basic" },
    { value: "twoYear", label: "Two-year program", spouse: 91, single: 98, tier: "basic" },
    { value: "bachelor", label: "Bachelor's degree or three-year program", spouse: 112, single: 120, tier: "basic" },
    { value: "twoOrMore", label: "Two or more credentials, one three years or longer", spouse: 119, single: 128, tier: "advanced" },
    { value: "masters", label: "Master's or professional degree", spouse: 126, single: 135, tier: "advanced" },
    { value: "phd", label: "Doctoral level university degree", spouse: 140, single: 150, tier: "advanced" }
  ];

  const SPOUSE_EDUCATION_OPTIONS = [
    { value: "lessSecondary", label: "Less than secondary school", points: 0 },
    { value: "secondary", label: "Secondary school", points: 2 },
    { value: "oneYear", label: "One-year program", points: 6 },
    { value: "twoYear", label: "Two-year program", points: 7 },
    { value: "bachelor", label: "Bachelor's degree or three-year program", points: 8 },
    { value: "twoOrMore", label: "Two or more credentials", points: 9 },
    { value: "masters", label: "Master's or professional degree", points: 10 },
    { value: "phd", label: "Doctoral level university degree", points: 10 }
  ];

  const CANADIAN_WORK_OPTIONS = [
    { value: "0", label: "None or less than a year", spouse: 0, single: 0, spouseFactor: 0 },
    { value: "1", label: "1 year", spouse: 35, single: 40, spouseFactor: 5 },
    { value: "2", label: "2 years", spouse: 46, single: 53, spouseFactor: 7 },
    { value: "3", label: "3 years", spouse: 56, single: 64, spouseFactor: 8 },
    { value: "4", label: "4 years", spouse: 63, single: 72, spouseFactor: 9 },
    { value: "5", label: "5 years or more", spouse: 70, single: 80, spouseFactor: 10 }
  ];

  const FOREIGN_WORK_OPTIONS = [
    { value: "0", label: "None or less than a year" },
    { value: "1", label: "1 year" },
    { value: "2", label: "2 years" },
    { value: "3", label: "3 years or more" }
  ];

  const LANGUAGE_TESTS = {
    none: {
      value: "none",
      label: "No test results",
      language: "none",
      scores: [
        { value: "none", clb: 0, speaking: "No result", listening: "No result", reading: "No result", writing: "No result" }
      ]
    },
    celpip: {
      value: "celpip",
      label: "CELPIP-G",
      language: "english",
      scores: [
        { value: "H", clb: 10, speaking: "10-12", listening: "10-12", reading: "10-12", writing: "10-12" },
        { value: "G", clb: 9, speaking: "9", listening: "9", reading: "9", writing: "9" },
        { value: "F", clb: 8, speaking: "8", listening: "8", reading: "8", writing: "8" },
        { value: "E", clb: 7, speaking: "7", listening: "7", reading: "7", writing: "7" },
        { value: "D", clb: 6, speaking: "6", listening: "6", reading: "6", writing: "6" },
        { value: "C", clb: 5, speaking: "5", listening: "5", reading: "5", writing: "5" },
        { value: "B", clb: 4, speaking: "4", listening: "4", reading: "4", writing: "4" },
        { value: "A", clb: 0, speaking: "M, 0-3", listening: "M, 0-3", reading: "M, 0-3", writing: "M, 0-3" }
      ]
    },
    ielts: {
      value: "ielts",
      label: "IELTS",
      language: "english",
      scores: [
        { value: "H", clb: 10, speaking: "7.5-9.0", listening: "8.5-9.0", reading: "8.0-9.0", writing: "7.5-9.0" },
        { value: "G", clb: 9, speaking: "7.0", listening: "8.0", reading: "7.0-7.5", writing: "7.0" },
        { value: "F", clb: 8, speaking: "6.5", listening: "7.5", reading: "6.5", writing: "6.5" },
        { value: "E", clb: 7, speaking: "6.0", listening: "6.0-7.0", reading: "6.0", writing: "6.0" },
        { value: "D", clb: 6, speaking: "5.5", listening: "5.5", reading: "5.0-5.5", writing: "5.5" },
        { value: "C", clb: 5, speaking: "5.0", listening: "5.0", reading: "4.0-4.5", writing: "5.0" },
        { value: "B", clb: 4, speaking: "4.0-4.5", listening: "4.5", reading: "3.5", writing: "4.0-4.5" },
        { value: "A", clb: 0, speaking: "0-3.5", listening: "0-4.0", reading: "0-3.0", writing: "0-3.5" }
      ]
    },
    pte: {
      value: "pte",
      label: "PTE Core",
      language: "english",
      scores: [
        { value: "H", clb: 10, speaking: "89-90", listening: "89-90", reading: "88-90", writing: "90" },
        { value: "G", clb: 9, speaking: "84-88", listening: "82-88", reading: "78-87", writing: "88-89" },
        { value: "F", clb: 8, speaking: "76-83", listening: "71-81", reading: "69-77", writing: "79-87" },
        { value: "E", clb: 7, speaking: "68-75", listening: "60-70", reading: "60-68", writing: "69-78" },
        { value: "D", clb: 6, speaking: "59-67", listening: "50-59", reading: "51-59", writing: "60-68" },
        { value: "C", clb: 5, speaking: "51-58", listening: "39-49", reading: "42-50", writing: "51-59" },
        { value: "B", clb: 4, speaking: "42-50", listening: "28-38", reading: "33-41", writing: "41-50" },
        { value: "A", clb: 0, speaking: "0-41", listening: "0-27", reading: "0-32", writing: "0-40" }
      ]
    },
    tef: {
      value: "tef",
      label: "TEF Canada",
      language: "french",
      scores: [
        { value: "H", clb: 10, speaking: "393-450", listening: "316-360", reading: "263-300", writing: "393-450" },
        { value: "G", clb: 9, speaking: "371-392", listening: "298-315", reading: "248-262", writing: "371-392" },
        { value: "F", clb: 8, speaking: "349-370", listening: "280-297", reading: "233-247", writing: "349-370" },
        { value: "E", clb: 7, speaking: "310-348", listening: "249-279", reading: "207-232", writing: "310-348" },
        { value: "D", clb: 6, speaking: "271-309", listening: "217-248", reading: "181-206", writing: "271-309" },
        { value: "C", clb: 5, speaking: "226-270", listening: "181-216", reading: "151-180", writing: "226-270" },
        { value: "B", clb: 4, speaking: "181-225", listening: "145-180", reading: "121-150", writing: "181-225" },
        { value: "A", clb: 0, speaking: "0-180", listening: "0-144", reading: "0-120", writing: "0-180" }
      ]
    },
    tcf: {
      value: "tcf",
      label: "TCF Canada",
      language: "french",
      scores: [
        { value: "H", clb: 10, speaking: "16-20", listening: "549-699", reading: "549-699", writing: "16-20" },
        { value: "G", clb: 9, speaking: "14-15", listening: "523-548", reading: "524-548", writing: "14-15" },
        { value: "F", clb: 8, speaking: "12-13", listening: "503-522", reading: "499-523", writing: "12-13" },
        { value: "E", clb: 7, speaking: "10-11", listening: "458-502", reading: "453-498", writing: "10-11" },
        { value: "D", clb: 6, speaking: "7-9", listening: "398-457", reading: "406-452", writing: "7-9" },
        { value: "C", clb: 5, speaking: "6", listening: "369-397", reading: "375-405", writing: "6" },
        { value: "B", clb: 4, speaking: "4-5", listening: "331-368", reading: "342-374", writing: "4-5" },
        { value: "A", clb: 0, speaking: "0-3", listening: "0-330", reading: "0-341", writing: "0-3" }
      ]
    }
  };

  const FIRST_LANGUAGE_TEST_OPTIONS = ["celpip", "ielts", "pte", "tef", "tcf"].map((key) => LANGUAGE_TESTS[key]);
  const OPTIONAL_LANGUAGE_TEST_OPTIONS = [LANGUAGE_TESTS.none, ...FIRST_LANGUAGE_TEST_OPTIONS];
  const LANGUAGE_ABILITIES = ["Listening", "Reading", "Writing", "Speaking"];

  const CANADIAN_EDUCATION_OPTIONS = [
    { value: "none", label: "No eligible Canadian credential", points: 0 },
    { value: "oneTwo", label: "Credential of one or two years", points: 15 },
    { value: "threePlus", label: "Credential three years or longer", points: 30 }
  ];

  const MARITAL_OPTIONS = [
    { value: "single", label: "Single, divorced, separated or widowed" },
    { value: "spouse-accompanying", label: "Married/common-law, spouse coming" },
    { value: "spouse-not-accompanying", label: "Spouse not coming or Canadian PR/citizen" }
  ];

  const optionLookup = (options) => Object.fromEntries(options.map((item) => [item.value, item]));
  const EDUCATION_BY_VALUE = optionLookup(EDUCATION_OPTIONS);
  const SPOUSE_EDUCATION_BY_VALUE = optionLookup(SPOUSE_EDUCATION_OPTIONS);
  const CANADIAN_WORK_BY_VALUE = optionLookup(CANADIAN_WORK_OPTIONS);
  const CANADIAN_EDUCATION_BY_VALUE = optionLookup(CANADIAN_EDUCATION_OPTIONS);

  // ----- Default state and form option metadata -----
  const DEFAULT_STATE = Object.freeze({
    maritalStatus: "single",
    age: "30",
    education: "bachelor",
    firstTest: "celpip",
    firstListening: "E",
    firstReading: "E",
    firstWriting: "E",
    firstSpeaking: "E",
    secondTest: "none",
    secondListening: "none",
    secondReading: "none",
    secondWriting: "none",
    secondSpeaking: "none",
    canadianWork: "0",
    foreignWork: "0",
    canadianEducation: "none",
    sibling: false,
    nomination: false,
    certificate: false,
    spouseEducation: "lessSecondary",
    spouseTest: "none",
    spouseListening: "none",
    spouseReading: "none",
    spouseWriting: "none",
    spouseSpeaking: "none",
    spouseCanadianWork: "0"
  });

  const STORAGE_KEY = "canada-crs-dashboard:v1";
  const THEME_STORAGE_KEY = "canada-crs-dashboard:theme";
  const DASHBOARD_VIEW = "dashboard";
  const POLYGON_VIEW = "polygon";
  const THEME_MODES = ["system", "light", "dark"];
  const POLYGON_WIDTH = 760;
  const POLYGON_HEIGHT = 540;
  const POLYGON_CENTER_X = POLYGON_WIDTH / 2;
  const POLYGON_CENTER_Y = POLYGON_HEIGHT / 2;
  const POLYGON_RADIUS = 160;

  const SELECT_CONFIG = {
    education: EDUCATION_OPTIONS,
    firstTest: FIRST_LANGUAGE_TEST_OPTIONS,
    secondTest: null,
    canadianEducation: CANADIAN_EDUCATION_OPTIONS,
    spouseEducation: SPOUSE_EDUCATION_OPTIONS,
    spouseTest: OPTIONAL_LANGUAGE_TEST_OPTIONS
  };

  // ----- Pure score computation -----
  function cloneState(state) {
    return { ...state };
  }

  function hasAccompanyingSpouse(state) {
    return state.maritalStatus === "spouse-accompanying";
  }

  function pairPoints(points, state) {
    return hasAccompanyingSpouse(state) ? points.spouse : points.single;
  }

  function numeric(value) {
    return Number.parseInt(value, 10);
  }

  function normalizeAgeKey(ageKey) {
    const age = numeric(ageKey);
    if (ageKey === "20-29" || (Number.isFinite(age) && age >= 20 && age <= 25)) {
      return "20-25";
    }
    return AGE_POINTS[ageKey] ? ageKey : DEFAULT_STATE.age;
  }

  function getLanguageTest(state, prefix) {
    return LANGUAGE_TESTS[state[`${prefix}Test`]] || LANGUAGE_TESTS.none;
  }

  function languageTestOptionsByLanguage(language) {
    return FIRST_LANGUAGE_TEST_OPTIONS.filter((test) => test.language === language);
  }

  function secondOfficialLanguageTestOptions(inputState) {
    const firstLanguage = getLanguageTest(inputState, "first").language;
    const secondLanguage = firstLanguage === "french" ? "english" : "french";
    return [LANGUAGE_TESTS.none, ...languageTestOptionsByLanguage(secondLanguage)];
  }

  function selectOptionsForField(field, inputState) {
    if (field === "secondTest") {
      return secondOfficialLanguageTestOptions(inputState);
    }
    return SELECT_CONFIG[field] || [];
  }

  function ensureSecondLanguageTestState(targetState) {
    const validSecondTests = new Set(secondOfficialLanguageTestOptions(targetState).map((test) => test.value));
    if (validSecondTests.has(targetState.secondTest)) return;
    targetState.secondTest = "none";
    resetLanguageScoreFields(targetState, "second");
  }

  function getLanguageScore(state, prefix, ability) {
    const test = getLanguageTest(state, prefix);
    const selected = state[`${prefix}${capitalize(ability)}`];
    return test.scores.find((score) => score.value === selected) || test.scores[test.scores.length - 1];
  }

  function languageClbs(state, prefix) {
    return {
      listening: getLanguageScore(state, prefix, "listening").clb,
      reading: getLanguageScore(state, prefix, "reading").clb,
      writing: getLanguageScore(state, prefix, "writing").clb,
      speaking: getLanguageScore(state, prefix, "speaking").clb
    };
  }

  function languageClbList(state, prefix) {
    return Object.values(languageClbs(state, prefix));
  }

  function lowestLanguageClb(state, prefix) {
    return Math.min(...languageClbList(state, prefix));
  }

  function allLanguageClbAtLeast(state, prefix, target) {
    return languageClbList(state, prefix).every((clb) => clb >= target);
  }

  function languagePoints(state, prefix, pointFn) {
    return languageClbList(state, prefix).reduce((total, clb) => total + pointFn(clb, state), 0);
  }

  function firstLanguagePerAbility(clb, state) {
    const value = numeric(clb);
    const spouse = hasAccompanyingSpouse(state);
    if (value < 4) return 0;
    if (value <= 5) return 6;
    if (value === 6) return spouse ? 8 : 9;
    if (value === 7) return spouse ? 16 : 17;
    if (value === 8) return spouse ? 22 : 23;
    if (value === 9) return spouse ? 29 : 31;
    return spouse ? 32 : 34;
  }

  function secondLanguagePerAbility(clb) {
    const value = numeric(clb);
    if (value <= 4) return 0;
    if (value <= 6) return 1;
    if (value <= 8) return 3;
    return 6;
  }

  function spouseLanguagePerAbility(clb) {
    const value = numeric(clb);
    if (value <= 4) return 0;
    if (value <= 6) return 1;
    if (value <= 8) return 3;
    return 5;
  }

  function educationTier(state) {
    return EDUCATION_BY_VALUE[state.education].tier;
  }

  function educationLanguageTransfer(state) {
    const tier = educationTier(state);
    const clb = lowestLanguageClb(state, "first");
    if (tier === "none" || clb < 7) return 0;
    if (tier === "advanced") return clb >= 9 ? 50 : 25;
    return clb >= 9 ? 25 : 13;
  }

  function educationCanadianWorkTransfer(state) {
    const tier = educationTier(state);
    const years = numeric(state.canadianWork);
    if (tier === "none" || years < 1) return 0;
    if (tier === "advanced") return years >= 2 ? 50 : 25;
    return years >= 2 ? 25 : 13;
  }

  function foreignWorkGroup(state) {
    const years = numeric(state.foreignWork);
    if (years <= 0) return "none";
    if (years <= 2) return "oneTwo";
    return "threePlus";
  }

  function foreignLanguageTransfer(state) {
    const group = foreignWorkGroup(state);
    const clb = lowestLanguageClb(state, "first");
    if (group === "none" || clb < 7) return 0;
    if (group === "threePlus") return clb >= 9 ? 50 : 25;
    return clb >= 9 ? 25 : 13;
  }

  function foreignCanadianWorkTransfer(state) {
    const group = foreignWorkGroup(state);
    const years = numeric(state.canadianWork);
    if (group === "none" || years < 1) return 0;
    if (group === "threePlus") return years >= 2 ? 50 : 25;
    return years >= 2 ? 25 : 13;
  }

  function certificateTransfer(state) {
    const clb = lowestLanguageClb(state, "first");
    if (!state.certificate || clb < 5) return 0;
    return clb >= 7 ? 50 : 25;
  }

  function frenchLanguageAdditional(state) {
    const firstTest = getLanguageTest(state, "first");
    const secondTest = getLanguageTest(state, "second");
    const hasFrenchFirst = firstTest.language === "french" && allLanguageClbAtLeast(state, "first", 7);
    const hasFrenchSecond = secondTest.language === "french" && allLanguageClbAtLeast(state, "second", 7);
    if (!hasFrenchFirst && !hasFrenchSecond) return 0;

    const hasEnglishHighEnough =
      (firstTest.language === "english" && allLanguageClbAtLeast(state, "first", 5)) ||
      (secondTest.language === "english" && allLanguageClbAtLeast(state, "second", 5));
    return hasEnglishHighEnough ? 50 : 25;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function scoreProfile(inputState) {
    const state = cloneState(inputState);
    ensureSecondLanguageTestState(state);
    const spouse = hasAccompanyingSpouse(state);
    const core = {
      age: pairPoints(AGE_POINTS[normalizeAgeKey(state.age)], state),
      education: pairPoints(EDUCATION_BY_VALUE[state.education], state),
      firstLanguage: languagePoints(state, "first", firstLanguagePerAbility),
      secondLanguage: Math.min(languagePoints(state, "second", secondLanguagePerAbility), spouse ? 22 : 24),
      canadianWork: pairPoints(CANADIAN_WORK_BY_VALUE[state.canadianWork], state)
    };

    const spouseFactors = spouse ? {
      education: SPOUSE_EDUCATION_BY_VALUE[state.spouseEducation].points,
      language: languagePoints(state, "spouse", spouseLanguagePerAbility),
      canadianWork: CANADIAN_WORK_BY_VALUE[state.spouseCanadianWork].spouseFactor
    } : { education: 0, language: 0, canadianWork: 0 };

    const transfer = {
      educationLanguage: educationLanguageTransfer(state),
      educationCanadianWork: educationCanadianWorkTransfer(state),
      foreignLanguage: foreignLanguageTransfer(state),
      foreignCanadianWork: foreignCanadianWorkTransfer(state),
      certificate: certificateTransfer(state)
    };

    const transferGroups = {
      education: Math.min(transfer.educationLanguage + transfer.educationCanadianWork, 50),
      foreignWork: Math.min(transfer.foreignLanguage + transfer.foreignCanadianWork, 50),
      certificate: transfer.certificate
    };

    const additionalRaw = {
      sibling: state.sibling ? 15 : 0,
      french: frenchLanguageAdditional(state),
      canadianEducation: CANADIAN_EDUCATION_BY_VALUE[state.canadianEducation].points,
      nomination: state.nomination ? 600 : 0
    };

    const coreTotal = sumValues(core);
    const spouseTotal = sumValues(spouseFactors);
    const transferTotal = Math.min(sumValues(transferGroups), 100);
    const additionalTotal = Math.min(sumValues(additionalRaw), 600);
    const uncappedTotal = coreTotal + spouseTotal + transferTotal + additionalTotal;

    return {
      total: Math.min(uncappedTotal, 1200),
      caps: {
        core: spouse ? 460 : 500,
        spouse: spouse ? 40 : 0,
        transferability: 100,
        additional: 600,
        total: 1200
      },
      breakdown: {
        core: coreTotal,
        spouse: spouseTotal,
        transferability: transferTotal,
        additional: additionalTotal
      },
      details: {
        core,
        spouse: spouseFactors,
        transfer,
        transferGroups,
        additional: additionalRaw
      },
      spousePath: spouse
    };
  }

  function sumValues(record) {
    return Object.values(record).reduce((total, value) => total + value, 0);
  }

  // ----- Pure scenario computation by cloned-state recomputation -----
  function incrementCanadianWork(value) {
    const next = Math.min(numeric(value) + 1, 5);
    return String(next);
  }

  function scoreValueForClbAtLeast(testKey, targetClb) {
    const test = LANGUAGE_TESTS[testKey] || LANGUAGE_TESTS.none;
    const exact = test.scores.find((score) => score.clb === targetClb);
    const fallback = test.scores.find((score) => score.clb >= targetClb);
    return (exact || fallback || test.scores[0]).value;
  }

  function raiseLanguageGroupToClb(state, prefix, targetClb) {
    const value = scoreValueForClbAtLeast(state[`${prefix}Test`], targetClb);
    LANGUAGE_ABILITIES.forEach((ability) => {
      const field = `${prefix}${ability}`;
      if (getLanguageScore(state, prefix, ability.toLowerCase()).clb < targetClb) {
        state[field] = value;
      }
    });
  }

  function setLanguageGroupToClb(state, prefix, testKey, targetClb) {
    state[`${prefix}Test`] = testKey;
    const value = scoreValueForClbAtLeast(testKey, targetClb);
    LANGUAGE_ABILITIES.forEach((ability) => {
      state[`${prefix}${ability}`] = value;
    });
  }

  function setFrenchScenario(state, targetClb) {
    const firstIsFrench = getLanguageTest(state, "first").language === "french";
    const secondIsFrench = getLanguageTest(state, "second").language === "french";
    if (firstIsFrench) {
      setLanguageGroupToClb(state, "first", state.firstTest, targetClb);
    } else if (secondIsFrench) {
      setLanguageGroupToClb(state, "second", state.secondTest, targetClb);
    } else {
      setLanguageGroupToClb(state, "second", "tef", targetClb);
    }
  }

  function hasEnglishAllAtLeast(state, targetClb) {
    return ["first", "second"].some((prefix) => {
      return getLanguageTest(state, prefix).language === "english" && allLanguageClbAtLeast(state, prefix, targetClb);
    });
  }

  function firstLanguageOpportunityTargets(state) {
    return [7, 8, 9, 10].filter((target) => languageClbList(state, "first").some((clb) => clb < target));
  }

  function firstLanguageName(state) {
    const language = getLanguageTest(state, "first").language;
    if (language === "english") return "English";
    if (language === "french") return "French";
    return "first language";
  }

  function languageBenchmarkLabel(state, prefix, targetClb) {
    const benchmark = languageBenchmarkAcronym(getLanguageTest(state, prefix));
    return targetClb >= 10 ? `${benchmark} 10+` : `${benchmark} ${targetClb}+`;
  }

  function languageBenchmarkAcronym(test) {
    return test.language === "french" ? "NCLC" : "CLB";
  }

  function languageScoreOptionLabel(test, score, ability) {
    const scoreLabel = score[ability];
    return score.clb ? `${scoreLabel} (${languageBenchmarkAcronym(test)} ${score.clb})` : scoreLabel;
  }

  function firstLanguageOpportunityDefinitions(state) {
    return firstLanguageOpportunityTargets(state).map((targetClb) => ({
      id: `first-language-clb-${targetClb}`,
      title: `Raise ${firstLanguageName(state)} to ${languageBenchmarkLabel(state, "first", targetClb)} in all four abilities`,
      mutate(next) {
        raiseLanguageGroupToClb(next, "first", targetClb);
      }
    }));
  }

  const EDUCATION_RANK = {
    lessSecondary: 0,
    secondary: 1,
    oneYear: 2,
    twoYear: 3,
    bachelor: 4,
    twoOrMore: 5,
    masters: 6,
    phd: 7
  };

  function setEducationAtLeast(state, target) {
    if (EDUCATION_RANK[state.education] < EDUCATION_RANK[target]) {
      state.education = target;
    }
  }

  function ageNumber(ageKey) {
    if (ageKey === "17-less") return 17;
    if (ageKey === "20-25") return 25;
    if (ageKey === "45-plus") return 45;
    return numeric(ageKey);
  }

  function ageKeyFromNumber(age) {
    if (age <= 17) return "17-less";
    if (age >= 20 && age <= 25) return "20-25";
    if (age >= 45) return "45-plus";
    return String(age);
  }

  function advanceAge(state, years) {
    if (years <= 0) return;
    state.age = ageKeyFromNumber(ageNumber(state.age) + years);
  }

  function yearsToCanadianWorkTarget(state, targetYears) {
    return Math.max(targetYears - numeric(state.canadianWork), 0);
  }

  function scenarioDefinitions(state) {
    const firstLanguageOpportunities = firstLanguageOpportunityDefinitions(state);
    return [
      {
        id: "canadian-work-year",
        title: `Add Canadian skilled work: ${CANADIAN_WORK_BY_VALUE[incrementCanadianWork(state.canadianWork)].label}`,
        mutate(next) {
          advanceAge(next, numeric(incrementCanadianWork(next.canadianWork)) - numeric(next.canadianWork));
          next.canadianWork = incrementCanadianWork(next.canadianWork);
        }
      },
      {
        id: "canadian-work-two-years",
        title: "Reach 2 years Canadian skilled work",
        mutate(next) {
          advanceAge(next, yearsToCanadianWorkTarget(next, 2));
          if (numeric(next.canadianWork) < 2) next.canadianWork = "2";
        }
      },
      ...firstLanguageOpportunities,
      {
        id: "french-nclc-seven",
        title: "Reach French NCLC 7 in all four abilities",
        mutate(next) {
          setFrenchScenario(next, 7);
        }
      },
      {
        id: "french-nclc-nine",
        title: "Reach French NCLC 9 in all four abilities",
        mutate(next) {
          setFrenchScenario(next, 9);
        }
      },
      {
        id: "canadian-education-one-two",
        title: "Complete Canadian 1-2 year credential",
        mutate(next) {
          advanceAge(next, 2);
          setEducationAtLeast(next, "twoOrMore");
          if (next.canadianEducation === "none") next.canadianEducation = "oneTwo";
        }
      },
      {
        id: "canadian-education-three-plus",
        title: "Complete Canadian 3+ year credential",
        mutate(next) {
          advanceAge(next, 3);
          setEducationAtLeast(next, "twoOrMore");
          next.canadianEducation = "threePlus";
        }
      },
      {
        id: "canadian-masters",
        title: "Complete Canadian master's credential",
        mutate(next) {
          advanceAge(next, 2);
          setEducationAtLeast(next, "masters");
          next.canadianEducation = "threePlus";
        }
      },
      {
        id: "eca-two-or-more",
        title: "ECA upgrade: two or more credentials",
        mutate(next) {
          setEducationAtLeast(next, "twoOrMore");
        }
      },
      {
        id: "eca-masters",
        title: "ECA upgrade: master's credential",
        mutate(next) {
          setEducationAtLeast(next, "masters");
        }
      },
      {
        id: "provincial-nomination",
        title: "Add provincial nomination",
        mutate(next) {
          next.nomination = true;
        }
      }
    ];
  }

  function buildScenario(state, definition) {
    const current = scoreProfile(state);
    const nextState = cloneState(state);
    definition.mutate(nextState);
    const projected = scoreProfile(nextState);
    return {
      ...definition,
      current,
      projected,
      nextState,
      delta: projected.total - current.total,
      componentDeltas: buildComponentDeltas(current, projected)
    };
  }

  function buildComponentDeltas(current, projected) {
    const rows = [
      ["Age", projected.details.core.age - current.details.core.age],
      ["Education", projected.details.core.education - current.details.core.education],
      ["First official language", projected.details.core.firstLanguage - current.details.core.firstLanguage],
      ["Second official language", projected.details.core.secondLanguage - current.details.core.secondLanguage],
      ["Canadian work", projected.details.core.canadianWork - current.details.core.canadianWork],
      ["Spouse factors", sumValues(projected.details.spouse) - sumValues(current.details.spouse)],
      [
        "Skill transferability: education",
        projected.details.transferGroups.education - current.details.transferGroups.education
      ],
      [
        "Skill transferability: foreign work",
        projected.details.transferGroups.foreignWork - current.details.transferGroups.foreignWork
      ],
      ["Skill transferability: certificate", projected.details.transfer.certificate - current.details.transfer.certificate],
      ["Additional points", projected.breakdown.additional - current.breakdown.additional]
    ];
    return rows.filter(([, delta]) => delta !== 0);
  }

  // ----- Rendering and event wiring -----
  let state = loadStoredState();
  let themeMode = loadStoredThemeMode();
  let lastRenderedResult = null;

  function loadStoredState() {
    if (!storageAvailable()) return cloneState(DEFAULT_STATE);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneState(DEFAULT_STATE);
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || !saved.factors) {
        return cloneState(DEFAULT_STATE);
      }
      return sanitizeStoredState(saved.factors);
    } catch (error) {
      return cloneState(DEFAULT_STATE);
    }
  }

  function sanitizeStoredState(factors) {
    const next = cloneState(DEFAULT_STATE);
    Object.keys(DEFAULT_STATE).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(factors, key)) {
        next[key] = typeof DEFAULT_STATE[key] === "boolean" ? Boolean(factors[key]) : String(factors[key]);
      }
    });
    next.age = normalizeAgeKey(next.age);
    ensureSecondLanguageTestState(next);
    return next;
  }

  function persistState(result) {
    if (!storageAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        factors: cloneState(state),
        score: {
          total: result.total,
          breakdown: result.breakdown,
          details: result.details,
          caps: result.caps,
          spousePath: result.spousePath
        }
      }));
    } catch (error) {
      // Storage can fail in private browsing or locked-down file contexts.
    }
  }

  function storageAvailable() {
    try {
      return typeof localStorage !== "undefined";
    } catch (error) {
      return false;
    }
  }

  function normalizeThemeMode(value) {
    return THEME_MODES.includes(value) ? value : "system";
  }

  function nextThemeMode(currentMode) {
    const currentIndex = THEME_MODES.indexOf(normalizeThemeMode(currentMode));
    return THEME_MODES[(currentIndex + 1) % THEME_MODES.length];
  }

  function themeModeLabel(mode) {
    const normalized = normalizeThemeMode(mode);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  function themeModeIcon(mode) {
    return {
      system: "⚙",
      light: "☀",
      dark: "☾"
    }[normalizeThemeMode(mode)];
  }

  function loadStoredThemeMode() {
    if (!storageAvailable()) return "system";
    try {
      return normalizeThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
    } catch (error) {
      return "system";
    }
  }

  function persistThemeMode(mode) {
    if (!storageAvailable()) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalizeThemeMode(mode));
    } catch (error) {
      // Storage can fail in private browsing or locked-down file contexts.
    }
  }

  function applyThemeMode(mode) {
    if (typeof document === "undefined") return;
    const normalized = normalizeThemeMode(mode);
    document.documentElement.dataset.theme = normalized;
  }

  function setThemeMode(mode) {
    themeMode = normalizeThemeMode(mode);
    applyThemeMode(themeMode);
    syncThemeControls();
    persistThemeMode(themeMode);
  }

  function setupControls() {
    applyThemeMode(themeMode);
    syncThemeControls();
    renderMaritalControls();
    renderPolygonMaritalControl();
    renderAgeControls();
    renderWorkControls();
    renderSelectControls();
    renderLanguageScoreControls();
    syncInputs();
  }

  function renderSelectControls() {
    Object.keys(SELECT_CONFIG).forEach((field) => {
      const select = document.querySelector(`[data-field="${field}"]`);
      if (!select) return;
      select.innerHTML = optionMarkup(selectOptionsForField(field, state), state[field]);
    });
  }

  function syncThemeControls() {
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const label = themeModeLabel(themeMode);
    button.dataset.themeMode = themeMode;
    button.textContent = themeModeIcon(themeMode);
    button.setAttribute("aria-label", `Theme: ${label}. Click to switch theme.`);
  }

  function renderMaritalControls() {
    const root = document.getElementById("maritalControls");
    root.innerHTML = MARITAL_OPTIONS.map((option) => (
      `<button type="button" data-marital="${option.value}" aria-pressed="false">${option.label}</button>`
    )).join("");
  }

  function renderPolygonMaritalControl() {
    const select = document.getElementById("polygonMaritalStatus");
    select.innerHTML = optionMarkup(MARITAL_OPTIONS, state.maritalStatus);
  }

  function renderAgeControls() {
    const root = document.getElementById("ageControls");
    root.innerHTML = AGE_OPTIONS.map(([value, label]) => (
      `<button type="button" data-age="${value}" aria-pressed="false">${label}</button>`
    )).join("");
  }

  function renderWorkControls() {
    const configs = [
      ["canadianWorkControls", "canadianWork", CANADIAN_WORK_OPTIONS],
      ["foreignWorkControls", "foreignWork", FOREIGN_WORK_OPTIONS],
      ["spouseCanadianWorkControls", "spouseCanadianWork", CANADIAN_WORK_OPTIONS]
    ];
    configs.forEach(([id, field, options]) => {
      const root = document.getElementById(id);
      if (!root) return;
      root.innerHTML = options.map((option) => (
        `<button type="button" data-work-field="${field}" data-work-value="${option.value}" aria-pressed="false" title="${option.label}">${shortWorkLabel(option)}</button>`
      )).join("");
    });
  }

  function shortWorkLabel(option) {
    if (option.value === "0") return "0";
    if (option.value === "5") return "5+";
    if (option.value === "3" && option.label.includes("more")) return "3+";
    return option.value;
  }

  function renderLanguageScoreControls() {
    ["first", "second", "spouse"].forEach((prefix) => {
      ensureLanguageScoreState(prefix);
      const group = document.querySelector(`[data-language-group="${prefix}"]`);
      const test = getLanguageTest(state, prefix);
      if (group && group.dataset.hideWhenNoTest === "true") {
        group.hidden = test.value === "none";
      }
      document.querySelectorAll(`[data-score-select="${prefix}"]`).forEach((select) => {
        const ability = abilityFromField(select.dataset.field, prefix);
        select.innerHTML = test.scores.map((score) => {
          const label = languageScoreOptionLabel(test, score, ability);
          return `<option value="${score.value}">${label}</option>`;
        }).join("");
        select.disabled = test.value === "none";
      });
    });
  }

  function ensureLanguageScoreState(prefix) {
    const test = getLanguageTest(state, prefix);
    const validValues = new Set(test.scores.map((score) => score.value));
    const fallback = defaultLanguageScore(prefix, test);
    LANGUAGE_ABILITIES.forEach((ability) => {
      const field = `${prefix}${ability}`;
      if (!validValues.has(state[field])) {
        state[field] = fallback;
      }
    });
  }

  function defaultLanguageScore(prefix, test) {
    if (test.value === "none") return "none";
    return prefix === "first" ? "E" : "A";
  }

  function abilityFromField(field, prefix) {
    return field.slice(prefix.length).toLowerCase();
  }

  function syncInputs() {
    document.querySelectorAll("[data-field]").forEach((control) => {
      const field = control.dataset.field;
      if (control.type === "checkbox") {
        control.checked = Boolean(state[field]);
      } else {
        control.value = state[field];
      }
    });
  }

  function bindEvents() {
    const viewToggle = document.getElementById("viewToggle");
    viewToggle.addEventListener("click", () => {
      const currentView = document.body.dataset.view === POLYGON_VIEW ? POLYGON_VIEW : DASHBOARD_VIEW;
      const nextView = currentView === POLYGON_VIEW ? DASHBOARD_VIEW : POLYGON_VIEW;
      updateUrlForView(nextView);
      render();
    });

    document.getElementById("themeToggle").addEventListener("click", () => {
      setThemeMode(nextThemeMode(themeMode));
    });

    window.addEventListener("popstate", render);

    document.getElementById("polygonView").addEventListener("change", (event) => {
      const control = event.target.closest("[data-polygon-field]");
      if (!control) return;
      applyPolygonControl(control);
      render();
    });

    document.getElementById("maritalControls").addEventListener("click", (event) => {
      const button = event.target.closest("[data-marital]");
      if (!button) return;
      state.maritalStatus = button.dataset.marital;
      render();
    });

    document.getElementById("ageControls").addEventListener("click", (event) => {
      const button = event.target.closest("[data-age]");
      if (!button) return;
      state.age = button.dataset.age;
      render();
    });

    document.querySelectorAll(".work-grid").forEach((root) => {
      root.addEventListener("click", (event) => {
        const button = event.target.closest("[data-work-field]");
        if (!button) return;
        state[button.dataset.workField] = button.dataset.workValue;
        render();
      });
    });

    document.querySelectorAll("[data-field]").forEach((control) => {
      control.addEventListener("change", () => {
        const field = control.dataset.field;
        state[field] = control.type === "checkbox" ? control.checked : control.value;
        if (field.endsWith("Test")) {
          const prefix = field.replace("Test", "");
          resetLanguageScores(prefix);
        }
        render();
      });
    });
  }

  function resetLanguageScores(prefix) {
    resetLanguageScoreFields(state, prefix);
  }

  function resetLanguageScoreFields(targetState, prefix) {
    const fallback = defaultLanguageScore(prefix, getLanguageTest(targetState, prefix));
    LANGUAGE_ABILITIES.forEach((ability) => {
      targetState[`${prefix}${ability}`] = fallback;
    });
  }

  function applyPolygonControl(control) {
    const field = control.dataset.polygonField;
    if (field) {
      state[field] = control.type === "checkbox" ? control.checked : control.value;
      if (field.endsWith("Test")) {
        resetLanguageScores(field.replace("Test", ""));
      }
    }
  }

  function normalizeViewMode(value) {
    return value === POLYGON_VIEW ? POLYGON_VIEW : DASHBOARD_VIEW;
  }

  function viewFromUrl() {
    if (typeof window === "undefined") return DASHBOARD_VIEW;
    return normalizeViewMode(new URL(window.location.href).searchParams.get("view"));
  }

  function updateUrlForView(view) {
    if (typeof window === "undefined" || !window.history) return;
    const nextView = normalizeViewMode(view);
    const url = new URL(window.location.href);
    if (nextView === POLYGON_VIEW) {
      url.searchParams.set("view", POLYGON_VIEW);
    } else {
      url.searchParams.delete("view");
    }
    window.history.pushState({ view: nextView }, "", url);
  }

  function syncViewMode(result) {
    const view = viewFromUrl();
    const scoreView = document.getElementById("scoreView");
    const polygonView = document.getElementById("polygonView");
    const viewToggle = document.getElementById("viewToggle");

    document.body.dataset.view = view;
    scoreView.hidden = view !== DASHBOARD_VIEW;
    polygonView.hidden = view !== POLYGON_VIEW;
    viewToggle.textContent = view === POLYGON_VIEW ? "Dashboard view" : "Polygon view";
    viewToggle.setAttribute("aria-pressed", String(view === POLYGON_VIEW));
    viewToggle.setAttribute("aria-label", view === POLYGON_VIEW ? "Show dashboard view" : "Show polygon view");

    renderPolygon(result);
    syncPolygonControls();
  }

  function render() {
    ensureSecondLanguageTestState(state);
    renderSelectControls();
    renderLanguageScoreControls();
    syncInputs();
    renderActiveButtons();
    document.getElementById("spouseBlock").hidden = !hasAccompanyingSpouse(state);
    const result = scoreProfile(state);

    renderRollingNumber(document.getElementById("totalScore"), result.total);

    renderBreakdown(result);
    renderDetails(result, lastRenderedResult);
    renderScenarios();
    syncViewMode(result);
    persistState(result);
    lastRenderedResult = result;
  }

  function renderActiveButtons() {
    document.querySelectorAll("[data-marital]").forEach((button) => {
      const active = button.dataset.marital === state.maritalStatus;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-age]").forEach((button) => {
      const active = button.dataset.age === state.age;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-work-field]").forEach((button) => {
      const active = state[button.dataset.workField] === button.dataset.workValue;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function syncPolygonControls() {
    document.querySelectorAll("[data-polygon-field]").forEach((control) => {
      const field = control.dataset.polygonField;
      if (!(field in state)) return;
      if (control.type === "checkbox") {
        control.checked = Boolean(state[field]);
      } else {
        control.value = state[field];
      }
    });
  }

  function renderBreakdown(result) {
    const rows = [
      { label: "Core / human capital", value: result.breakdown.core, cap: result.caps.core },
      ...(result.spousePath ? [{ label: "Spouse factors", value: result.breakdown.spouse, cap: result.caps.spouse }] : []),
      { label: "Skill transferability", value: result.breakdown.transferability, cap: result.caps.transferability },
      { label: "Additional points", value: result.breakdown.additional, cap: result.caps.additional }
    ];

    const root = document.getElementById("breakdown");
    const signature = rows.map((row) => row.label).join("|");

    if (root.dataset.breakdownSignature !== signature) {
      root.dataset.breakdownSignature = signature;
      root.innerHTML = rows.map((row) => `
        <div class="bar-row" data-breakdown-label="${escapeHtml(row.label)}">
          <div class="bar-label">${escapeHtml(row.label)}</div>
          <div class="bar-track"><div class="bar-fill" data-bar-fill style="width: 0%"></div></div>
          <div class="bar-value" data-bar-value>0/${row.cap}</div>
        </div>
      `).join("");
      requestAnimationFrame(() => updateBreakdownBars(root, rows));
      return;
    }

    updateBreakdownBars(root, rows);
  }

  function updateBreakdownBars(root, rows) {
    root.querySelectorAll(".bar-row").forEach((rowElement, index) => {
      const row = rows[index];
      if (!row) return;
      const width = row.cap > 0 ? Math.min((row.value / row.cap) * 100, 100) : 0;
      rowElement.querySelector("[data-bar-fill]").style.width = `${width}%`;
      rowElement.querySelector("[data-bar-value]").textContent = `${row.value}/${row.cap}`;
    });
  }

  function detailRows(result) {
    return [
      { key: "age", label: "Age", value: result.details.core.age },
      { key: "education", label: "Education", value: result.details.core.education },
      { key: "firstLanguage", label: "First language", value: result.details.core.firstLanguage },
      { key: "secondLanguage", label: "Second language", value: result.details.core.secondLanguage },
      { key: "canadianWork", label: "Canadian work", value: result.details.core.canadianWork },
      { key: "spouse", label: "Spouse factors", value: result.breakdown.spouse },
      { key: "educationTransfer", label: "Education transfer", value: result.details.transferGroups.education },
      { key: "foreignWorkTransfer", label: "Foreign work transfer", value: result.details.transferGroups.foreignWork },
      { key: "certificateTransfer", label: "Certificate transfer", value: result.details.transfer.certificate },
      { key: "additional", label: "Additional", value: result.breakdown.additional }
    ];
  }

  function detailDeltaByKey(previousResult) {
    if (!previousResult) return {};
    return Object.fromEntries(detailRows(previousResult).map((row) => [row.key, row.value]));
  }

  function renderDetails(result, previousResult) {
    const previousValues = detailDeltaByKey(previousResult);
    document.getElementById("detailGrid").innerHTML = detailRows(result).map((row) => {
      const previous = previousValues[row.key];
      const delta = typeof previous === "number" ? row.value - previous : 0;
      const changeClass = delta > 0 ? "detail-score-up" : delta < 0 ? "detail-score-down" : "";
      const arrow = delta ? `<span class="detail-arrow" aria-hidden="true">${delta > 0 ? "▲" : "▼"}</span>` : "";
      const changeLabel = delta
        ? ` aria-label="${escapeHtml(`${row.label} ${row.value}, ${delta > 0 ? "increased" : "decreased"} by ${Math.abs(delta)}`)}"`
        : "";
      return `
      <div class="detail" data-detail-key="${escapeHtml(row.key)}">
        <div class="detail-score ${changeClass}">
          <b${changeLabel}>${row.value}</b>
          ${arrow}
        </div>
        <span>${escapeHtml(row.label)}</span>
      </div>
    `;
    }).join("");
  }

  function renderScenarios() {
    const scenarios = scenarioDefinitions(state)
      .map((definition) => buildScenario(state, definition))
      .filter((scenario) => scenario.delta > 0)
      .sort((a, b) => b.delta - a.delta);
    document.getElementById("scenarios").innerHTML = scenarios.map((scenario) => `
      <article class="scenario">
        <div class="scenario-head">
          <h3>${scenario.title}</h3>
          <div class="scenario-metrics" aria-label="Score change ${formatDelta(scenario.delta)}; projected total ${scenario.projected.total}">
            <div class="scenario-delta">${formatDelta(scenario.delta)}</div>
            <div class="scenario-projected">${scenario.projected.total}</div>
          </div>
        </div>
        <div class="delta-list">
          ${scenario.componentDeltas.map(([label, delta]) => `
            <div class="delta-row"><span>${label}</span><strong>${formatDelta(delta)}</strong></div>
          `).join("")}
        </div>
      </article>
    `).join("");
  }

  function polygonFactors(result) {
    const languageValue = result.details.core.firstLanguage + result.details.core.secondLanguage;
    const factors = [
      { key: "age", label: "Age", value: result.details.core.age, cap: result.spousePath ? 100 : 110 },
      { key: "education", label: "Education", value: result.details.core.education, cap: result.spousePath ? 140 : 150 },
      { key: "languages", label: "Languages", value: languageValue, cap: result.spousePath ? 150 : 160 },
      { key: "canadianWork", label: "Canadian work", value: result.details.core.canadianWork, cap: result.spousePath ? 70 : 80 }
    ];

    factors.push(
      { key: "transferability", label: "Transferability", value: result.breakdown.transferability, cap: result.caps.transferability },
      ...(result.spousePath ? [{ key: "spouse", label: "Spouse factors", value: result.breakdown.spouse, cap: 40 }] : []),
      { key: "additional", label: "Additional", value: result.breakdown.additional, cap: result.caps.additional }
    );

    return factors;
  }

  function renderPolygon(result) {
    const polygon = document.getElementById("scorePolygon");
    if (!polygon) return;

    const factors = polygonFactors(result);
    const centerX = POLYGON_CENTER_X;
    const centerY = POLYGON_CENTER_Y;
    const radius = POLYGON_RADIUS;
    const outerPoints = factors.map((factor, index) => polygonPoint(centerX, centerY, radius, index, factors.length));
    const scorePoints = factors.map((factor, index) => {
      const ratio = factor.cap > 0 ? Math.min(factor.value / factor.cap, 1) : 0;
      return polygonPoint(centerX, centerY, radius * ratio, index, factors.length);
    });

    document.getElementById("polygonGrid").innerHTML = [
      ...[0.25, 0.5, 0.75].map((scale) => (
        `<polygon class="polygon-grid" points="${formatPoints(outerPoints.map((point) => scalePoint(point, centerX, centerY, scale)))}"></polygon>`
      )),
      `<polygon class="polygon-boundary" points="${formatPoints(outerPoints)}"></polygon>`,
      ...outerPoints.map((point) => (
        `<line class="polygon-axis" x1="${centerX}" y1="${centerY}" x2="${round(point.x)}" y2="${round(point.y)}"></line>`
      ))
    ].join("");

    animatePolygonShape(document.getElementById("polygonShape"), scorePoints);
    document.getElementById("polygonOutline").setAttribute("points", formatPoints(outerPoints));
    document.getElementById("polygonVertices").innerHTML = factors.map((factor, index) => {
      const outer = outerPoints[index];
      const score = scorePoints[index];
      return `
        <circle class="polygon-vertex" cx="${round(outer.x)}" cy="${round(outer.y)}" r="5"></circle>
        <circle class="polygon-point" cx="${round(score.x)}" cy="${round(score.y)}" r="6"></circle>
      `;
    }).join("");
    renderPolygonEditors(factors, centerX, centerY, radius);
    renderRollingNumber(document.getElementById("polygonScore"), result.total);
  }

  function renderPolygonEditors(factors, centerX, centerY, radius) {
    document.getElementById("polygonEditors").innerHTML = factors.map((factor, index) => {
      const point = polygonPoint(centerX, centerY, radius + 18, index, factors.length);
      const position = polygonEditorPosition(point);
      return `
        <section class="polygon-editor" data-factor-key="${factor.key}" data-anchor="${position.anchor}" style="left: ${position.left}%; top: ${position.top}%;">
          <div class="polygon-editor-title">
            <b>${escapeHtml(factor.label)}</b>
            <span>${factor.value}/${factor.cap}</span>
          </div>
          <div class="polygon-editor-body">
            ${polygonEditorControls(factor.key)}
          </div>
        </section>
      `;
    }).join("");
  }

  function polygonEditorControls(key) {
    if (key === "age") {
      return polygonSelect("polygonAge", "Age", "age", state.age, AGE_OPTIONS, { hideLabel: true });
    }
    if (key === "education") {
      return polygonSelect("polygonEducation", "Education", "education", state.education, EDUCATION_OPTIONS, { hideLabel: true });
    }
    if (key === "languages") {
      return `
        ${polygonLanguageControls("first", "First test", FIRST_LANGUAGE_TEST_OPTIONS)}
        ${polygonLanguageControls("second", "Second test", secondOfficialLanguageTestOptions(state))}
      `;
    }
    if (key === "canadianWork") {
      return polygonSelect("polygonCanadianWork", "Years", "canadianWork", state.canadianWork, CANADIAN_WORK_OPTIONS, { hideLabel: true });
    }
    if (key === "spouse") {
      return `
        ${polygonSelect("polygonSpouseEducation", "Education", "spouseEducation", state.spouseEducation, SPOUSE_EDUCATION_OPTIONS)}
        ${polygonLanguageControls("spouse", "Language test", OPTIONAL_LANGUAGE_TEST_OPTIONS)}
        ${polygonSelect("polygonSpouseWork", "Work", "spouseCanadianWork", state.spouseCanadianWork, CANADIAN_WORK_OPTIONS)}
      `;
    }
    if (key === "transferability") {
      return `
        ${polygonSelect("polygonForeignWork", "Foreign work", "foreignWork", state.foreignWork, FOREIGN_WORK_OPTIONS)}
        ${polygonCheckbox("polygonCertificate", "Certificate", "certificate", state.certificate)}
      `;
    }
    if (key === "additional") {
      return `
        ${polygonSelect("polygonCanadianEducation", "Canadian education", "canadianEducation", state.canadianEducation, CANADIAN_EDUCATION_OPTIONS)}
        <div class="polygon-editor-row">
          ${polygonCheckbox("polygonSibling", "Sibling", "sibling", state.sibling)}
          ${polygonCheckbox("polygonNomination", "PNP", "nomination", state.nomination)}
        </div>
      `;
    }
    return "";
  }

  function polygonLanguageControls(prefix, label, testOptions) {
    const test = getLanguageTest(state, prefix);
    return `
      <div class="polygon-language-section">
        ${polygonSelect(`polygon${capitalize(prefix)}Test`, label, `${prefix}Test`, state[`${prefix}Test`], testOptions)}
        ${test.value === "none" ? "" : polygonLanguageAbilityGrid(prefix)}
      </div>
    `;
  }

  function polygonLanguageAbilityGrid(prefix) {
    return `
      <div class="polygon-editor-ability-grid">
        ${["Listening", "Reading", "Writing", "Speaking"].map((ability) => {
          const field = `${prefix}${ability}`;
          return polygonSelect(
            `polygon${capitalize(prefix)}${ability}`,
            polygonAbilityLabel(ability),
            field,
            state[field],
            languageScoreOptions(prefix, ability.toLowerCase()),
            { ariaLabel: ability }
          );
        }).join("")}
      </div>
    `;
  }

  function polygonAbilityLabel(ability) {
    return {
      Listening: "L",
      Reading: "R",
      Writing: "W",
      Speaking: "S"
    }[ability] || ability;
  }

  function languageScoreOptions(prefix, ability) {
    const test = getLanguageTest(state, prefix);
    return test.scores.map((score) => ({
      value: score.value,
      label: score[ability]
    }));
  }

  function animatePolygonShape(element, nextPoints) {
    if (!element) return;
    const next = nextPoints.map((point) => ({ x: round(point.x), y: round(point.y) }));
    const previous = parsePolygonPoints(element.dataset.currentPoints || element.getAttribute("points"));

    if (!previous || previous.length !== next.length) {
      setPolygonShapePoints(element, next);
      return;
    }

    if (formatPoints(previous) === formatPoints(next)) return;

    cancelPolygonAnimation(element);
    element.classList.add("is-morphing");

    const duration = 620;
    const start = nowMs();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easePolygonMorph(progress);
      setPolygonShapePoints(element, interpolatePolygonPoints(previous, next, eased));

      if (progress < 1) {
        element._polygonFrame = requestFrame(tick);
      } else {
        element.classList.remove("is-morphing");
        element._polygonFrame = null;
        setPolygonShapePoints(element, next);
      }
    };

    element._polygonFrame = requestFrame(tick);
  }

  function cancelPolygonAnimation(element) {
    if (!element._polygonFrame) return;
    if (typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(element._polygonFrame);
    } else {
      clearTimeout(element._polygonFrame);
    }
    element._polygonFrame = null;
  }

  function setPolygonShapePoints(element, points) {
    const formatted = formatPoints(points);
    element.setAttribute("points", formatted);
    element.dataset.currentPoints = formatted;
  }

  function interpolatePolygonPoints(fromPoints, toPoints, progress) {
    return toPoints.map((point, index) => {
      const from = fromPoints[index] || point;
      return {
        x: from.x + (point.x - from.x) * progress,
        y: from.y + (point.y - from.y) * progress
      };
    });
  }

  function parsePolygonPoints(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) return null;
    return trimmed.split(/\s+/).map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    }).filter(Boolean);
  }

  function easePolygonMorph(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function requestFrame(callback) {
    if (typeof requestAnimationFrame === "function") {
      return requestAnimationFrame(callback);
    }
    return setTimeout(() => callback(nowMs()), 16);
  }

  function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  function polygonSelect(id, label, field, value, options, config = {}) {
    const ariaLabel = config.ariaLabel || (config.hideLabel ? label : "");
    return `
      <div class="polygon-editor-field">
        ${config.hideLabel ? "" : `<label for="${id}">${escapeHtml(label)}</label>`}
        <select id="${id}" data-polygon-field="${field}" ${ariaLabel ? `aria-label="${escapeHtml(ariaLabel)}"` : ""}>
          ${optionMarkup(options, value)}
        </select>
      </div>
    `;
  }

  function polygonCheckbox(id, label, field, checked) {
    return `
      <label class="polygon-check" for="${id}">
        <input id="${id}" type="checkbox" data-polygon-field="${field}" ${checked ? "checked" : ""}>
        ${escapeHtml(label)}
      </label>
    `;
  }

  function optionMarkup(options, selectedValue) {
    return options.map((option) => {
      const value = Array.isArray(option) ? option[0] : option.value;
      const label = Array.isArray(option) ? option[1] : option.label;
      return `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(label)}</option>`;
    }).join("");
  }

  function polygonEditorPosition(point) {
    const anchor = polygonEditorAnchor(point);
    return {
      anchor,
      left: round(clamp((point.x / POLYGON_WIDTH) * 100, 8, 92)),
      top: round(clamp((point.y / POLYGON_HEIGHT) * 100, 7, 93))
    };
  }

  function polygonEditorAnchor(point) {
    if (point.y < POLYGON_HEIGHT * 0.22) return "top";
    if (point.y > POLYGON_HEIGHT * 0.78) return "bottom";
    return point.x < POLYGON_CENTER_X ? "left" : "right";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function renderRollingNumber(element, value) {
    if (!element) return;
    const formatted = value.toLocaleString("en-CA");
    const previous = element.dataset.scoreValue || formatted;
    if (element.dataset.scoreValue === formatted) return;

    element.setAttribute("aria-label", formatted);
    element.dataset.scoreValue = formatted;
    element.innerHTML = formatted.split("").map((char, index) => {
      if (!isDigit(char)) {
        return `<span class="score-separator" aria-hidden="true">${char}</span>`;
      }

      const previousDigit = previousDigitForFormattedIndex(previous, formatted, index);
      if (previousDigit === char) {
        return `<span class="score-static-digit" aria-hidden="true">${char}</span>`;
      }

      const sequence = scoreDigitSequence(previousDigit, char);
      return `
        <span class="score-digit" aria-hidden="true">
          <span class="score-digit-strip" style="--digit-index: ${index}; --digit-steps: ${sequence.length};">
            ${sequence.map((digit) => `<span>${digit}</span>`).join("")}
          </span>
        </span>
      `;
    }).join("");
  }

  function previousDigitForFormattedIndex(previous, formatted, formattedIndex) {
    if (!isDigit(formatted[formattedIndex])) return undefined;

    const digitsToRight = formatted
      .slice(formattedIndex + 1)
      .split("")
      .filter(isDigit).length;
    let seenDigits = 0;

    for (let index = previous.length - 1; index >= 0; index -= 1) {
      if (!isDigit(previous[index])) continue;
      if (seenDigits === digitsToRight) return previous[index];
      seenDigits += 1;
    }

    return undefined;
  }

  function scoreDigitShouldRoll(previous, formatted, formattedIndex) {
    const digit = formatted[formattedIndex];
    return isDigit(digit) && previousDigitForFormattedIndex(previous, formatted, formattedIndex) !== digit;
  }

  function scoreDigitSequence(previous, next) {
    const start = isDigit(previous) ? previous : "0";
    const target = isDigit(next) ? next : "0";
    return [start, "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", target];
  }

  function isDigit(value) {
    return typeof value === "string" && /^[0-9]$/.test(value);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function polygonPoint(centerX, centerY, radius, index, total) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  function scalePoint(point, centerX, centerY, scale) {
    return {
      x: centerX + (point.x - centerX) * scale,
      y: centerY + (point.y - centerY) * scale
    };
  }

  function formatPoints(points) {
    return points.map((point) => `${round(point.x)},${round(point.y)}`).join(" ");
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  function formatDelta(value) {
    return value > 0 ? `+${value}` : String(value);
  }

  function boot() {
    setupControls();
    bindEvents();
    render();
  }

  const api = {
    SOURCE_URLS,
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
    languageScoreOptionLabel,
    secondOfficialLanguageTestOptions,
    normalizeThemeMode,
    nextThemeMode,
    themeModeIcon
  };

  globalThis.CRS_DASHBOARD = api;

  if (typeof document !== "undefined") {
    applyThemeMode(themeMode);
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
