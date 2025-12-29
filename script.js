let studentName = "";
let questions = [];
let current = 0;
let score = 0;

let timeLeft = 60;
let timerInterval;

const questionEl = document.getElementById("question");
const buttons = document.querySelectorAll("#testScreen button");
const titleEl = document.getElementById("testTitle");

/* ===== ТЕСТЫ ===== */

const anatomyTest = [
    { text: "Сколько камер в сердце человека?", answers: ["2", "3", "4"], correct: 2 },
    { text: "Основная единица нервной системы?", answers: ["Нейрон", "Синапс", "Аксон"], correct: 0 }
];

const chemistryTest = [
    { text: "Формула воды?", answers: ["H2O", "CO2", "O2"], correct: 0 },
    { text: "pH нейтральной среды?", answers: ["5", "7", "9"], correct: 1 }
];

const physicsTest = [
    { text: "Единица силы (СИ)?", answers: ["Джоуль", "Ньютон", "Ватт"], correct: 1 },
    { text: "Скорость света?", answers: ["3×10⁸ м/с", "3×10⁶ м/с", "3×10⁴ м/с"], correct: 0 }
];

/* ===== ВСПОМОГАТЕЛЬНЫЕ ===== */

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    if (current >= questions.length) {
        showResult();
        return;
    }
    questionEl.innerText = questions[current].text;
    buttons.forEach((btn, i) => btn.innerText = questions[current].answers[i]);
}

function checkAnswer(index) {
    if (index === questions[current].correct) score++;
    current++;
    loadQuestion();
}

function startTimer() {
    const timerEl = document.getElementById("timer");
    timerEl.innerText = `Осталось времени: ${timeLeft} сек`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = `Осталось времени: ${timeLeft} сек`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResult();
        }
    }, 1000);
}

/* ===== СТАРТ ===== */

function startTest() {
    const nameInput = document.getElementById("studentName");
    const subject = document.getElementById("subject").value;

    if (nameInput.value.trim() === "" || subject === "") {
        alert("Введите имя и выберите предмет");
        return;
    }

    studentName = nameInput.value.trim();

    if (subject === "anatomy") {
        questions = [...anatomyTest];
        titleEl.innerText = "Анатомия";
    } else if (subject === "chemistry") {
        questions = [...chemistryTest];
        titleEl.innerText = "Химия";
    } else {
        questions = [...physicsTest];
        titleEl.innerText = "Физика";
    }

    shuffle(questions);
    current = 0;
    score = 0;
    timeLeft = 60;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("journalScreen").style.display = "none";
    document.getElementById("testScreen").style.display = "block";

    loadQuestion();
    startTimer();
}

/* ===== СОХРАНЕНИЕ ===== */

function saveResult(percent, grade) {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    results.push({
        name: studentName,
        subject: titleEl.innerText,
        score: score,
        total: questions.length,
        percent: percent,
        grade: grade,
        date: new Date().toLocaleString()
    });
    localStorage.setItem("results", JSON.stringify(results));
}

/* ===== РЕЗУЛЬТАТ ===== */

function showResult() {
    clearInterval(timerInterval);

    const percent = Math.round((score / questions.length) * 100);
    let grade = percent >= 90 ? "5" : percent >= 75 ? "4" : percent >= 50 ? "3" : "2";

    saveResult(percent, grade);

    questionEl.innerHTML = `
        Тест завершён<br><br>
        Ученик: <b>${studentName}</b><br>
        Предмет: ${titleEl.innerText}<br>
        Процент: ${percent}%<br>
        Оценка: <b>${grade}</b>
    `;

    buttons.forEach(btn => btn.style.display = "none");
}

/* ===== ЖУРНАЛ ===== */

function showJournal() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("testScreen").style.display = "none";
    document.getElementById("journalScreen").style.display = "block";

    const container = document.getElementById("journalTable");
    const results = JSON.parse(localStorage.getItem("results")) || [];

    if (results.length === 0) {
        container.innerHTML = "<p>Результатов пока нет.</p>";
        return;
    }

    let html = `
        <table border="1" cellpadding="5">
        <tr>
            <th>Имя</th>
            <th>Предмет</th>
            <th>Результат</th>
            <th>%</th>
            <th>Оценка</th>
            <th>Дата</th>
        </tr>
    `;

    results.forEach(r => {
        html += `
            <tr>
                <td>${r.name}</td>
                <td>${r.subject}</td>
                <td>${r.score}/${r.total}</td>
                <td>${r.percent}</td>
                <td>${r.grade}</td>
                <td>${r.date}</td>
            </tr>
        `;
    });

    html += "</table>";
    container.innerHTML = html;
}

/* ===== ЭКСПОРТ CSV ===== */

function exportCSV() {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    if (results.length === 0) {
        alert("Нет данных для экспорта");
        return;
    }

    let csv = "Имя;Предмет;Результат;Процент;Оценка;Дата\n";

    results.forEach(r => {
        csv += `${r.name};${r.subject};${r.score}/${r.total};${r.percent};${r.grade};${r.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();

    URL.revokeObjectURL(url);
}

function backToStart() {
    document.getElementById("journalScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";
}
