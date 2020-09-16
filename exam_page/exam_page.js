const { ipcRenderer } = require("electron");
let examData;

function addText(HTMLElementID, text){
    document.getElementById(HTMLElementID).innerText = text;
}

function startExam(){

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