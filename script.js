const entryQuestions = [
  { text: "Has the educator been at Step 3 for at least 1 year?", expected: "Yes" },
  { text: "Has the educator completed the Intro to ECE (90 hours)?", expected: "Yes" },
  { text: "Has the educator accumulated at least 3 years of experience?", expected: "Yes" },
  { text: "Is the educator at least 19 years old?", expected: "Yes" },
  { text: "NOT conditionally approved?", expected: "Yes" },
  { text: "NOT approved in error for their current step?", expected: "Yes" },
];

const level1Questions = [
  { text: "Has the educator been at Step 3 for at least 1 year?", expected: "No" },
  { text: "Does the educator hold recognized qualifications?", expected: "Yes" },
  { text: "Has the educator accumulated at least 3 years of experience?", expected: "Yes" },
  { text: "Is the educator at least 19 years old?", expected: "Yes" },
  { text: "NOT conditionally approved?", expected: "Yes" },
  { text: "NOT approved in error for their current step?", expected: "Yes" },
  { text: "Were their qualifications issued at least 3 years ago?", expected: "Yes" },
];

let currentLevel = "";
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];

function startQuiz() {
  const level = document.getElementById("level-select").value;
  if (!level) {
    alert("Please select a level.");
    return;
  }

  currentLevel = level;
  currentQuestions = level === "entry" ? entryQuestions : level1Questions;
  currentIndex = 0;
  userAnswers = [];

  document.getElementById("start-section").style.display = "none";
  document.getElementById("question-section").style.display = "block";

  showQuestion();
}

function showQuestion() {
  const question = currentQuestions[currentIndex];
  document.getElementById("question-text").innerText = question.text;
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

  let allMatch = true;
  for (let i = 0; i < currentQuestions.length; i++) {
    if (userAnswers[i] !== currentQuestions[i].expected) {
      allMatch = false;
      break;
    }
  }

  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");

  if (allMatch) {
    resultTitle.innerText = "✅ You are eligible for Step 4";
    resultMessage.innerText = "Based on your answers, you meet all the requirements.";
  } else {
    resultTitle.innerText = "❌ You may not be eligible";
    resultMessage.innerText = "Based on your answers, it seems you do not meet all the requirements. Please verify your information or consult the WSP-ECE team.";
  }
}
