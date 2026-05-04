const assert = require("node:assert/strict");
const test = require("node:test");

const {
  api,
  fixtureState
} = require("./context");

const { sanitizeStoredState, scoreProfile } = api;

test("second official language options always use the opposite official language", () => {
  assert.deepEqual(
    api.secondOfficialLanguageTestOptions(fixtureState({ firstTest: "celpip" })).map((option) => option.value),
    ["none", "tef", "tcf"]
  );
  assert.deepEqual(
    api.secondOfficialLanguageTestOptions(fixtureState({ firstTest: "tef" })).map((option) => option.value),
    ["none", "celpip", "ielts", "pte"]
  );
});

test("same-language second official test is normalized out of scoring", () => {
  const state = fixtureState({
    firstTest: "celpip",
    firstListening: "G",
    firstReading: "G",
    firstWriting: "G",
    firstSpeaking: "G",
    secondTest: "ielts",
    secondListening: "H",
    secondReading: "H",
    secondWriting: "H",
    secondSpeaking: "H"
  });

  assert.equal(scoreProfile(state).details.core.secondLanguage, 0);
  assert.equal(sanitizeStoredState(state).secondTest, "none");
  assert.equal(sanitizeStoredState(state).secondListening, "none");
});

test("second-language ability controls unhide when a real second test is selected", () => {
  const group = {
    hidden: true,
    hasAttribute(name) {
      return name === "data-hide-when-no-test";
    }
  };

  api.syncLanguageGroupVisibility(group, { value: "tcf" });
  assert.equal(group.hidden, false);

  api.syncLanguageGroupVisibility(group, { value: "tef" });
  assert.equal(group.hidden, false);

  api.syncLanguageGroupVisibility(group, { value: "none" });
  assert.equal(group.hidden, true);
});

test("language visibility helper ignores groups without the hide marker", () => {
  const group = {
    hidden: true,
    hasAttribute() {
      return false;
    }
  };

  api.syncLanguageGroupVisibility(group, { value: "tcf" });
  assert.equal(group.hidden, true);
});
