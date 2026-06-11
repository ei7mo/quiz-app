// DOM element references
const popup = document.querySelector(".popup") as HTMLDivElement;
const categoryButtons = document.querySelectorAll(
  ".popup .popup-content button",
) as NodeListOf<HTMLButtonElement>;
const categorySpan = document.querySelector(
  ".category span",
) as HTMLSpanElement;
const countSpan = document.querySelector(".count span") as HTMLSpanElement;
const quizArea = document.querySelector(".quiz-area") as HTMLDivElement;
const options = document.querySelector(".options") as HTMLDivElement;
const submitBtn = document.querySelector(".submit-btn") as HTMLButtonElement;
const spansDiv = document.querySelector(".bullets .spans") as HTMLDivElement;
const countdownDiv = document.querySelector(
  ".bullets .countdown",
) as HTMLDivElement;
const result = document.querySelector(".result") as HTMLDivElement;

// Quiz state
let category: string;
let questionNumber: number = 0;
let countdownInterval: number;
let rightAnswers: number = 0;

// Shape of each question object from the JSON file
interface Question {
  title: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
  right_answer: string;
}

// Open the quiz for the selected category and close the popup
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    category = button.dataset.category as string;
    categorySpan.textContent = category;
    getQuestions(category);
    popup.remove();
  });
});

// Fetch questions from the corresponding JSON file based on the selected category
async function getQuestions(category: string) {
  const response = await fetch(`json/${category}_q.json`);
  const questions: Question[] = await response.json();

  let questionsCount: number = questions.length;

  countSpan.textContent = questionsCount.toString();

  // Guard against out-of-bounds before rendering the first question
  if (questionNumber < questionsCount) {
    addQuestionData(questions[questionNumber], questionsCount);
  }

  createBullets(questions.length);
  countdown(11, questions.length);

  // Handle submit — check answer, load next question, restart countdown
  submitBtn.onclick = () => {
    let rightAnswer = questions[questionNumber].right_answer;

    questionNumber++;

    checkAnswer(rightAnswer, questions.length);

    // Clear current question UI before loading the next one
    document.querySelector(".quiz-area h2")?.remove();
    options.textContent = "";

    // Guard against out-of-bounds before rendering the next question
    if (questionNumber < questionsCount) {
      addQuestionData(questions[questionNumber], questionsCount);
    }

    handleBullets();

    clearInterval(countdownInterval);
    countdown(11, questionsCount);

    showResults(questionsCount);
  };
}

// Render the current question title and its four answer options
function addQuestionData(question: Question, totalQuestions: number): void {
  if (questionNumber < totalQuestions) {
    let questionTitle = document.createElement("h2") as HTMLHeadingElement;
    let questionText: string = question["title"];

    questionTitle.textContent = questionText;
    options.before(questionTitle);

    for (let i: number = 1; i <= 4; i++) {
      let option = document.createElement("div") as HTMLDivElement;
      let optionText = question[`answer_${i}` as keyof Question];

      option.className =
        "option bg-[#f9f9f9] p-3.75 relative font-bold hover:bg-[#cbcbcb] hover:transition";
      option.textContent = optionText;
      options.appendChild(option);

      // Highlight the clicked option and deselect others
      option.addEventListener("click", () => {
        let allOptions = document.querySelectorAll(
          ".option",
        ) as NodeListOf<HTMLDivElement>;

        allOptions.forEach((opt) => {
          opt.classList.remove("text-[#0075ff]");
        });

        option.classList.add("text-[#0075ff]");
      });
    }
  }
}

// Create a bullet indicator for each question to track progress
function createBullets(count: number): void {
  for (let i: number = 0; i < count; i++) {
    let bullet = document.createElement("span") as HTMLSpanElement;

    bullet.className = "rounded-[50%] w-6.25 h-6.25 bg-[#dfdfdf]";

    spansDiv.appendChild(bullet);

    // Mark the first bullet as active on start
    if (i === 0) {
      bullet.classList.remove("bg-[#dfdfdf]");
      bullet.classList.add("bg-[#0075ff]");
    }
  }
}

// Start a countdown timer — auto-submits when time runs out
function countdown(duration: number, count: number): void {
  if (questionNumber < count) {
    countdownInterval = setInterval(() => {
      countdownDiv.textContent = `${--duration}`;

      if (duration <= 0) {
        clearInterval(countdownInterval);
        submitBtn.click();
      }
    }, 1000);
  }
}

// Compare the selected answer against the correct one and update the score
function checkAnswer(rightAnswer: string, count: number): void {
  let answers = document.querySelectorAll(
    ".option",
  ) as NodeListOf<HTMLDivElement>;
  let selectedAnswer: string = "";

  for (let i: number = 0; i < answers.length; i++) {
    if (answers[i].classList.contains("selected")) {
      selectedAnswer = answers[i].textContent;
    }
  }

  if (selectedAnswer === rightAnswer) {
    rightAnswers++;
  }
}

// Move the active bullet to the current question index
function handleBullets(): void {
  let bullets = document.querySelectorAll(
    ".bullets .spans span",
  ) as NodeListOf<HTMLSpanElement>;

  for (let i: number = 0; i < bullets.length; i++) {
    if (i === questionNumber) {
      bullets[i].classList.remove("bg-[#dfdfdf]");
      bullets[i].classList.add("bg-[#0075ff]");
    }
  }
}

// Show the final score once all questions are answered
function showResults(count: number): void {
  if (questionNumber === count) {
    // Remove quiz UI elements
    quizArea.remove();
    submitBtn.remove();
    spansDiv.remove();
    countdownDiv.remove();
    document.querySelector(".bullets")?.remove();

    // Display the result screen with the final score
    result.style.display = "block";
    document.querySelector(".result span")!.textContent =
      `${rightAnswers} out of ${count}`;
  }
}
