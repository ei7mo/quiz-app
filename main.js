let categorySpan = document.querySelector(".category span");
let countSpan = document.querySelector(".count span");
let quizArea = document.querySelector(".quiz-area");
let options = document.querySelector(".options");
let submitBtn = document.querySelector(".submit-btn");
let spansDiv = document.querySelector(".bullets .spans");
let countdownDiv = document.querySelector(".bullets .countdown");
let result = document.querySelector(".result");

let questionNumber = 0;
let countdownInterval;
let rightAnswers = 0;

function getQuestions() {
  let myRequest = new XMLHttpRequest();

  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let questions = JSON.parse(this.responseText);
      let qCount = questions.length;

      categorySpan.innerHTML = "HTML";
      countSpan.innerHTML = qCount;

      addQuestionData(questions[questionNumber], qCount);

      createBullets(qCount);

      countdown(11, qCount);

      submitBtn.onclick = () => {
        let rightAnswer = questions[questionNumber].right_answer;

        questionNumber++;

        checkAnswer(rightAnswer, qCount);

        document.querySelector(".quiz-area h2")?.remove();
        options.innerHTML = "";

        addQuestionData(questions[questionNumber], qCount);

        handleBullets();

        clearInterval(countdownInterval);
        countdown(11, qCount);

        showResults(qCount);
      };
    }
  };
  myRequest.open("GET", "questions.json", true);
  myRequest.send();
}

getQuestions();

function addQuestionData(obj, count) {
  if (questionNumber < count) {
    let questionTitle = document.createElement("h2");
    let questionText = obj["title"];

    questionTitle.innerHTML = questionText;
    options.before(questionTitle);

    for (let i = 1; i <= 4; i++) {
      let option = document.createElement("div");
      let optionText = obj[`answer_${i}`];

      option.className = "option";
      option.innerHTML = optionText;
      options.appendChild(option);

      option.addEventListener("click", function () {
        let allOpt = document.querySelectorAll(".option");

        allOpt.forEach((opt) => {
          opt.classList.remove("selected");
        });

        option.classList.add("selected");
      });
    }
  }
}

function createBullets(count) {
  for (let i = 0; i < count; i++) {
    let bullet = document.createElement("span");

    spansDiv.appendChild(bullet);

    if (i === 0) {
      bullet.className = "active";
    }
  }
}

function countdown(duration, count) {
  if (questionNumber < count) {
    countdownInterval = setInterval(() => {
      countdownDiv.innerHTML = `${--duration}`;

      if (duration <= 0) {
        clearInterval(countdownInterval);
        submitBtn.click();
      }
    }, 1000);
  }
}

function checkAnswer(rAnswer, count) {
  let answers = document.querySelectorAll(".option");
  let selectedAnswer;

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].classList.contains("selected")) {
      selectedAnswer = answers[i].innerHTML;
    }
  }
  if (selectedAnswer === rAnswer) {
    rightAnswers++;
  }
}

function handleBullets() {
  let bullets = document.querySelectorAll(".bullets .spans span");

  for (let i = 0; i < bullets.length; i++) {
    if (i === questionNumber) {
      bullets[i].className = "active";
    }
  }
}

function showResults(count) {
  if (questionNumber === count) {
    quizArea.remove();
    submitBtn.remove();
    spansDiv.remove();
    countdownDiv.remove();
    document.querySelector(".bullets").remove();

    result.style.display = "block";
    document.querySelector(".result span").innerHTML =
      `${rightAnswers} out of ${count}`;
  }
}
