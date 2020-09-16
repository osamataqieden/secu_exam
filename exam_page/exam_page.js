const { ipcRenderer } = require("electron");
let examData;
let currentIndex;
let answers;

function addText(HTMLElementID, text){
    document.getElementById(HTMLElementID).innerText = text;
}

function nextQuestion(){
    
}

function createRadioElement(text , forVal){
    let formCheck = document.createElement("div");
    formCheck.classList.add("form-check");
    let formCheckInput = document.createElement("input");
    formCheckInput.setAttribute("type" , "radio");
    formCheckInput.setAttribute("name", "MCQAnswer");
    formCheckInput.classList.add("form-check-input");
    formCheckInput.id = "MCQAnswer" + forVal;
    let formCheckLabel = document.createElement("label");
    formCheckLabel.setAttribute("for" , "MCQAnswer" + forVal);
    formCheckLabel.classList.add("form-check-label");
    formCheckLabel.innerText = text;
    formCheck.append(formCheckInput);
    formCheck.append(formCheckLabel);
}

function displayQuestion(currentIndex){
    let examBoard = document.getElementById("examBoard");
    examBoard.innerHTML = "";
    let questionText = answers[currentIndex].questionText;
    let questionType = answers[currentIndex].questionType;
    let questionTextElement = document.createElement("p");
    questionTextElement.classList.add("lead");
    questionTextElement.innerText = "Q" + (currentIndex + 1) + ": " + questionText;
    if(questionType === "Essay"){
        let textarea = document.createElement("textarea");
        examBoard.append(questionText);
        examBoard.append(textarea);
    }
    else if(questionType === "MCQ"){
        let firstAnswer = createRadioElement(answers[currentIndex].answer1, 1);
        let secondAnswer = createRadioElement(answers[currentIndex].answer2, 2);
        let thirdAnswer = createRadioElement(answers[currentIndex].answer3, 3);
        let forthAnswer = createRadioElement(answers[currentIndex].answer4, 4);
        examBoard.append(questionText);
        examBoard.append(firstAnswer);
        examBoard.append(secondAnswer);
        examBoard.append(thirdAnswer);
        examBoard.append(forthAnswer);
    }
    else if(questionType === "TF"){
        let firstAnswer = createRadioElement("True" , 1);
        let secondAnswer = createRadioElement("False" , 1);
        examBoard.append(questionText);
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
        showExam();
        ipcRenderer.on("cheat-auto-fail" , (event, arg) => {
            alert("Cheat Discovered!");
        })
    })
    window.addEventListener("resize" , screenSizeChange);
    document.addEventListener("visibilitychange" , visibiltyChange);
    currentIndex = 0;
    answers = Object.values(examData.examQuestions).filter((value) => {
        return typeof value === "object";
    });
    document.getElementById("examBoard").style.display = "block";
    displayQuestion(currentIndex);
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
            addText("headPoseDetectionWarning" , "If this is enabled, please don't move your screen or your change the angle of your laptop screen");
        }
        else{
            addText("headPoseDetection", "You MAY look left/right/up/down during the exam");
        }
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