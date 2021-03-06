var questions;
var refreshLocked, antiCheatActive;
var clockTimeMS = 0, //holds the calculated question time; Immutable.
    remainingTime; //mutable.
var intervalId;
var lock = false;

window.onload = function () {
    init();
}

//todo: uncomment when done:
// window.onbeforeunload = function () {
//     localStorage.setItem('refreshed', true);
//     return "Dude, are you sure you want to leave? Think of the kittens!";
// }

function init() {

    $('#submit').on('click', function () {
        stop();
        remainingTime = 0;
        tallyScore();
    })

    questions = createQuestions();
    questions.shuffle();

    // refreshLocked = localStorage.getItem('refreshed');

    questions.forEach((question, index) => { //todo: replace with shuffled
        renderQuestion(question, index);
    });

    clockTimeMS = questions.map(s => getSeconds(s.TimeLimit)).reduce(sum);
    remainingTime = clockTimeMS;

    //todo: uncomment when done.
    // if (refreshLocked) {
    //     clockTimeMS /= 2;
    //     antiCheatActive = true;
    // }

    renderClock();
    runClock();
}

function renderClock() {
    $('#clock').text(`Time Remaining ${timeConverter(remainingTime)}`);
}

function tallyScore() {

    $('#questions').hide();
    $('#clock').hide();
    $('#submit').hide();

    let correct = wrong = 0;

    //TODO: 
    // figure out the score:
    var playerAnswers = [];
    $("input[type='radio']:checked").each(function () {
        let button = $(this);
        let position = button.attr('data-pos');
        let code = button.attr('data-code');

        console.log('radio #: ', position);
        console.log('code: ', code);
        // console.log('question #: ', index);
        playerAnswers.push(parseInt(code));
    })

    console.log('questions (tally) ', questions);

    var codes = [];
    questions.forEach((question, index) => {
        console.log('question ', question);
        console.log('question.code ', question["Correct Answer"].code);
        console.log('question.value ', question["Correct Answer"].value);
        codes.push(question["Correct Answer"].code);
    });

    console.log('correct answers: ', codes);
    console.log('player answers: ', playerAnswers);

    let intersection = intersect(codes, playerAnswers);
    console.log('intersection ', intersection);

    correct = intersection.length;
    wrong = questions.length - correct;

    renderSplash(correct, wrong);
}

var renderedSplash = false;

function renderSplash(correct, wrong) {

    if (renderedSplash) return;

    renderedSplash = true;

    var form = $('#main');

    $('<div>')
        .html(`<h2>Correct: ${correct}</h2><br><h2>Incorrect: ${wrong}</h2>`)
        .appendTo(form);

    if (wrong === 0)
        $('<h1>').text("You sure know trivia!").appendTo(form);
    else
        $('<h1>').text("Aww, rotten luck!").appendTo(form);

}

//Render as a radio button
function renderQuestion(question, index, renderType) {

    var form = $('#questions');

    $('<h4>').text(question.Question).appendTo(form);
    var choicesDiv = $('<div>').appendTo(form)

    for (i = 0; i < question.Answers.length; i++) {
        let choiceText = question.Answers[i];
        let choiceElement = $(`<input type="radio" name="rbtn - ${question.Question}" class="answer" data-code="${question.Answers[i].hashCode()}" data-pos="${question.Question.hashCode()}">
            <label>${choiceText}</label>
        </input>`);

        choiceElement.attr({
            'question': index,
        });

        choiceElement.appendTo(choicesDiv);
    };
}

function createQuestions() {
    //RULES:
    //for 4 answer or less questions, always the first answer is correct.  Scrambled.
    //for T/F questions, the first answer is always correct.  Scrambled.

    let questions = [{
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
        "Question": "Who was the 'the One' from the Matrix?",
        "Answers": ["Neo", "Agent Smith", "Oracle", "Trinity"],
        "TimeLimit": "01:00",
    }, {
        "Question": "Quark was a main character from which Star Trek series?",
        "Answers": ["Star Trek: Deep Space Nine", "Star Trek: The Original Series", "Star Trek: Voyager", "Star Trek: The Next Generation"],
        "TimeLimit": "00:30",
    }]

    //this is so we can always shuffle the answers on the front end,
    //but the backend knows the true answer, easily:
    questions.forEach(question => {
        question["Correct Answer"] = {
            value: question.Answers[0],
            code: question.Answers[0].hashCode(),
        };
    })

    return questions;
}


/**
 * credit: https: //stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function scramble(array) {
    let n = array.length;
    array.forEach(a => {
        swap(array[randomInt(0, n)], array[randomInt(0, n)]);
    })
}

function swap(a, b) {
    var temp = a;
    a = b;
    b = temp;
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
        $("#main").prepend($('<h1>').text("Time's up!"));
        alert("Time's up!");
        //todo: also create a splash screen or H1, something to indicate win/loss for those who've disabled alerts.

        tallyScore();
    }
}

function stop() {
    clearInterval(intervalId);
    lock = false;
}


function getSeconds(miniTimestamp) {
    var parts = miniTimestamp.split(":");
    var seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return seconds;
}

function sum(total, num) {
    return total + num;
}

Array.prototype.shuffle = function () {
    return shuffle(this);
}

String.prototype.hashCode = function () {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

function range(start, end) {
    return [...Array(1 + end - start).keys()].map(v => start + v)
}

function randomInt(min, max, inclusive) {
    return Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min;
}

var wait = ms => new Promise((r, j) => {
    setTimeout(r, ms);
})

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}


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