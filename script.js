let studentName = "";
let questions = [];
let current = 0;
let score = 0;

let timeLeft = 120;
let timerInterval;

let currentInfo = "";

const questionEl = document.getElementById("question");
const buttons = document.querySelectorAll("#testScreen button");
const titleEl = document.getElementById("testTitle");

/* ===== ДАННЫЕ ===== */

function makeQuestions(prefix) {
    return Array.from({ length: 10 }, (_, i) => ({
        text: `${prefix} — вопрос ${i + 1}`,
        answers: ["A", "B", "C"],
        correct: 0
    }));
}

const tests = {
    anatomy: {
        heart: makeQuestions("Анатомия / Сердце"),
        nervous: makeQuestions("Анатомия / Нервная система"),
        respiration: makeQuestions("Анатомия / Дыхательная система")
    },
    chemistry: {
        general: makeQuestions("Химия / Общая"),
        organic: makeQuestions("Химия / Органическая"),
        inorganic: makeQuestions("Химия / Неорганическая")
    }
};

/* ===== ВЫБОР ===== */

function updateSelectors() {
    const mode = document.getElementById("mode").value;

    document.getElementById("subjectBlock").style.display =
        mode === "SUBJECT" || mode === "SECTION" ? "block" : "none";

    document.getElementById("sectionBlock").style.display =
        mode === "SECTION" ? "block" : "none";
}

function updateSections() {
    const subject = document.getElementById("subject").value;
    const section = document.getElementById("section");

    section.innerHTML = `<option value="">-- выбрать --</option>`;
    if (!subject) return;

    for (let s in tests[subject]) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        section.appendChild(opt);
    }
}

/* ===== СТАРТ ===== */

function startTest() {
    const name = document.getElementById("studentName").value.trim();
    const mode = document.getElementById("mode").value;
    const subject = document.getElementById("subject").value;
    const section = document.getElementById("section").value;

    if (!name || !mode) {
        alert("Заполните все поля");
        return;
    }

    studentName = name;
    questions = [];

    if (mode === "ALL") {
        for (let subj in tests)
            for (let sec in tests[subj])
                questions = questions.concat(tests[subj][sec]);
        currentInfo = "Общий экзамен (все предметы)";
    }

    if (mode === "SUBJECT") {
        if (!subject) return alert("Выберите предмет");
        for (let sec in tests[subject])
            questions = questions.concat(tests[subject][sec]);
        currentInfo = `Экзамен по предмету: ${subject}`;
    }

    if (mode === "SECTION") {
        if (!subject || !section) return alert("Выберите раздел");
        questions = [...tests[subject][section]];
        currentInfo = `Экзамен: ${subject} / ${section}`;
    }

    current = 0;
    score = 0;
    timeLeft = 120;

    titleEl.innerText = currentInfo;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("testScreen").style.display = "block";

    loadQuestion();
    startTimer();
}

function loadQuestion() {
    if (current >= questions.length) {
        showResult();
        return;
    }
    questionEl.innerText = questions[current].text;
    buttons.forEach((b, i) => b.innerText = questions[current].answers[i]);
}

function checkAnswer(i) {
    if (i === questions[current].correct) score++;
    current++;
    loadQuestion();
}

/* ===== ТАЙМЕР ===== */

function startTimer() {
    const t = document.getElementById("timer");
    t.innerText = `Время: ${timeLeft} сек`;

    timerInterval = setInterval(() => {
        timeLeft--;
        t.innerText = `Время: ${timeLeft} сек`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResult();
        }
    }, 1000);
}

/* ===== РЕЗУЛЬТАТ + ЖУРНАЛ ===== */

function showResult() {
    clearInterval(timerInterval);

    const percent = Math.round((score / questions.length) * 100);
    let grade = percent >= 90 ? 5 : percent >= 75 ? 4 : percent >= 50 ? 3 : 2;

    saveResult(percent, grade);

    questionEl.innerHTML = `
        Ученик: <b>${studentName}</b><br>
        ${currentInfo}<br>
        Баллы: ${score}/${questions.length}<br>
        Процент: ${percent}%<br>
        Оценка: <b>${grade}</b>
    `;
    buttons.forEach(b => b.style.display = "none");
}

function saveResult(percent, grade) {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    results.push({
        name: studentName,
        exam: currentInfo,
        score,
        total: questions.length,
        percent,
        grade,
        date: new Date().toLocaleString()
    });
    localStorage.setItem("results", JSON.stringify(results));
}

function showJournal() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("testScreen").style.display = "none";
    document.getElementById("journalScreen").style.display = "block";

    const data = JSON.parse(localStorage.getItem("results")) || [];
    let html = `<table border="1">
        <tr><th>Имя</th><th>Экзамен</th><th>Баллы</th><th>%</th><th>Оценка</th><th>Дата</th></tr>`;

    data.forEach(r => {
        html += `<tr>
            <td>${r.name}</td>
            <td>${r.exam}</td>
            <td>${r.score}/${r.total}</td>
            <td>${r.percent}</td>
            <td>${r.grade}</td>
            <td>${r.date}</td>
        </tr>`;
    });

    html += `</table>`;
    document.getElementById("journalTable").innerHTML = html;
}

function backToStart() {
    document.getElementById("journalScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";
}
