const { ipcRenderer } = require("electron");
let examData;
let answers;
let keys;
function getAnswer(index){
    let question = answers[index];
    let answer = {
        questionText: question.questionText, 
        questionType: question.questionType 
    };
    if(question.questionType === "Essay"){
        let text = document.getElementById(index).value;
        let key = "studentAnswer";
        answer[key] = text;
    }
    else if(question.questionType === "MCQ"){
        let key1 = "answer1";
        let key2 = "answer2";
        let key3 = "answer3";
        let key4 = "answer4";
        answer[key1] = question.answer1;
        answer[key2] = question.answer2;
        answer[key3] = question.answer3;
        answer[key4] = question.answer4;
        if(document.getElementById("MCQAnswer" + 1 + "_" + index).checked){
            let key = "studentAnswer";
            answer[key] = "1";
        }
        else if(document.getElementById("MCQAnswer" + 2 + "_" + index).checked){
            let key = "studentAnswer";
            answer[key] = "2";
        }
        else if(document.getElementById("MCQAnswer" + 3 + "_" + index).checked){
            let key = "studentAnswer";
            answer[key] = "3";
        }
        else{
            let key = "studentAnswer";
            answer[key] = "4";
        }
    }
    else {
        if(document.getElementById("MCQAnswer" + 1 + "_" + index).checked){
            let key = "studentAnswer";
            answer[key] = true;
        }
        else {
            let key = "studentAnswer";
            answer[key] = false;
        }
    }
    return answer;
}

function submitAnswers(isFailed){
    ipcRenderer.send("exam-over");
    ipcRenderer.on("shut-down-observer" , (event , arg) => {
        let examEntry = {
            cheatNum: arg.cheatingattempts
        };
        let keyIsCheater = "didFail";
        examEntry[keyIsCheater] = isFailed;
        if(!isFailed){
            for(let i = 0;i<keys.length;i++){
                examEntry[keys[i]] = getAnswer(i);
            }
        };
        event.sender.send("exam-results" , examEntry);
    });
}

function addText(HTMLElementID, text){
    document.getElementById(HTMLElementID).innerText = text;
}

function createCountdownTimer(){
    let duration = examData.examData.duration;
    let spanElement = document.createElement("div");
    spanElement.style.position = "fixed";
    spanElement.classList.add("bg-light");
    spanElement.style.bottom = 0;
    spanElement.style.color = "rgb(126, 38, 118)";
    spanElement.style.textAlign = "center";
    spanElement.innerText = "Time Remaining: ";
    let spanDuration = document.createElement("h5");
    spanDuration.innerText = duration + ":00";
    spanDuration.classList.add("lead");
    spanElement.append(spanDuration);
    document.querySelector("body").append(spanElement);
    setInterval(() => {
        let t = spanDuration.innerText;
        let minutes = parseInt(t.slice(0,2));
        let seconds = parseInt(t.slice(3));
        if(seconds === 0){
            seconds = 59;
            if(minutes === 0){
                alert("Exam Over");
            }
            else minutes--;
        }
        else seconds--;
        if(seconds < 10)
            spanDuration.innerText = minutes + ":0" + seconds; 
        else spanDuration.innerText = minutes + ":" + seconds;
    }, 1000);
}

function createRadioElement(text , forVal, currentIndex){
    let formCheck = document.createElement("div");
    formCheck.classList.add("form-check");
    let formCheckInput = document.createElement("input");
    formCheckInput.setAttribute("type" , "radio");
    formCheckInput.setAttribute("name", "MCQAnswer" + currentIndex);
    formCheckInput.classList.add("form-check-input");
    formCheckInput.id = "MCQAnswer" + forVal;
    let formCheckLabel = document.createElement("label");
    formCheckLabel.setAttribute("for" , "MCQAnswer" + forVal);
    formCheckLabel.classList.add("form-check-label");
    formCheckLabel.innerText = text;
    formCheck.append(formCheckInput);
    formCheck.append(formCheckLabel);
    return formCheck;
}

function displayQuestion(currentIndex){
    createCountdownTimer();
    let hr = document.createElement("hr");
    let examBoard = document.getElementById("examBoard");
    examBoard.append(hr);
    let spanElement = document.createElement("span");
    spanElement.innerText = "Q" + (currentIndex + 1) + ": ";
    spanElement.style.color = "rgb(126, 38, 118)";
    let questionText = answers[currentIndex].questionText;
    let questionType = answers[currentIndex].questionType;
    let questionTextElement = document.createElement("p");
    questionTextElement.classList.add("lead");
    questionTextElement.innerText = questionText;
    if(questionType === "Essay"){
        let textarea = document.createElement("textarea");
        textarea.id = currentIndex;
        textarea.classList.add("form-control");
        textarea.classList.add("form-control-lg");
        examBoard.append(spanElement);
        examBoard.append(questionTextElement);
        examBoard.append(textarea);
    }
    else if(questionType === "MCQ"){
        let firstAnswer = createRadioElement(answers[currentIndex].answer1, 1 + "_" + currentIndex, currentIndex);
        let secondAnswer = createRadioElement(answers[currentIndex].answer2, 2 + "_" + currentIndex, currentIndex);
        let thirdAnswer = createRadioElement(answers[currentIndex].answer3, 3 + "_" + currentIndex, currentIndex);
        let forthAnswer = createRadioElement(answers[currentIndex].answer4, 4 + "_" + currentIndex, currentIndex);
        examBoard.append(spanElement);
        examBoard.append(questionTextElement);
        examBoard.append(firstAnswer);
        examBoard.append(secondAnswer);
        examBoard.append(thirdAnswer);
        examBoard.append(forthAnswer);
    }
    else if(questionType === "TF"){
        let firstAnswer = createRadioElement("True" , 1 + "_" + currentIndex, currentIndex);
        let secondAnswer = createRadioElement("False" , 2 + "_" + currentIndex, currentIndex);
        examBoard.append(spanElement);
        examBoard.append(questionTextElement);
        examBoard.append(firstAnswer);
        examBoard.append(secondAnswer);
    }
}

function screenSizeChange(){
    if(examData.examData.policies.screenSize)
        ipcRenderer.send("screen-size-change");
}

function visibiltyChange(){
    if(document.hidden && examData.examData.policies.minimization)
        ipcRenderer.send("visibilty-change");
}

function startExam(){
    ipcRenderer.send("start-exam");
    ipcRenderer.on("observation-started" , (event, arg) => {
        ipcRenderer.on("cheat-auto-fail" , (event, arg) => {
            submitAnswers(true);
        })
    })
    window.addEventListener("resize" , screenSizeChange);
    document.addEventListener("visibilitychange" , visibiltyChange);
    answers = Object.values(examData.examQuestions).filter((value) => {
        return typeof value === "object";
    });
    keys = Object.keys(examData.examQuestions).filter((value) => {
        return value !== "numberQuestions" && value !== "uuid";
    });
    document.getElementById("welcomescreen").style.display = "none";
    document.getElementById("examBoard").style.display = "block";
    for(let i = 0;i<answers.length;i++){
        displayQuestion(i);
    }
    let button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-lg");
    button.classList.add("btn-block");
    button.classList.add("text-light");
    button.classList.add("secuExamButtons");
    button.innerText = "submit exam";
    button.addEventListener("click" , () => {
        submitAnswers(false);
    });
    button.classList.add("mt-5");
    examBoard.append(button);
}

function onStartup(){
    ipcRenderer.send("data-req");
    ipcRenderer.on("data-rep" , (event , arg) => {
        examData = arg;
        addText("courseTitle" , examData.examData.courseName);
        addText("examTitle", examData.examData.examTitle);
        addText("examDescreption" , examData.examData.description);
        addText("examDuration", "Exam duration: " + examData.examData.duration);
        if(examData.examData.policies.minimization){
            addText("minimization" , "You MAY NOT minimize the exam screen during the duration of the exam");
        }
        else{
            addText("minimization" , "You MAY minimize the exam screen during the duration of the exam");
        }
        if(examData.examData.policies.screenSize){
            addText("screenSize" , "You MAY NOT change the exam screen size during the duration of the exam");
        }
        else{
            addText("screenSize" , "You MAY change the exam screen size during the duration of the exam");
        }
        if(examData.examData.policies.peopleDetection){
            addText("facialDetection" , "You MAY NOT have more then one person in the room during the exam");
        }
        else{
            addText("facialDetection" , "You MAY have more then one person in the room during the exam");
        }
        if(examData.examData.policies.objectDetection){
            addText("objectDetection" , "You MAY NOT use objects such as cell phones, headsets and books during the duration of the exam");
        }
        else{
            addText("objectDetection" , "You MAY use objects such as cell phones, headsets and books during the duration of the exam");
        }
        if(examData.examData.policies.headPoseDetection){
            addText("headPoseDetection", "You MAY NOT look left/right/up/down during the exam");
        }
        else{
            addText("headPoseDetection", "You MAY look left/right/up/down during the exam");
        }
        addText("headPoseDetectionWarning" , "If this is enabled, please don't move your screen or your change the angle of your laptop screen");
        if(examData.examData.policies.audioDetection){
            addText("audioDetection", "You MAY NOT talk or hear any voice or make any noise during the exam");
        }
        else{
            addText("audioDetection", "You MAY talk or hear any voice or make any noise during the exam");
        }
        if(examData.examData.policies.automaticFailure){
            addText("automaticFailure", "You WILL BE automaticlly failed if you violate the policies listed above");
        }
        else{
            addText("automaticFailure", "You WILL NOT BE automaticilly failed if you violate the policies listed above, however you will be branded as a cheater");
        }

        document.getElementById("startExamButton").addEventListener("click" , startExam);
    });
}
window.addEventListener("load", onStartup);