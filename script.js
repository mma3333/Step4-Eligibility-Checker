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
  "Has the educator completed the Intro to ECE (90-hour online course)?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?"
];

const level1Questions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Does the educator hold recognized qualifications (ECE Certificate/Diploma or Degree)?",
  "When was the educator's qualification issued?",
  "Has the educator accumulated at least 3 years of relevant work experience?",
  "Is the educator at least 19 years old?",
  "Is the Educator Conditionally Approved?",
  "Was the educator approved in error for their current step?"
];

const expectedAnswers = {
  entry:  ["Yes", "Yes", "Yes", "Yes", "No", "No"],
};

const schoolAgeQuestions = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Does the educator hold recognized qualifications (ECE Certificate/Diploma or Degree)?",
  "Is the educator at least 19 years old?"
];

function handleChange(step) {
  const levelValue = document.getElementById("level").value;
  const ageGroupSelect = document.getElementById("ageGroup");

  if (step === 0) {
    answers.level = levelValue;
    answers.ageGroup = null;
    userResponses = {};
    questionFlow = [];
    currentQuestionIndex = 0;

    if (ageGroupSelect) {
      ageGroupSelect.value = "";
    }

    document.getElementById("group-q1").style.display = levelValue ? "block" : "none";
    dynamicQuestionsDiv.innerHTML = "";
    resultSection.style.display = "none";
    resultTitle.innerText = "";
  }

  if (step === 1) {
    answers.ageGroup = ageGroupSelect?.value;
    userResponses = {};
    questionFlow = [];
    currentQuestionIndex = 0;
    dynamicQuestionsDiv.innerHTML = "";
    resultSection.style.display = "none";

    if (answers.ageGroup === "school-age" && answers.level === "level1") {
      questionFlow = schoolAgeQuestions;
    } else {
      questionFlow = answers.level === "entry" ? entryQuestions : level1Questions;
    }

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
  group.appendChild(label);

  if (question.includes("When was the educator's qualification issued")) {
    const input = document.createElement("input");
    input.type = "date";
    input.setAttribute("data-qindex", currentQuestionIndex);
    input.onchange = () => {
      const selectedDate = new Date(input.value);
      const today = new Date();
      const timeDiff = today - selectedDate;
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const years = Math.floor(days / 365);
      const months = Math.floor((days % 365) / 30);
      const dayCount = days % 30;

      userResponses[currentQuestionIndex] = years >= 3 ? "Yes" : "No";
      resultSection.style.display = "none";

      const oldExplanation = group.querySelector(".explanation");
      if (oldExplanation) oldExplanation.remove();

      const explanation = document.createElement("p");
      explanation.className = "explanation";
      explanation.innerText = `Issued: ${years} years, ${months} months, ${dayCount} days ago.\n` +
        (years >= 3 ? "The qualification was issued more than 3 years ago." : "The qualification was issued less than 3 years ago.");
      group.appendChild(explanation);

      updateAnswers();
    };
    group.appendChild(input);
  } else {
    const options = ["Yes", "No"];
    options.forEach(option => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-option";
      btn.textContent = option;
      btn.style.margin = "5px";
      btn.style.padding = "10px 20px";
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "5px";
      btn.style.cursor = "pointer";
      btn.style.backgroundColor = "#f8f8f8";
      btn.style.fontWeight = "bold";

      btn.onclick = function () {
        const allButtons = group.querySelectorAll("button");
        allButtons.forEach(b => {
          b.style.backgroundColor = "#f8f8f8";
          b.style.color = "#000";
        });
        this.style.backgroundColor = "#156b72";
        this.style.color = "#fff";
        userResponses[currentQuestionIndex] = option;
        updateAnswers();
      };

      group.appendChild(btn);
    });
  }

  dynamicQuestionsDiv.appendChild(group);
}

function updateAnswers() {
  const idx = currentQuestionIndex;
  for (let i = idx + 1; i < questionFlow.length; i++) {
    delete userResponses[i];
    const q = document.getElementById(`q-${i}`);
    if (q) q.remove();
  }
  currentQuestionIndex = Object.keys(userResponses).length;
  renderNextQuestion();
  evaluateResult();
}

function evaluateResult() {
  const allAnswered = questionFlow.every((_, i) => userResponses[i] !== undefined);
  if (!allAnswered) return;

  let result = "The Educator is Not Eligible";

  if (answers.ageGroup === "school-age" && answers.level === "level1") {
    const q1 = userResponses[0];
    const q2 = userResponses[1];
    const q3 = userResponses[2];

    if (q1 === "Yes" && q2 === "Yes" && q3 === "Yes") {
      result = "The Educator is Eligible";
    } else if (q1 === "No" && q2 === "Yes" && q3 === "Yes") {
      result = "Submit for Internal Review";
    } else {
      result = "The Educator is Not Eligible";
    }
  } else {
    const expectations = expectedAnswers[answers.level];
    const allMatch = expectations?.every((expected, i) => userResponses[i] === expected);

    if (
      answers.level === "entry" &&
      userResponses[0] === "No" &&
      userResponses[1] === "Yes" &&
      userResponses[2] === "Yes" &&
      userResponses[3] === "Yes" &&
      userResponses[4] === "Yes" &&
      userResponses[5] === "No"
    ) {
      result = "Submit for Internal Review";
    } else if (
      answers.level === "level1" &&
      userResponses[0] === "No" &&
      userResponses[1] === "Yes" &&
      userResponses[2] === "Yes" &&
      userResponses[3] === "Yes" &&
      userResponses[4] === "Yes" &&
      userResponses[5] === "No" &&
      userResponses[6] === "No"
    ) {
      result = "Submit for Internal Review";
    } else if (allMatch) {
      result = "The Educator is Eligible";
    } else {
      result = "The Educator is Not Eligible";
    }
  }

  resultTitle.innerText = result;
  resultSection.style.display = "block";
}
