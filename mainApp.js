function showSignUpForm(){
    UIHelper.showSignUpForm();
}

function submitLogInForm(){
    let email = document.getElementById("userEmail").value;
    let password = document.getElementById("userPassword").value;
    firebase.auth().signInWithEmailAndPassword(email,password).then(() => {
        
        UIHelper.hideAuthScreen();
        //let exams = null;
        //UIHelper.showTeacherFirstScreen(exams);
    }).catch((err) => {
        alert("Error signing in " + err);
    });
}

function submitSignUpForm(){
    let email = document.getElementById("userEmail1").value;
    let password = document.getElementById("userPassword1").value;
    firebase.auth().createUserWithEmailAndPassword(email,password).then(() => {
        alert("done");
    })
    .catch((err) => {
        alert("Error signing up " + err);
    })
    //UIHelper.hideAuthScreen();
    //let exams = null;
    //UIHelper.showTeacherFirstScreen(exams);
}

function submitExamSettings(){
    let numQuestions = document.getElementById("examNumQuestions").value;
    UIHelper.displayQuestionFields(numQuestions);
}

function addExam(){
    UIHelper.showHome();
}

function onStartup(){
    document.getElementById("sign-up-button").addEventListener("click", showSignUpForm);
    document.getElementById("formSignUp").addEventListener("submit", submitSignUpForm);
    document.getElementById("formSignIn").addEventListener("submit", submitLogInForm);
    document.getElementById("examSettings").addEventListener("submit", submitExamSettings);
    document.getElementById("examQuestions").addEventListener("submit" , submitSignUpForm);
}

window.addEventListener("load", onStartup);

//Main UI renderer is inside the function UIHelper.
const UIHelper = (() => {
    let first = true;
    const TEXT_NO_EXAMS_1 = "You don't seem to have any exams scheduled";
    const TEXT_NO_EXAMS_2 = "Press the 'Add Exam' button to the left to schedule a new exam!";
    const QUESTION_INPUT_TEXT = 'Please enter the question text for question #';
    const TEXT_MCQ = "Below are answers for multiple choice questions, please ignore them if this question is not an MCQ";
    const showSignUpForm = () => {
        document.getElementById("signInForm").style.display = 'none';
        document.getElementById("sign-up-button").style.display = 'none';
        document.getElementById("signUpForm").style.display = 'block';
    };
    const showLoginUpForm = () => {
        document.getElementById("signInForm").style.display = 'block';
        document.getElementById("sign-up-button").style.display = 'block';
        document.getElementById("signUpForm").style.display = 'none';
    };
    const hideAuthScreen = () => {
        document.getElementById("firstScreenContiner").style.display = 'none';
    }
    const showTeacherFirstScreen = (Exams) => {
        document.getElementById("mainPageContainer").style.display = "block";
        document.getElementById("homeButton").addEventListener("click" , showHome);
        document.getElementById("newExamButton").addEventListener("click", showNewExamForm);
        document.getElementById("settingsButton").addEventListener("click",showSettings);
        document.getElementById("aboutButton").addEventListener("click", showAbout);
        let examViewer = document.getElementById("examViewer");
        if(Exams === null){
            if(!first) 
                return;
            let Jumbotron = document.createElement("div");
            Jumbotron.classList.add("jumbotron");
            Jumbotron.classList.add('bg-light');
            let textArea = document.createElement("h1");
            textArea.innerText = TEXT_NO_EXAMS_1;
            textArea.classList.add('display-4');
            Jumbotron.append(textArea);
            let smallTextArea = document.createElement("p");
            smallTextArea.innerText = TEXT_NO_EXAMS_2;
            smallTextArea.classList.add('lead');
            Jumbotron.append(smallTextArea);
            examViewer.append(Jumbotron);
        }
        else {
            let layoutGrid = document.createElement("div");
            layoutGrid.classList.add("row");
            layoutGrid.classList.add("row-cols-3");
            layoutGrid.classList.add("justify-content-between");
            Exams.forEach(Exam => {
                let examCard = document.createElement("div");
                examCard.classList.add("card");
                examCard.classList.add("bg-white");
                examCard.classList.add("m-5");
                examCard.classList.add("col");
                examCard.style.textAlign = 'center';
                let cardBody = document.createElement("div");
                cardBody.classList.add("card-body");
                let subjectName = document.createElement("h5");
                subjectName.classList.add("card-title");
                subjectName.innerText = Exam.subjectName;
                let examName = document.createElement("h6");
                examName.classList.add("card-subtitle");
                examName.innerText = Exam.examTitle;
                let examDesc = document.createElement("p");
                examDesc.classList.add("card-text");
                examDesc.innerText = Exam.description;
                cardBody.append(subjectName);
                cardBody.append(examName);
                cardBody.append(examDesc);
                examCard.append(cardBody);
                layoutGrid.append(examCard);
            });
            examViewer.append(layoutGrid);
        }
        first = false;
    }
    const showNewExamForm = () => {
        document.getElementById("examViewer").style.display = "none";
        document.getElementById("settings").style.display = "none";
        document.getElementById("about").style.display = "none";
        document.getElementById("examQuestions").style.display = "none";
        document.getElementById("newExamForm").style.display = 'block';
        document.getElementById("examSettings").style.display = 'block';
    }
    const showAbout = () => {
        document.getElementById("examViewer").style.display = "none";
        document.getElementById("settings").style.display = "none";
        document.getElementById("newExamForm").style.display = "none";
        document.getElementById("about").style.display = 'block';
    }
    const showSettings = () => {
        document.getElementById("examViewer").style.display = "none";
        document.getElementById("about").style.display = "none";
        document.getElementById("newExamForm").style.display = "none";
        document.getElementById("settings").style.display = 'block';
    }
    const showHome = () => {
        document.getElementById("settings").style.display = "none";
        document.getElementById("about").style.display = "none";
        document.getElementById("newExamForm").style.display = "none";
        document.getElementById("examViewer").style.display = "block";
    }
    const createMCQEntries = (id) => {
        let mcqRow1 = document.createElement("div");
        mcqRow1.classList.add("form-row");
        let firstAnswerGroup = document.createElement("div");
        firstAnswerGroup.classList.add("form-group");
        firstAnswerGroup.classList.add("col-md-6");
        let label = document.createElement("label");
        label.setAttribute("for" , "answer1" + id);
        label.innerHTML = "A";
        let input = document.createElement("input");
        input.setAttribute("type" , "text");
        input.setAttribute("disabled" , "true");
        input.classList.add("form-control");
        input.id = "answer1" + id;
        let secondAnswerGroup = document.createElement("div");
        secondAnswerGroup.classList.add("form-group");
        secondAnswerGroup.classList.add("col-md-6");
        let label2 = document.createElement("label");
        label2.setAttribute("for" , "answer2" + id);
        label2.innerHTML = "B";
        let input2 = document.createElement("input");
        input2.setAttribute("type" , "text");
        input2.classList.add("form-control");
        input2.setAttribute("disabled" , "true");
        input2.id = "answer2" + id;
        firstAnswerGroup.append(label);
        firstAnswerGroup.append(input);
        secondAnswerGroup.append(label2);
        secondAnswerGroup.append(input2);
        mcqRow1.append(firstAnswerGroup);
        mcqRow1.append(secondAnswerGroup);

        let mcqRow2 = document.createElement("div");
        mcqRow2.classList.add("form-row");
        let thirdAnswerGroup = document.createElement("div");
        thirdAnswerGroup.classList.add("form-group");
        thirdAnswerGroup.classList.add("col-md-6");
        let label3 = document.createElement("label");
        label3.setAttribute("for" , "answer3" + id);
        label3.innerHTML = "C";
        let input3 = document.createElement("input");
        input3.setAttribute("type" , "text");
        input3.classList.add("form-control");
        input3.setAttribute("disabled" , "true");
        input3.id = "answer3" + id;
        let forthAnswerGroup = document.createElement("div");
        forthAnswerGroup.classList.add("form-group");
        forthAnswerGroup.classList.add("col-md-6");
        let label4 = document.createElement("label");
        label4.setAttribute("for" , "answer4" + id);
        label4.innerHTML = "D";
        let input4 = document.createElement("input");
        input4.setAttribute("type" , "text");
        input4.classList.add("form-control");
        input4.setAttribute("disabled" , "true");
        input4.id = "answer4" + id; 
        thirdAnswerGroup.append(label3);
        thirdAnswerGroup.append(input3);
        forthAnswerGroup.append(label4);
        forthAnswerGroup.append(input4);
        mcqRow2.append(thirdAnswerGroup);
        mcqRow2.append(forthAnswerGroup);
        return {
            row1: mcqRow1, 
            row2: mcqRow2
        }
    }
    const createQuestionBox = (id) => {
        let questionBoxGroup = document.createElement("div");
        questionBoxGroup.classList.add("form-group");
        let label = document.createElement("label");
        label.classList.add("lead");
        label.setAttribute("for" , "questionText" + id);
        label.innerHTML = QUESTION_INPUT_TEXT + (id + 1);
        questionBoxGroup.append(label);
        let input = document.createElement("input");
        input.setAttribute("type" , "text");
        input.classList.add("form-control");
        input.id = "questionText" + id;
        questionBoxGroup.append(input);
        return questionBoxGroup;
    }
    const createSelectMenu = (id) => {
        let questionBoxGroup = document.createElement("div");
        questionBoxGroup.classList.add("form-group");
        let selectMenu1 = document.createElement("select");
        selectMenu1.id = "questionType" + id;
        selectMenu1.classList.add("custom-select");
        let option1 = document.createElement("option");
        option1.setAttribute("selected" , "true");
        option1.innerHTML = "Choose the Question Type";
        let option2 = document.createElement("option");
        option2.setAttribute("value" , "MCQ");
        option2.innerHTML = "Multiple Choice";
        let option3 = document.createElement("option");
        option3.setAttribute("value" , "Essay");
        option3.innerHTML = "Essay";
        let option4 = document.createElement("option");
        option4.setAttribute("value" , "TF");
        option4.innerHTML = "True or False";
        selectMenu1.append(option1);
        selectMenu1.append(option2);
        selectMenu1.append(option3);
        selectMenu1.append(option4);
        questionBoxGroup.append(selectMenu1);
        return questionBoxGroup;
    }
    const enableMCQ = (id) => {
        document.getElementById("answer1" + id).removeAttribute("disabled");
        document.getElementById("answer2" + id).removeAttribute("disabled");
        document.getElementById("answer3" + id).removeAttribute("disabled");
        document.getElementById("answer4" + id).removeAttribute("disabled");
    }
    const disableMCQ = (id) => {
        document.getElementById("answer1" + id).setAttribute("disabled" , "true")
        document.getElementById("answer2" + id).setAttribute("disabled" , "true");
        document.getElementById("answer3" + id).setAttribute("disabled" , "true");
        document.getElementById("answer4" + id).setAttribute("disabled" , "true");
    }
    const displayQuestionFields = (numQuestions) => {
        document.getElementById("examSettings").style.display = 'none';
        let questionForm = document.getElementById("examQuestions");
        questionForm.innerHTML = "";
        for(let i = 0;i<numQuestions;i++){
            let questionBox = createQuestionBox(i);
            questionForm.append(questionBox);
            let selectMenu = createSelectMenu(i);
            questionForm.append(selectMenu);
            let text = document.createElement("h5");
            text.innerText = TEXT_MCQ;
            text.classList.add("lead");
            questionForm.append(text);
            let mcqAns = createMCQEntries(i);
            questionForm.append(mcqAns.row1);
            questionForm.append(mcqAns.row2);
            let selectMenuRef = document.getElementById("questionType" + i);
            selectMenuRef.onchange = () => {
                let val = selectMenuRef.value;
                console.log(val);
                if(val === 'MCQ'){
                    console.log("here");
                    enableMCQ(i);
                }
                else {
                    disableMCQ(i);
                }
            }
            questionForm.append(document.createElement("br"));
        }
        let subButton = document.createElement("button");
        subButton.classList.add("btn");
        subButton.classList.add("btn-lg");
        subButton.classList.add("btn-block");
        subButton.classList.add("sign-in-buttons");
        subButton.classList.add("text-light");
        subButton.setAttribute("type" , "submit");
        subButton.innerHTML = "Finish Exam Creation";
        subButton.onclick = () => {showHome()};
        questionForm.append(subButton);
        questionForm.style.display = 'block';
    }
    return {
        showHome,
        showLoginUpForm,
        showSignUpForm,
        hideAuthScreen,
        showTeacherFirstScreen,
        displayQuestionFields
    }
})();