<div id="eligibility-form" style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; line-height: 1.6">
  <h2>Step 4 Eligibility Estimator</h2>
  <p style="background-color:#fff3cd; border:1px solid #ffeeba; padding:10px; border-radius:5px; font-size:14px;">
    This tool is intended for internal use only. Please do not share it with anyone outside of EECD. It was created to help guide you in asking the right questions when operators request information about an educator’s eligibility for Step 4. Use it to support and streamline your workflow. Please note that this is only an estimator — final eligibility can only be determined after a complete application, along with all required documents, has been submitted and reviewed by EECD.
  </p>

  <div class="form-group">
    <label>What level is the educator requesting?</label><br>
    <select id="level" onchange="handleChange(0)">
      <option value="">-- Select --</option>
      <option value="entry">Entry Level – Step 4</option>
      <option value="level1">Level 1 – Step 4</option>
    </select>
  </div>

  <div id="group-q1" class="form-group" style="display:none;">
    <label>The educator works with:</label><br>
    <select id="ageGroup" onchange="handleChange(1)">
      <option value="">-- Select --</option>
      <option value="0-5">0–5</option>
      <option value="school-age">School Age Only</option>
    </select>
  </div>

  <div id="dynamic-questions"></div>

  <div id="result-section" style="display:none; margin-top:20px; padding:15px; border:2px solid #ccc; border-radius:5px;">
    <h3 id="result-title" style="color:#156b72;"></h3>
  </div>
</div>

<script>
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
  entry: ["Yes", "Yes", "Yes", "Yes", "No", "No"],
  level1: ["Yes", "Yes", "Yes", "Yes", "Yes", "No", "No"]
};

const schoolAgeQuestionsEntry = [
  "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?",
  "Is the educator at least 19 years old?"
];

const schoolAgeQuestionsLevel1 = [
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
    dynamicQuestionsDiv.innerHTML = "";
    resultSection.style.display = "none";

    if (answers.ageGroup === "school-age" && answers.level === "level1") {
      questionFlow = schoolAgeQuestionsLevel1;
    } else if (answers.ageGroup === "school-age" && answers.level === "entry") {
      questionFlow = schoolAgeQuestionsEntry;
    } else {
      questionFlow = answers.level === "entry" ? entryQuestions : level1Questions;
    }

    renderAllQuestions();
  }
}

function renderAllQuestions() {
  dynamicQuestionsDiv.innerHTML = "";
  questionFlow.forEach((question, index) => {
    const group = document.createElement("div");
    group.className = "form-group";
    group.id = `q-${index}`;

    const label = document.createElement("label");
    label.innerText = `${index + 1}. ${question}`;
    group.appendChild(label);

    if (question.includes("When was the educator's qualification issued")) {
      const input = document.createElement("input");
      input.type = "date";
      input.value = "";
      input.setAttribute("data-qindex", index);
      input.onchange = () => {
        const selectedDate = new Date(input.value);
        const today = new Date();
        const timeDiff = today - selectedDate;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const years = Math.floor(days / 365);
        const months = Math.floor((days % 365) / 30);
        const dayCount = days % 30;

        userResponses[index] = years >= 3 ? "Yes" : "No";
        resultSection.style.display = "none";

        const oldExplanation = group.querySelector(".explanation");
        if (oldExplanation) oldExplanation.remove();

        const explanation = document.createElement("p");
        explanation.className = "explanation";
        explanation.innerText = `Issued: ${years} years, ${months} months, ${dayCount} days ago.\n` +
          (years >= 3 ? "The qualification was issued more than 3 years ago." : "The qualification was issued less than 3 years ago.");
        group.appendChild(explanation);

        evaluateResult();
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
          const previouslySelected = userResponses[index];
          if (previouslySelected === option) return;

          const allButtons = group.querySelectorAll("button");
          allButtons.forEach(b => {
            b.style.backgroundColor = "#f8f8f8";
            b.style.color = "#000";
          });

          this.style.backgroundColor = "#156b72";
          this.style.color = "#fff";
          userResponses[index] = option;

          resultSection.style.display = "none";
          evaluateResult();
        };

        group.appendChild(btn);
      });
    }

    dynamicQuestionsDiv.appendChild(group);
  });
}

function evaluateResult() {
  const allAnswered = questionFlow.every((_, i) => userResponses[i] !== undefined);
  if (!allAnswered) return;

  let result = "Based on the information provided, the educator might not be eligible for Step 4. Please submit the application for review.";

  if (answers.ageGroup === "school-age" && answers.level === "level1") {
    const [q1, q2, q3] = [userResponses[0], userResponses[1], userResponses[2]];
    if (q1 === "Yes" && q2 === "Yes" && q3 === "Yes") {
      result = "Based on the information provided, the educator might be eligible for Step 4. Please submit the application for review.";
    } else if (q1 === "No" && q2 === "Yes" && q3 === "Yes") {
      result = "Please submit the application with all required documents for review by EECD.";
    }
  } else if (answers.ageGroup === "school-age" && answers.level === "entry") {
    const [q1, q2] = [userResponses[0], userResponses[1]];
    if (q1 === "Yes" && q2 === "Yes") {
      result = "Based on the information provided, the educator might be eligible for Step 4. Please submit the application for review.";
    } else if (q1 === "No" && q2 === "Yes") {
      result = "Please submit the application with all required documents for review by EECD.";
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
      userResponses[4] === "No" &&
      userResponses[5] === "No"
    ) {
      result = "Please submit the application with all required documents for review by EECD.";
    } else if (
      answers.level === "level1" &&
      userResponses[0] === "Yes" &&
      userResponses[1] === "Yes" &&
      userResponses[2] === "Yes" &&
      userResponses[3] === "Yes" &&
      userResponses[4] === "Yes" &&
      userResponses[5] === "No" &&
      userResponses[6] === "No"
    ) {
      result = "Based on the information provided, the educator might be eligible for Step 4. Please submit the application for review.";
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
      result = "Please submit the application with all required documents for review by EECD.";
    } else if (allMatch) {
      result = "Based on the information provided, the educator might be eligible for Step 4. Please submit the application for review.";
    }
  }

  resultTitle.innerText = result;
  resultSection.style.display = "block";
}
</script>
