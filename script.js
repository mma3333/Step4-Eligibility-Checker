const entryQuestions = [
  { text: "Has the educator been at Step 3 for at least 1 year?", expected: "Yes" },
  { text: "Has the educator completed the Intro to ECE (90 hours)?", expected: "Yes" },
  { text: "Has the educator accumulated at least 3 years of experience?", expected: "Yes" },
  { text: "Is the educator at least 19 years old?", expected: "Yes" },
  { text: "Is the Educator Conditionally Approved?", expected: "No" },
  { text: "Was the educator approved in error for their current step?", expected: "No" }
];

const level1Questions = [
  { text: "Has the educator been at Step 3 for at least 1 year?", expected: "No" },
  { text: "Does the educator hold recognized qualifications?", expected: "Yes" },
  { text: "Has the educator accumulated at least 3 years of experience?", expected: "Yes" },
  { text: "Is the educator at least 19 years old?", expected: "Yes" },
  { text: "Is the Educator Conditionally Approved?", expected: "No" },
  { text: "Was the educator approved in error for their current step?", expected: "No" },
  { text: "Were their qualifications issued at least 3 years ago?", expected: "Yes" }
];

const schoolAgeQuestions = [
  { text: "Has the educator been at Step 3 for at least 12 months, Step 2 for at least 2 years, or Step 1 for at least 3 years?", key: "stepTime" },
  { text: "Is the educator at least 19 years old?", key: "age" }
];

let currentIndex = 0;
let userAnswers = [];
let currentQuestions = [];
let flowMode = ""; // "schoolAge", "entry", or "level1"

function startQuiz() {
  const schoolAgeOnly = confirm("Is the Educator working with School Age Only?");
  const level = document.getElementById("level-select").value;

  if (!level && !schoolAgeOnly) {
    alert("Please select a level.");
    return;
  }

  userAnswers = [];
  currentIndex = 0;

  if (schoolAgeOnly) {
    flowMode = "schoolAge";
    currentQuestions = schoolAgeQuestions;
  } else {
    flowMode = level === "entry" ? "entry" : "level1";
    currentQuestions = level === "entry" ? entryQuestions : level1Questions;
  }

  document.getElementById("start-section").style.display = "none";
  document.getElementById("question-section").style.display = "block";

  showQuestion();
}

function showQuestion() {
  document.getElementById("question-text").innerText = currentQuestions[currentIndex].text;
}

function submitAnswer(answer) {
  userAnswers.push(answer);
  currentIndex++;

  if (currentIndex < currentQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("question-section").style.display = "none";
  document.getElementById("result-section").style.display = "block";

  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");

  let finalResult = "";
  let reviewHtml = "";

  if (flowMode === "schoolAge") {
    const stepTime = userAnswers[0];
    const age = userAnswers[1];

    if (stepTime === "Yes" && age === "Yes") {
      finalResult = "The Educator is Eligible";
    } else if (stepTime === "No" && age === "Yes") {
      finalResult = "Submit for Internal Review";
    } else {
      finalResult = "The Educator is Not Eligible";
    }

    reviewHtml = `
      <details><summary>${schoolAgeQuestions[0].text}</summary><p>Your answer: ${stepTime}</p></details>
      <details><summary>${schoolAgeQuestions[1].text}</summary><p>Your answer: ${age}</p></details>
    `;

  } else {
    const questionList = flowMode === "entry" ? entryQuestions : level1Questions;
    let allMatch = true;

    for (let i = 0; i < questionList.length; i++) {
      if (userAnswers[i] !== questionList[i].expected) {
        allMatch = false;
      }
      reviewHtml += `
        <details><summary>${questionList[i].text}</summary><p>Your answer: ${userAnswers[i]}</p></details>
      `;
    }

    finalResult = allMatch ? "The Educator is Eligible" : "The Educator is Not Eligible";
  }

  resultTitle.innerText = finalResult;
  resultMessage.innerHTML = reviewHtml;
}
