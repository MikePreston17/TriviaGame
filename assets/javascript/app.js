//TODOs

//1.  Render the initial game layout using CSS
const questionsPath = 'assets/data/questions.json';

var questions;
var refreshLocked, antiCheatActive;
var clockTimeMS = 0, //holds the calculated question time; Immutable.
    remainingTime; //mutable.

var intervalId;
var lock = false;

$(document).ready(() => {
    questions = createQuestions();
    console.log('questions:\n', questions);
    init();
})

window.onbeforeunload = function () {
    localStorage.setItem('refreshed', true);
    return "Dude, are you sure you want to leave? Think of the kittens!";
}

function init() {

    refreshLocked = localStorage.getItem('refreshed');

    questions.forEach(question => {
        renderQuestion(question);
    });

    $("input[type='radio']").click(function () {
        // console.log('clicked radio button!', );
        // var value = $("input[name='rbtn']:checked").val();
        // console.log('is checked? ', value);
        let position = $(this).attr('data-pos');
        console.log('position: ', position)
    })

    //add up all the questions' times in seconds.
    clockTimeMS = questions.map(s => getSeconds(s.TimeLimit)).reduce(sum);
    // console.log(`Full Time Limit:  ${clockTimeMS}`);
    remainingTime = 5;

    //todo: uncomment when done.
    // remainingTime = clockTimeMS;
    // if (refreshLocked) {
    //     fullTime /= 2;
    //   antiCheatActive = true;
    // }

    renderClock();
    runClock();
}

function runClock() {
    if (!lock) {
        intervalId = setInterval(decrement, 1000);
        lock = true;
    }
}

function decrement() {
    remainingTime--;
    renderClock();

    if (remainingTime <= 0) {
        stop();
        alert("Time's up!");
        //todo: also create a splash screen or H1, something to indicate win/loss for those who've disabled alerts.

        checkScore();
    }
}

function stop() {
    clearInterval(intervalId);
    lock = false;
}

function renderClock() {
    $('#clock').text(`Time Remaining ${timeConverter(remainingTime)}`);
}

function getSeconds(miniTimestamp) {
    var parts = miniTimestamp.split(":");
    var seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return seconds;
}

function sum(total, num) {
    return total + num;
}

function checkScore() {
    var scorecard = [];

    $("input[type='radio']:checked").each(function (index) {
        let button = $(this);
        let position = button.attr('data-pos');

        console.log('radio #: ', position);
        console.log('question #: ', index);
    })
}



//Render as a radio button
function renderQuestion(question, renderType) {

    var form = $('#questions');
    //Render the question text above as a styled <p> tag or h3,h4, etc.

    $('<h4>').text(question.Question).appendTo(form);
    var choicesDiv = $('<div>').appendTo(form)

    for (i = 0; i < question.Answers.length; i++) {
        let choice = question.Answers[i];

        let choiceElement = $(`<input type="radio" name="rbtn - ${question.Question}" class="answer" data-pos="${i}">
            <label>${choice}</label>
        </input>`)

        choiceElement.appendTo(choicesDiv);
    };
}

function createQuestions() {
    //RULES:
    //for 4 answer or less questions, always the first answer is correct.  Scrambled.
    //for T/F questions, the first answer is always correct.  Scrambled.

    return [{
        "Question": "What is the airspeed of an unladen swallow?",
        "Answers": ["25 m/s for Asian swallows", "8 m/s for African swallows", "What do you mean? African or European?", "10 m/s for European swallows"],
        "TimeLimit": "02:30",
        "Quip": "Well, you have to know these things when you're king, you know."
    }, {
        "Question": "What is the capital of Assyria?",
        "Answers": ["Calah", "Nineveh", "Ashur", "Dur Sharrukin"],
        "Correct Answer": "All",
        "TimeLimit": "02:30",
        "Quip": "I don't know that!  Arrrgh!"
    }, {
        "Question": "Who are the nephews of Scrooge McDuck?",
        "Answers": ["Huey, Dewey and Louie", "Moe, Curly and Larry", "Buttercup, Blossom, Bubbles", "Ed, Ed and Eddie"],
        "Quip": "Woo-oo!",
        "TimeLimit": "00:30",
    }, {
        "Question": "Who developed Siri?",
        "Answers": ["DARPA", "Apple", "Microsoft", "Oracle", "None of the above"],
        "Quip": "Yeah, I got this one wrong, too...",
        "TimeLimit": "00:30",
    }, {
        "Question": "What is Master Chief's code name?",
        "Answers": ["John-117", "James-117", "Agent-86", "Agent-99"],
        "Quip": "1337",
        "TimeLimit": "00:45",
    }, {
        "Question": "True or False: Neo from the Matrix was 'the One'",
        "Answers": ["True", "False", "Idk, ask the Wachowski Bros..."],
        "Correct Answer": "All",
        "TimeLimit": "01:00",
    }, {
        "Question": "Quark was a character from which Star Trek series?",
        "Answers": ["Star Trek: Deep Space Nine", "Star Trek: The Original Series", "Star Trek: Voyager", "Star Trek: The Next Generation"],
        "TimeLimit": "00:30",
    }]

}

//  {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// }, {
//     "Question": "",
//     "Answers": ["", "", "", ""],
//     "Correct Answer": "",
// },
// ]);

//Helpers
function loadQuestions(fileName) {
    $.getJSON(fileName, function (json) {
        console.log('json ', json);
    }).then((result) => {
        // return result()
    });
} //not working, due to Chrome being more 'secure' with local files...

function range(start, end) {
    return [...Array(1 + end - start).keys()].map(v => start + v)
}

function randomInt(min, max, inclusive) {
    return Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min;
}


var wait = ms => new Promise((r, j) => {
    setTimeout(r, ms);
})

function timeConverter(s) {
    //  Takes the current time in seconds and convert it to minutes and seconds (mm:ss).
    var minutes = Math.floor(s / 60);
    var seconds = s - (minutes * 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes === 0) {
        minutes = "00";
    } else if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return minutes + ":" + seconds;
}