const form = document.getElementById("eligibility-form");
const resultSection = document.getElementById("result-section");
const resultTitle = document.getElementById("result-title");
const dynamicQuestionsDiv = document.getElementById("dynamic-questions");

let answers = {
  level: null,
  ageGroup: null,
};

let questionFlow = [];
let userResponses = {};

const entryQuestions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Has the educator completed the Intro to ECE (90-hour online course)?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?",
];

const level1Questions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Does the educator hold recognized qualifications (ECE Certificate/Diploma or Degree)?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?",
  "Were their qualifications issued at least 3 years ago?",
];

const expectedAnswers = {
  entry: ["Yes", "Yes", "Yes", "Yes", "No", "No"],
  level1: ["No", "Yes", "Yes", "Yes", "No", "No", "Yes"],
};

const schoolAgeQuestions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Is the educator at least 19 years old?",
];

function handleChange(step) {
  const levelValue = document.getElementById("level").value;
  const ageGroupValue = document.getElementById("ageGroup")?.value;

  if (step === 0) {
    answers.level = levelValue;
    userResponses = {};
    resetFromStep(1);
    document.getElementById("group-q1").style.display = levelValue ? "block" : "none";
  }

  if (step === 1) {
    answers.ageGroup = ageGroupValue;
    userResponses = {};
    resetFromStep(2);
    generateQuestions();
  }

  evaluateIfComplete();
}

function resetFromStep(startStep) {
  dynamicQuestionsDiv.innerHTML = "";
  resultSection.style.display = "none";
  questionFlow = [];

  if (startStep <= 2 && answers.ageGroup) {
    generateQuestions();
  }
}

function generateQuestions() {
  dynamicQuestionsDiv.innerHTML = "";
  questionFlow = [];

  if (answers.ageGroup === "school-age") {
    questionFlow = schoolAgeQuestions;
  } else if (answers.ageGroup === "0-5") {
    questionFlow = answers.level === "entry" ? entryQuestions : level1Questions;
  }

  questionFlow.forEach((question, index) => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.innerText = question;

    const select = document.createElement("select");
    select.setAttribute("data-qindex", index);
    select.innerHTML = `
      <option value="">-- Select --</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    `;
    select.onchange = () => {
      const idx = parseInt(select.getAttribute("data-qindex"));
      // Clear future answers when something changes
      Object.keys(userResponses).forEach(key => {
        if (parseInt(key) > idx) delete userResponses[key];
      });
      userResponses[idx] = select.value;
      generateQuestions(); // regenerate to remove later answers
      evaluateIfComplete();
    };

    // if already answered, repopulate
    if (userResponses[index]) {
      select.value = userResponses[index];
    }

    group.appendChild(label);
    group.appendChild(select);
    dynamicQuestionsDiv.appendChild(group);

    // Stop generating further questions if a prior one is unanswered
    if (!userResponses[index]) return;
  });
}

function evaluateIfComplete() {
  if (!answers.ageGroup || !answers.level || questionFlow.length === 0) return;

  const allAnswered = questionFlow.every((_, i) => userResponses[i]);
  if (!allAnswered) {
    resultSection.style.display = "none";
    return;
  }

  // School Age Logic
  if (answers.ageGroup === "school-age") {
    const q1 = userResponses[0];
    const q2 = userResponses[1];

    let result = "The Educator is Not Eligible";
    if (q1 === "Yes" && q2 === "Yes") result = "The Educator is Eligible";
    else if (q1 === "No" && q2 === "Yes") result = "Submit for Internal Review";

    resultTitle.innerText = result;
    resultSection.style.display = "block";
    return;
  }

  // 0–5 Logic (Entry or Level 1)
  const expected = expectedAnswers[answers.level];
  const match = expected.every((ans, i) => userResponses[i] === ans);
  resultTitle.innerText = match ? "The Educator is Eligible" : "The Educator is Not Eligible";
  resultSection.style.display = "block";
}
