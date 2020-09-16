let database;
let accountTypeG;
const {ipcRenderer} = require('electron');
function showSignUpForm(){
    UIHelper.showSignUpForm();
}
function submitLogInForm(){
    let email = document.getElementById("userEmail").value;
    let password = document.getElementById("userPassword").value;
    firebase.auth().signInWithEmailAndPassword(email,password).then(() => {
        database.ref("/users/" + firebase.auth().currentUser.uid).once("value").then((snapshot) => {
            accountTypeG = snapshot.val().accountType;
            UIHelper.hideAuthScreen();
            UIHelper.showFirstScreen();
        });
    }).catch((err) => {
        alert("Error signing in " + err);
    });
}

function submitSignUpForm(){
    let email = document.getElementById("userEmail1").value;
    let password = document.getElementById("userPassword1").value;
    firebase.auth().createUserWithEmailAndPassword(email,password).then(() => {
        let uid = firebase.auth().currentUser.uid;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let school = document.getElementById("userSchool").value;
        let accountType;
        if(document.getElementById("teacherRadio").checked)
            accountType = "teacher";
        else accountType = "student";
        database.ref('users/' + uid).set({
            firstName: firstName,
            lastName: lastName,
            school: school,
            email: email,
            uid: uid,
            accountType: accountType,
            examIDs: null,
        });
        accountTypeG = accountType;
        UIHelper.hideAuthScreen();
        UIHelper.showFirstScreen();
    })
    .catch((err) => {
        alert("Sign Up error " + err);
        document.getElementById("emailHelp").innerText = "Email already in use, please try again";
    })
}

async function submitExamSettings(){
    let examUUID = uuidv4();
    let examQuestionsUUID = uuidv4();
    let courseName = document.getElementById("courseName").value;
    let examTitle = document.getElementById("examTitle").value;
    let duration = document.getElementById("duration").value;
    let date = document.getElementById("date").value;
    let timeOfDay = document.getElementById("timeOfDay").value;
    let desc = document.getElementById("description").value;
    let numQuestions = document.getElementById("examNumQuestions").value;
    let policyMinimization = document.getElementById("policyMinimization").checked;
    let policyScreenSize = document.getElementById("policyScreenSize").checked;
    let policyObjectDetection = document.getElementById("policyObjectDetection").checked;
    let policyHeadPoseDetection = document.getElementById("policyHeadPoseDetection").checked;
    let policyPeopleDetection = document.getElementById("policyPeopleDetection").checked;
    let policyAudioDetection = document.getElementById("policyAudioDetection").checked;
    let policyAutomaticFailure = document.getElementById("policyAutomaticFailure").checked;
    let thresholdNumber = document.getElementById("thresholdNumber").value;
    let exam = {
        uuid: examUUID, 
        questionsUUID: examQuestionsUUID,
        courseName: courseName,
        examTitle: examTitle,
        duration: duration,
        date: date,
        timeOfDay: timeOfDay,
        description: desc,
        policies: {
            minimization: policyMinimization,
            screenSize: policyScreenSize,
            objectDetection: policyObjectDetection,
            headPoseDetection: policyHeadPoseDetection,
            peopleDetection: policyPeopleDetection,
            audioDetection: policyAudioDetection,
            automaticFailure: policyAutomaticFailure,
            threshold: thresholdNumber
        }
    };
    database.ref("/users/" + firebase.auth().currentUser.uid + "/examIDs/").push(examUUID);
    database.ref("/exams/" + examUUID).set(exam);
    UIHelper.displayQuestionFields(numQuestions, examQuestionsUUID);
}

function addExam(numQuestions, questionUUID){
    database.ref("/examQuestions/" + questionUUID).set({
        uuid: questionUUID,
        numberQuestions: numQuestions
    });
    for(let i = 0;i<numQuestions;i++){
        let questionText = document.getElementById("questionText" + i).value;
        let questionType = document.getElementById("questionType" + i).value;
        let ans1,ans2,ans3,ans4;
        if(questionType === "MCQ"){
            ans1 = document.getElementById("answer1" + id).value;
            ans2 = document.getElementById("answer2" + id).value;
            ans3 = document.getElementById("answer3" + id).value;
            ans4 = document.getElementById("answer4" + id).value;
        }
        else {
            ans1 = null;
            ans2 = null;
            ans3 = null;
            ans4 = null;
        }
        database.ref("/examQuestions/" + questionUUID).push({
            questionText: questionText,
            questionType: questionType,
            ans1: ans1,
            ans2: ans2,
            ans3: ans3,
            ans4:ans4
        });
    }
    UIHelper.hideExamQuestionsForm();
    UIHelper.showFirstScreen();
    UIHelper.showHome();
}

function startExam(examData){
    const date = Date.parse(examData.date + "T" + examData.timeOfDay + ":00");
    const now = Date.now();
    if(now >= date){
        alert("You can start the exam!");
        database.ref("/examQuestions/" + examData.questionsUUID).once("value").then((snapshot) => {
            let examQuestions = snapshot.val();
            ipcRenderer.send('asynchronous-message' , {
                examData: examData,
                examQuestions: examQuestions
            });
        })
    }
    else {
        alert("This Exam has not started yet, please check the start date for this exam");
    }
}

function addToken(token){
    database.ref("/users/" + firebase.auth().currentUser.uid + "/examIDs/").push(token);
}

function onStartup(){
    document.getElementById("sign-up-button").addEventListener("click", showSignUpForm);
    document.getElementById("formSignUp").addEventListener("submit", submitSignUpForm);
    document.getElementById("formSignIn").addEventListener("submit", submitLogInForm);
    document.getElementById("examSettings").addEventListener("submit", submitExamSettings);
    database = firebase.database();
}

window.addEventListener("load", onStartup);

//Main UI renderer is inside the function UIHelper.
const UIHelper = (() => {
    let first = true;
    let TEXT_NO_EXAMS_1;
    let TEXT_NO_EXAMS_2;
    let BUTTON_TEXT;
    let QUESTION_INPUT_TEXT = 'Please enter the question text for question #';
    let TEXT_MCQ = "Below are answers for multiple choice questions, please ignore them if this question is not an MCQ";
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
    const showJoinExamForm = () => {
        let examViewer = document.getElementById("examViewer");
        examViewer.innerHTML = "";
        let form = document.createElement("form");
        let formGroup = document.createElement("form-group");
        let label = document.createElement("label");
        label.setAttribute("for","tokenInput");
        label.innerText = "Exam Token: ";
        let input = document.createElement("input");
        input.setAttribute("type" , "text");
        input.setAttribute("required" , "true");
        input.classList.add("form-control");
        input.id = "tokenInput";
        let subButton = document.createElement("button");
        subButton.classList.add("btn");
        subButton.classList.add("btn-lg");
        subButton.classList.add("btn-block");
        subButton.classList.add("sign-in-buttons");
        subButton.classList.add("text-light");
        subButton.classList.add("mt-1");
        subButton.setAttribute("type" , "submit");
        subButton.innerHTML = "Join Exam";
        formGroup.append(label);
        formGroup.append(input);
        form.append(formGroup);
        form.append(subButton);
        examViewer.append(form);
        subButton.onclick = () => {
            addToken(input.value);
            examViewer.innerHTML = "";
            showFirstScreen();
        }
    }
    const examCardClick = (examData, examUUID) => {
        let examViewer = document.getElementById("examViewer");
        examViewer.innerHTML = "";
        examViewer.style.textAlign = "center";
        let Jumbotron = document.createElement("div");
        Jumbotron.classList.add("jumbotron");
        Jumbotron.classList.add('bg-light');
        let textArea = document.createElement("h1");
        textArea.innerText = examData.courseName;
        textArea.classList.add('display-4');
        let smallTextArea = document.createElement("p");
        smallTextArea.classList.add('lead');
        smallTextArea.innerText = examData.examTitle;
        let smallTextArea2 = document.createElement("p");
        smallTextArea2.classList.add('lead');
        smallTextArea2.innerText = examData.description;
        let smallTextArea3 = document.createElement("p");
        smallTextArea3.classList.add('lead');
        smallTextArea3.innerText = "Exam duration: " + examData.duration;
        let smallTextArea4 = document.createElement("p");
        smallTextArea4.classList.add('lead');
        smallTextArea4.innerText = "This exam will be held at " + examData.date + " at " + examData.timeOfDay;
        let smallTextArea5 = document.createElement("p");
        smallTextArea5.classList.add('lead');
        smallTextArea5.innerText = "Exam token: " + examUUID;
        let subButton = document.createElement("button");
        subButton.classList.add("btn");
        subButton.classList.add("btn-lg");
        subButton.classList.add("btn-block");
        subButton.classList.add("sign-in-buttons");
        subButton.classList.add("text-light");
        subButton.classList.add("m-5");
        subButton.setAttribute("type" , "submit");
        subButton.innerHTML = "Start Exam";
        subButton.addEventListener("click" , () => {
            startExam(examData);
        });
        Jumbotron.append(textArea);
        Jumbotron.append(smallTextArea);
        Jumbotron.append(smallTextArea2);
        Jumbotron.append(smallTextArea3);
        Jumbotron.append(smallTextArea4);
        Jumbotron.append(smallTextArea5);
        examViewer.append(Jumbotron);
        examViewer.append(subButton);
    }
    const showFirstScreen = () => {
        document.getElementById("mainPageContainer").style.display = "block";
        document.getElementById("homeButton").addEventListener("click", showHome);
        document.getElementById("settingsButton").addEventListener("click", showSettings);
        document.getElementById("aboutButton").addEventListener("click", showAbout);
        let examViewer = document.getElementById("examViewer");
        database.ref("/users/" + firebase.auth().currentUser.uid + "/examIDs/").once("value").then((snapshot) => {
            let Exams = snapshot.val();
            if(accountTypeG === "student"){
                TEXT_NO_EXAMS_1 = "You don't seem to have any exams scheduled";
                TEXT_NO_EXAMS_2 = "You can join an exam by clicking the 'Join Exam' button";
                BUTTON_TEXT = "Join Exam";
                document.getElementById("newExamButton").addEventListener("click", showJoinExamForm);
            }
            else {
                TEXT_NO_EXAMS_1 = "You don't seem to have any exams scheduled";
                TEXT_NO_EXAMS_2 = "You can join an exam by clicking the 'Create Exam' button";
                BUTTON_TEXT = "Create Exam";
                document.getElementById("newExamButton").addEventListener("click", showNewExamForm);
            }
            document.getElementById("smallButton").innerText = BUTTON_TEXT;
            examViewer.innerHTML = "";
            if(Exams === null || Exams === undefined){
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
                Exams = Object.values(Exams);
                let layoutGrid = document.createElement("div");
                layoutGrid.classList.add("row");
                layoutGrid.classList.add("row-cols-1");
                layoutGrid.classList.add("justify-content-between");
                Exams.forEach(Exam => {
                    database.ref("/exams/" + Exam).once("value").then((snapshot) => {
                            let examData = snapshot.val();
                            let examCard = document.createElement("div");
                            examCard.classList.add("card");
                            examCard.classList.add("bg-white");
                            examCard.classList.add("m-2");
                            examCard.classList.add("col");
                            examCard.classList.add("mr-4");
                            let cardBody = document.createElement("div");
                            cardBody.classList.add("card-body");
                            let subjectName = document.createElement("h5");
                            subjectName.classList.add("card-title");
                            subjectName.innerText = examData.courseName;
                            let examName = document.createElement("h6");
                            examName.classList.add("card-subtitle");
                            examName.innerText = examData.examTitle;
                            let examDesc = document.createElement("p");
                            examDesc.classList.add("card-text");
                            examDesc.innerText = examData.description;
                            let examToken = document.createElement("p");
                            examToken.classList.add("card-text");
                            examToken.classList.add("lead");
                            examToken.innerText = "Exam Token: " + Exam;
                            cardBody.append(subjectName);
                            cardBody.append(examName);
                            cardBody.append(examDesc);
                            cardBody.append(examToken);
                            examCard.append(cardBody);
                            console.log(examCard);
                            examCard.addEventListener("click" , () => {
                                examCardClick(examData, Exam);
                            });
                            layoutGrid.append(examCard);
                    });
                });
                examViewer.append(layoutGrid);
            }
        })
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
        showFirstScreen();
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
        input.setAttribute("required" , "true");
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
        input3.setAttribute("required" , "true");
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
        input4.setAttribute("required" , "true");
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
        input.setAttribute("required" , "true");
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
        selectMenu1.setAttribute("required" , "true");
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
    const displayQuestionFields = (numQuestions,questionUUID) => {
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
        subButton.onclick = () => {addExam(numQuestions, questionUUID)};
        questionForm.append(subButton);
        questionForm.style.display = 'block';
    }
    const hideExamQuestionsForm = () => {
        document.getElementById("examQuestions").style.display = "none";
        document.getElementById("examQuestions").innerHTML = "";
    }

    return {
        showHome,
        showLoginUpForm,
        showSignUpForm,
        hideAuthScreen,
        showFirstScreen,
        displayQuestionFields,
        hideExamQuestionsForm
    }
})();