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
let currentQuestionIndex = 0;

const entryQuestions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Were their qualifications issued at least 3 years ago?",
  "Has the educator completed the Intro to ECE (90-hour online course)?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?"
];

const level1Questions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Does the educator hold recognized qualifications (ECE Certificate/Diploma or Degree)?",
  "Were their qualifications issued at least 3 years ago?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?"
];

// Must match question order exactly
const expectedAnswers = {
  entry:  ["Yes", "Yes", "Yes", "Yes", "Yes", "No", "No"],
  level1: ["No",  "Yes", "Yes", "Yes", "Yes", "No", "No"]
};

const schoolAgeQuestions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Is the educator at least 19 years old?"
];

function handleChange(step) {
  const levelValue = document.getElementById("level").value;
  const ageGroupValue = document.getElementById("ageGroup")?.value;

  if (step === 0) {
    answers.level = levelValue;
    answers.ageGroup = null;
    userResponses = {};
    currentQuestionIndex = 0;
    document.getElementById("group-q1").style.display = levelValue ? "block" : "none";
    dynamicQuestionsDiv.innerHTML = "";
    resultSection.style.display = "none";
  }

  if (step === 1) {
    answers.ageGroup = ageGroupValue;
    userResponses = {};
    currentQuestionIndex = 0;
    dynamicQuestionsDiv.innerHTML = "";
    resultSection.style.display = "none";

    questionFlow = (ageGroupValue === "school-age")
      ? schoolAgeQuestions
      : (answers.level === "entry" ? entryQuestions : level1Questions);

    renderNextQuestion();
  }
}

function renderNextQuestion() {
  if (currentQuestionIndex >= questionFlow.length) {
    evaluateResult();
    return;
  }

  const question = questionFlow[currentQuestionIndex];
  const group = document.createElement("div");
  group.className = "form-group";
  group.id = `q-${currentQuestionIndex}`;

  const label = document.createElement("label");
  label.innerText = `${currentQuestionIndex + 1}. ${question}`;

  const select = document.createElement("select");
  select.setAttribute("data-qindex", currentQuestionIndex);
  select.innerHTML = `
    <option value="">-- Select --</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  `;
  select.onchange = () => {
    const idx = parseInt(select.getAttribute("data-qindex"));
    userResponses[idx] = select.value;

    // Remove all future questions & answers
    for (let i = idx + 1; i < questionFlow.length; i++) {
      delete userResponses[i];
      const q = document.getElementById(`q-${i}`);
      if (q) q.remove();
    }

    resultSection.style.display = "none";
    currentQuestionIndex = idx + 1;
    renderNextQuestion();
  };

  // Restore value if already selected
  if (userResponses[currentQuestionIndex]) {
    select.value = userResponses[currentQuestionIndex];
  }

  group.appendChild(label);
  group.appendChild(select);
  dynamicQuestionsDiv.appendChild(group);
}

function evaluateResult() {
  const allAnswered = questionFlow.every((_, i) => userResponses[i]);
  if (!allAnswered) return;

  let result = "The Educator is Not Eligible";

  if (answers.ageGroup === "school-age") {
    const q1 = userResponses[0];
    const q2 = userResponses[1];

    if (q1 === "Yes" && q2 === "Yes") {
      result = "The Educator is Eligible";
    } else if (q1 === "No" && q2 === "Yes") {
      result = "Submit for Internal Review";
    } else {
      result = "The Educator is Not Eligible";
    }

  } else {
    const expectations = expectedAnswers[answers.level];
    const allMatch = expectations.every((expected, i) => userResponses[i] === expected);

    const firstAnswer = userResponses[0];

    if (allMatch && firstAnswer === "No") {
      result = "Submit for Internal Review";
    } else {
      result = allMatch ? "The Educator is Eligible" : "The Educator is Not Eligible";
    }
  }

  resultTitle.innerText = result;
  resultSection.style.display = "block";
}
