// ===============================
// SECTION NAVIGATION
// ===============================

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll(".page-section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    // Update sidebar buttons
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");

        if (item.dataset.section === sectionId) {
            item.classList.add("active");
        }
    });

    // Update page title
    const pageTitle = document.getElementById("page-title");

    const titles = {
        dashboard: "Good morning! 👋",
        conversation: "Let's practice speaking 🎙️",
        pronunciation: "Perfect your pronunciation 🎯",
        vocabulary: "Build your vocabulary 📚",
        lesson: "Your daily lesson 🧠",
        history: "Your learning progress 📊"
    };

    if (pageTitle && titles[sectionId]) {
        pageTitle.textContent = titles[sectionId];
    }
}


// ===============================
// SIDEBAR NAVIGATION
// ===============================

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", function () {
        const section = this.dataset.section;

        showSection(section);
    });
});


// ===============================
// AI CHAT
// ===============================

async function sendMessage() {

    const input = document.getElementById("messageInput");
    const chatBox = document.getElementById("chatMessages");
    const sendButton = document.getElementById("sendButton");

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Show user's message
    const userMessage = document.createElement("div");

    userMessage.className = "message user-message";

    userMessage.innerHTML = `
        <div class="message-avatar">👤</div>

        <div class="bubble">
            <span class="message-label">YOU</span>

            <p>${message}</p>
        </div>
    `;

    chatBox.appendChild(userMessage);

    // Clear input
    input.value = "";

    // Disable button
    sendButton.disabled = true;
    sendButton.innerText = "Thinking...";

    // Loading message
    const loadingMessage = document.createElement("div");

    loadingMessage.className = "message ai-message";

    loadingMessage.innerHTML = `
        <div class="message-avatar">🤖</div>

        <div class="bubble">
            <span class="message-label">AI TUTOR</span>

            <p>Thinking...</p>
        </div>
    `;

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;


    try {

        const response = await fetch(
            "/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            }
        );


        if (!response.ok) {
            throw new Error(
                "Server error: " + response.status
            );
        }


        const data = await response.json();


        // Remove loading message
        loadingMessage.remove();


        // AI response
        const botMessage = document.createElement("div");

        botMessage.className = "message ai-message";

        botMessage.innerHTML = `
            <div class="message-avatar">🤖</div>

            <div class="bubble">
                <span class="message-label">AI TUTOR</span>

                <p>${data.reply}</p>
            </div>
        `;

        chatBox.appendChild(botMessage);

        chatBox.scrollTop = chatBox.scrollHeight;
        // ===============================
        // AI TEXT-TO-SPEECH
        // ===============================

        if ("speechSynthesis" in window) {

            const speech = new SpeechSynthesisUtterance(data.reply);

            speech.lang = "en-US";
            speech.rate = 0.9;
            speech.pitch = 1;

            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(speech);
        }


    } catch (error) {

        console.error("Error:", error);

        loadingMessage.querySelector("p").innerText =
            "Sorry, I couldn't connect to the AI tutor. Please make sure the backend is running.";
    }


    // Enable button again
    sendButton.disabled = false;

    sendButton.innerText = "Send";
}


// ===============================
// SEND BUTTON
// ===============================

document
    .getElementById("sendButton")
    .addEventListener(
        "click",
        sendMessage
    );


// ===============================
// ENTER KEY
// ===============================

document
    .getElementById("messageInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                sendMessage();
            }

        }
    );
    // ===============================
// VOICE RECOGNITION
// ===============================

const micButton = document.getElementById("micButton");
const listeningStatus = document.getElementById("listeningStatus");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";


    // Microphone button clicked
    micButton.addEventListener("click", function () {

        try {

            recognition.start();

            micButton.classList.add("recording");

            listeningStatus.innerText =
                "Listening... Speak now 🎙️";

        } catch (error) {

            console.log("Microphone is already active.");

        }

    });


    // Speech recognized
    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        console.log("You said:", transcript);

        // Put spoken text into message box
        document.getElementById("messageInput").value =
            transcript;

        listeningStatus.innerText =
            "Speech recognized: " + transcript;

        micButton.classList.remove("recording");

        // Automatically send to AI
        sendMessage();
    };


    // Recognition ended
    recognition.onend = function () {

        micButton.classList.remove("recording");

        if (
            listeningStatus.innerText ===
            "Listening... Speak now 🎙️"
        ) {
            listeningStatus.innerText =
                "Click the microphone and start speaking";
        }

    };


    // Recognition error
    recognition.onerror = function (event) {

        console.error(
            "Speech recognition error:",
            event.error
        );

        micButton.classList.remove("recording");

        listeningStatus.innerText =
            "Could not hear you. Please try again.";
    };


} else {

    // Browser does not support speech recognition

    micButton.disabled = true;

    listeningStatus.innerText =
        "Speech recognition is not supported in this browser.";
}
// ===============================
// PRONUNCIATION SCORING
// ===============================

const pronunciationMic =
    document.getElementById("pronunciationMic");

const pronunciationStatus =
    document.getElementById("pronunciationStatus");

const targetPhrase =
    document.getElementById("targetPhrase");

const spokenResult =
    document.getElementById("spokenResult");
const pronunciationScoreBox =
    document.getElementById("pronunciationScoreBox");

const pronunciationScore =
    document.getElementById("pronunciationScore");
let pronunciationRecognition = null;
function calculatePronunciationScore(target, spoken) {

    const targetWords = target
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    const spokenWords = spoken
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    let correctCount = 0;

    targetWords.forEach(function (word, index) {

        if (spokenWords[index] === word) {
            correctCount++;
        }

    });

    const score = targetWords.length
        ? Math.round(
            (correctCount / targetWords.length) * 100
        )
        : 0;

    pronunciationScore.innerText = score + "%";

    pronunciationScoreBox.style.display = "block";

    return score;
}

// ===============================
// PRONUNCIATION MICROPHONE
// ===============================

if (SpeechRecognition && pronunciationMic) {

    pronunciationRecognition =
        new SpeechRecognition();

    pronunciationRecognition.continuous = false;

    pronunciationRecognition.interimResults = true;

    pronunciationRecognition.lang = "en-US";


    // ===============================
    // MICROPHONE CLICK
    // ===============================

    pronunciationMic.addEventListener(
        "click",
        function () {

            try {

                pronunciationRecognition.start();

                pronunciationMic.classList.add(
                    "recording"
                );

                pronunciationStatus.innerText =
                    "Listening... Speak the phrase now 🎙️";


                // Safety timeout
                setTimeout(function () {

                    try {

                        pronunciationRecognition.stop();

                    } catch (error) {

                        console.log(
                            "Recognition already stopped."
                        );

                    }

                }, 8000);


            } catch (error) {

                console.log(
                    "Pronunciation microphone is already active."
                );

            }

        }
    );


    // ===============================
    // SPEECH RECOGNIZED
    // ===============================

    pronunciationRecognition.onresult =
        function (event) {

            let spokenText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                spokenText +=
                    event.results[i][0].transcript;

            }


            console.log(
                "Pronunciation:",
                spokenText
            );


            // Only calculate when speech is final
            if (
                event.results[
                    event.results.length - 1
                ].isFinal
            ) {

                // STOP LISTENING IMMEDIATELY
                try {

                    pronunciationRecognition.stop();

                } catch (error) {

                    console.log(
                        "Recognition already stopped."
                    );

                }


                spokenResult.innerText =
                    spokenText;


                pronunciationStatus.innerText =
                    "Speech recognized. Checking pronunciation...";
const score = calculatePronunciationScore(
    targetPhrase.innerText.trim(),
    spokenText.trim()
);
saveLearningActivity(
    "Pronunciation Practice",
    score
);
pronunciationStatus.innerText =
    "Pronunciation score: " + score + "%";

                pronunciationMic.classList.remove(
                    "recording"
                );
            }
        };
    // ===============================
    // RECOGNITION ENDED
    // ===============================

    pronunciationRecognition.onend =
        function () {

            pronunciationMic.classList.remove(
                "recording"
            );

        };


    // ===============================
    // RECOGNITION ERROR
    // ===============================

    pronunciationRecognition.onerror =
        function (event) {

            console.error(
                "Pronunciation error:",
                event.error
            );

            pronunciationMic.classList.remove(
                "recording"
            );

            pronunciationStatus.innerText =
                "Could not hear you. Please try again.";

        };

}

// ===============================
// HEAR TARGET PHRASE
// ===============================

const speakTargetButton =
    document.getElementById(
        "speakTargetButton"
    );


if (speakTargetButton) {

    speakTargetButton.addEventListener(
        "click",
        function(){

const phrase =
    document.getElementById("targetPhrase").innerText.trim();


            if (!phrase) {

                return;

            }


            window.speechSynthesis.cancel();


            const speech =
                new SpeechSynthesisUtterance(
                    phrase
                );


            speech.lang = "en-US";

            speech.rate = 0.85;

            speech.pitch = 1;


            window.speechSynthesis.speak(
                speech
            );

        }
    );

}
// ===============================
// VOCABULARY
// ===============================

const vocabularyInput =
    document.getElementById("vocabularyInput");

const vocabularyButton =
    document.getElementById("vocabularyButton");

const vocabularyResult =
    document.getElementById("vocabularyResult");

const vocabWord =
    document.getElementById("vocabWord");

const vocabMeaning =
    document.getElementById("vocabMeaning");

const vocabExample =
    document.getElementById("vocabExample");

const vocabTip =
    document.getElementById("vocabTip");


if (vocabularyButton) {

    vocabularyButton.addEventListener(
        "click",
        async function () {

            const word =
                vocabularyInput.value.trim();

            if (!word) {
                alert("Please enter a word first.");
                return;
            }

            vocabularyButton.disabled = true;

            vocabularyButton.innerText =
                "Thinking...";

            vocabularyResult.classList.remove("hidden");

            vocabWord.innerText =
                word;

            vocabMeaning.innerText =
                "AI is generating an explanation...";

            vocabExample.innerText =
                "";

            vocabTip.innerText =
                "";

            try {

                const response =
                    await fetch(
    "/chat",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                message:
                                    `Explain the English word "${word}" for a beginner.

Return exactly in this format:

MEANING: [simple meaning]
EXAMPLE: [one simple example sentence]
TIP: [one short memory tip]`
                            })
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Server error: " +
                        response.status
                    );
                }


                const data =
                    await response.json();


                const reply =
                    data.reply;


                const meaningMatch =
                    reply.match(
                        /MEANING:\s*(.*?)(?=EXAMPLE:|$)/is
                    );

                const exampleMatch =
                    reply.match(
                        /EXAMPLE:\s*(.*?)(?=TIP:|$)/is
                    );

                const tipMatch =
                    reply.match(
                        /TIP:\s*(.*)/is
                    );


                vocabMeaning.innerText =
                    meaningMatch
                        ? meaningMatch[1].trim()
                        : reply;


                vocabExample.innerText =
                    exampleMatch
                        ? exampleMatch[1].trim()
                        : "No example available.";


                vocabTip.innerText =
                    tipMatch
                        ? tipMatch[1].trim()
                        : "Try using this word in your own sentence.";


            } catch (error) {

                console.error(
                    "Vocabulary error:",
                    error
                );

                vocabMeaning.innerText =
                    "Could not connect to the AI tutor.";

                vocabExample.innerText =
                    "Make sure your FastAPI backend is running.";

                vocabTip.innerText =
                    "Try again after starting the backend.";

            }


            vocabularyButton.disabled = false;

            vocabularyButton.innerText =
                "Explain with AI";

        }
    );

}
// ===============================
// DAILY LESSON
// ===============================

const generateLessonButton =
    document.getElementById("generateLessonButton");

const lessonLoading =
    document.getElementById("lessonLoading");

const lessonContent =
    document.getElementById("lessonContent");

const lessonTitle =
    document.getElementById("lessonTitle");

const lessonDescription =
    document.getElementById("lessonDescription");

const lessonVocabulary =
    document.getElementById("lessonVocabulary");

const grammarTopic =
    document.getElementById("grammarTopic");

const grammarExplanation =
    document.getElementById("grammarExplanation");

const grammarExample =
    document.getElementById("grammarExample");

const speakingPrompt =
    document.getElementById("speakingPrompt");


if (generateLessonButton) {

    generateLessonButton.addEventListener(
        "click",
        async function () {

            generateLessonButton.disabled = true;

            generateLessonButton.innerText =
                "Generating...";

            if (lessonLoading) {
                lessonLoading.classList.remove("hidden");
            }

            if (lessonContent) {
                lessonContent.classList.add("hidden");
            }

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/chat",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                message:
                                    `Create a beginner-friendly English language lesson.

Return exactly in this format:

TITLE: [lesson title]

DESCRIPTION: [short lesson description]

VOCABULARY: [3 useful vocabulary words with simple meanings]

GRAMMAR TOPIC: [grammar topic]

GRAMMAR EXPLANATION: [simple explanation]

GRAMMAR EXAMPLE: [one or two simple examples]

SPEAKING PROMPT: [one question or speaking task for the learner]`
                            })
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Server error: " +
                        response.status
                    );
                }


                const data =
                    await response.json();

                const reply =
                    data.reply;


                const titleMatch =
                    reply.match(
                        /TITLE:\s*(.*?)(?=DESCRIPTION:|$)/is
                    );

                const descriptionMatch =
                    reply.match(
                        /DESCRIPTION:\s*(.*?)(?=VOCABULARY:|$)/is
                    );

                const vocabularyMatch =
                    reply.match(
                        /VOCABULARY:\s*(.*?)(?=GRAMMAR TOPIC:|$)/is
                    );

                const grammarTopicMatch =
                    reply.match(
                        /GRAMMAR TOPIC:\s*(.*?)(?=GRAMMAR EXPLANATION:|$)/is
                    );

                const grammarExplanationMatch =
                    reply.match(
                        /GRAMMAR EXPLANATION:\s*(.*?)(?=GRAMMAR EXAMPLE:|$)/is
                    );

                const grammarExampleMatch =
                    reply.match(
                        /GRAMMAR EXAMPLE:\s*(.*?)(?=SPEAKING PROMPT:|$)/is
                    );

                const speakingPromptMatch =
                    reply.match(
                        /SPEAKING PROMPT:\s*(.*)/is
                    );


                if (lessonTitle) {
                    lessonTitle.innerText =
                        titleMatch
                            ? titleMatch[1].trim()
                            : "Daily English Lesson";
                }


                if (lessonDescription) {
                    lessonDescription.innerText =
                        descriptionMatch
                            ? descriptionMatch[1].trim()
                            : "";
                }


                if (lessonVocabulary) {
                    lessonVocabulary.innerText =
                        vocabularyMatch
                            ? vocabularyMatch[1].trim()
                            : "";
                }


                if (grammarTopic) {
                    grammarTopic.innerText =
                        grammarTopicMatch
                            ? grammarTopicMatch[1].trim()
                            : "";
                }


                if (grammarExplanation) {
                    grammarExplanation.innerText =
                        grammarExplanationMatch
                            ? grammarExplanationMatch[1].trim()
                            : "";
                }


                if (grammarExample) {
                    grammarExample.innerText =
                        grammarExampleMatch
                            ? grammarExampleMatch[1].trim()
                            : "";
                }


                if (speakingPrompt) {
                    speakingPrompt.innerText =
                        speakingPromptMatch
                            ? speakingPromptMatch[1].trim()
                            : "";
                }


                if (lessonLoading) {
                    lessonLoading.classList.add("hidden");
                }

                if (lessonContent) {
                    lessonContent.classList.remove("hidden");
                }
saveLearningActivity(
    lessonTitle
        ? lessonTitle.innerText
        : "Daily English Lesson",
    0
);

            } catch (error) {

                console.error(
                    "Daily lesson error:",
                    error
                );

                if (lessonLoading) {
                    lessonLoading.classList.add("hidden");
                }

                if (lessonContent) {
                    lessonContent.classList.remove("hidden");
                }
saveLearningActivity(
    lessonTitle
        ? lessonTitle.innerText
        : "Daily English Lesson",
    0
);
                if (lessonTitle) {
                    lessonTitle.innerText =
                        "Could not generate lesson";
                }

                if (lessonDescription) {
                    lessonDescription.innerText =
                        "Please make sure your AI backend is running.";
                }

            }


            generateLessonButton.disabled = false;

            generateLessonButton.innerText =
                "Generate Lesson";

        }
    );

}
// ===============================
// PROGRESS HISTORY
// ===============================

const historyList =
    document.getElementById("historyList");

const historyLessons =
    document.getElementById("historyLessons");

const historyScore =
    document.getElementById("historyScore");

const historyStreak =
    document.getElementById("historyStreak");


// Load saved history
let learningHistory =
    JSON.parse(
        localStorage.getItem("learningHistory")
    ) || [];


// Display history
function displayHistory() {

    if (!historyList) {
        return;
    }

    historyList.innerHTML = "";


    if (learningHistory.length === 0) {

        historyList.innerHTML =
            "<p>No learning activity yet. Start practicing!</p>";

    } else {

        learningHistory
            .slice()
            .reverse()
            .forEach(function (item) {

                const historyItem =
                    document.createElement("div");

                historyItem.className =
                    "history-item";

                historyItem.innerHTML = `
                    <strong>${item.title}</strong>
                    <p>${item.date}</p>
                `;

                historyList.appendChild(
                    historyItem
                );

            });
    }


    if (historyLessons) {

        historyLessons.innerText =
            learningHistory.length;

    }


    if (historyScore) {

        if (learningHistory.length > 0) {

            const totalScore =
                learningHistory.reduce(
                    function (total, item) {
                        return total + (item.score || 0);
                    },
                    0
                );

            const average =
                Math.round(
                    totalScore /
                    learningHistory.length
                );

            historyScore.innerText =
                average + "%";

        } else {

            historyScore.innerText =
                "0%";

        }
    }


    if (historyStreak) {

        historyStreak.innerText =
            learningHistory.length > 0
                ? "Active"
                : "0";

    }
}


// Save a learning activity
function saveLearningActivity(
    title,
    score = 0
) {

    const activity = {

        title: title,

        score: score,

        date: new Date().toISOString()

    };


    learningHistory.push(
        activity
    );


    localStorage.setItem(
        "learningHistory",
        JSON.stringify(
            learningHistory
        )
    );


    displayHistory();
}


// Display history when app starts
displayHistory();
// ===============================
// DASHBOARD STATISTICS
// ===============================

const dashboardStreak =
    document.getElementById("streak");

const dashboardAverageScore =
    document.getElementById("averageScore");

const dashboardWordCount =
    document.getElementById("wordCount");

const dashboardLessonCount =
    document.getElementById("lessonCount");

const dashboardProgressNumber =
    document.getElementById("progressNumber");
function calculateLearningStreak() {

    if (learningHistory.length === 0) {
        return 0;
    }

    const dates = learningHistory
    .map(function (item) {
        return new Date(
            item.date
        );
    })
        .filter(function (date) {
            return !isNaN(date);
        })
        .map(function (date) {
            return new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );
        });

    const uniqueDates = [...new Set(
        dates.map(function (date) {
            return date.getTime();
        })
    )]
    .map(function (time) {
        return new Date(time);
    })
    .sort(function (a, b) {
        return b - a;
    });

    if (uniqueDates.length === 0) {
        return 0;
    }

    let streak = 1;

    for (
        let i = 0;
        i < uniqueDates.length - 1;
        i++
    ) {

        const difference =
            (
                uniqueDates[i] -
                uniqueDates[i + 1]
            ) /
            (1000 * 60 * 60 * 24);

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function updateDashboardStats() {

    // Number of activities
    const totalActivities =
        learningHistory.length;


    // Average score
    let averageScore = 0;

    if (totalActivities > 0) {

        const totalScore =
            learningHistory.reduce(
                function (total, item) {
                    return total + (item.score || 0);
                },
                0
            );

        averageScore =
            Math.round(
                totalScore / totalActivities
            );
    }


    // Lessons completed
    const lessonsCompleted =
        learningHistory.filter(
            function (item) {
                return item.title
                    .toLowerCase()
                    .includes("lesson");
            }
        ).length;


    // Words learned
    const wordsLearned =
        learningHistory.filter(
            function (item) {
                return item.title
                    .toLowerCase()
                    .includes("vocabulary");
            }
        ).length;


    // Update Dashboard
    if (dashboardStreak) {
    dashboardStreak.innerText =
        calculateLearningStreak();
}

    if (dashboardAverageScore) {
        dashboardAverageScore.innerText =
            averageScore + "%";
    }

    if (dashboardWordCount) {
        dashboardWordCount.innerText =
            wordsLearned;
    }

    if (dashboardLessonCount) {
        dashboardLessonCount.innerText =
            lessonsCompleted;
    }

    if (dashboardProgressNumber) {
        dashboardProgressNumber.innerText =
            Math.min(totalActivities * 10, 100) + "%";
    }
}


// Update dashboard when app starts
updateDashboardStats();