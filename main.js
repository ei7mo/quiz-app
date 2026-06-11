// DOM element references
const popup = document.querySelector(".popup");
const categoryButtons = document.querySelectorAll(".popup .popup-content button");
const categorySpan = document.querySelector(".category span");
const countSpan = document.querySelector(".count span");
const quizArea = document.querySelector(".quiz-area");
const options = document.querySelector(".options");
const submitBtn = document.querySelector(".submit-btn");
const spansDiv = document.querySelector(".bullets .spans");
const countdownDiv = document.querySelector(".bullets .countdown");
const result = document.querySelector(".result");
// Quiz state
let category;
let questionNumber = 0;
let countdownInterval;
let rightAnswers = 0;
// Open the quiz for the selected category and close the popup
categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        category = button.dataset.category;
        categorySpan.textContent = category;
        getQuestions(category);
        popup.remove();
    });
});
// Fetch questions from the corresponding JSON file based on the selected category
async function getQuestions(category) {
    const response = await fetch(`json/${category}_q.json`);
    const questions = await response.json();
    let questionsCount = questions.length;
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
function addQuestionData(question, totalQuestions) {
    if (questionNumber < totalQuestions) {
        let questionTitle = document.createElement("h2");
        let questionText = question["title"];
        questionTitle.textContent = questionText;
        options.before(questionTitle);
        for (let i = 1; i <= 4; i++) {
            let option = document.createElement("div");
            let optionText = question[`answer_${i}`];
            option.className =
                "option bg-[#f9f9f9] p-3.75 relative font-bold hover:bg-[#cbcbcb] hover:transition";
            option.textContent = optionText;
            options.appendChild(option);
            // Highlight the clicked option and deselect others
            option.addEventListener("click", () => {
                let allOptions = document.querySelectorAll(".option");
                allOptions.forEach((opt) => {
                    opt.classList.remove("text-[#0075ff]");
                });
                option.classList.add("text-[#0075ff]");
            });
        }
    }
}
// Create a bullet indicator for each question to track progress
function createBullets(count) {
    for (let i = 0; i < count; i++) {
        let bullet = document.createElement("span");
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
function countdown(duration, count) {
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
function checkAnswer(rightAnswer, count) {
    let answers = document.querySelectorAll(".option");
    let selectedAnswer = "";
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].classList.contains("selected")) {
            selectedAnswer = answers[i].textContent;
        }
    }
    if (selectedAnswer === rightAnswer) {
        rightAnswers++;
    }
}
// Move the active bullet to the current question index
function handleBullets() {
    let bullets = document.querySelectorAll(".bullets .spans span");
    for (let i = 0; i < bullets.length; i++) {
        if (i === questionNumber) {
            bullets[i].classList.remove("bg-[#dfdfdf]");
            bullets[i].classList.add("bg-[#0075ff]");
        }
    }
}
// Show the final score once all questions are answered
function showResults(count) {
    if (questionNumber === count) {
        // Remove quiz UI elements
        quizArea.remove();
        submitBtn.remove();
        spansDiv.remove();
        countdownDiv.remove();
        document.querySelector(".bullets")?.remove();
        // Display the result screen with the final score
        result.style.display = "block";
        document.querySelector(".result span").textContent =
            `${rightAnswers} out of ${count}`;
    }
}
export {};
