const { ipcRenderer } = require("electron");
let cheatingattempts = 0;
let examPolicies;
let imageDetector;
const AMAZON_REGION = 'us-east-1';
const AMAZON_IDENTITYPOOLID = 'us-east-1:440300b8-83f5-414b-8f37-535823a58e9b';
let headPoseValues = null;

startup();

function startup() {
    ipcRenderer.send("data-req");
    ipcRenderer.on("data-rep", (event, examData) => {
        examPolicies = examData.examData.policies;
    });
    ipcRenderer.on("start-exam-observer", (event, arg) => {
        imageDetector = imageDetectorModule({
            region: AMAZON_REGION,
            identityPoolId: AMAZON_IDENTITYPOOLID
        });
        ipcRenderer.send("start-exam-started");
        if(examPolicies.audioDetection){
            startVoiceDetection();
        }
        if(examPolicies.headPoseDetection || examPolicies.facialDetection || examPolicies.objectDetection){
            setUpVideoDetection();
        }
        ipcRenderer.on("visibilty-change", (event,arg) => {
            if(examPolicies.minimization){
                cheatingattempts++;
                checkThreshold();
            }
        });
        ipcRenderer.on("screen-size-change", (event,arg) => {
            if(examPolicies.screenSize){
                cheatingattempts++;
                checkThreshold();
            }
        });
    });

}

function setUpVideoDetection() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then((stream) => {
        let videoElement = document.getElementById("videoStream");
        let canvasElement = document.getElementById("canvas");
        videoElement.srcObject = stream;
        videoElement.setAttribute("width", 500);
        videoElement.setAttribute("height", 375);
        canvasElement.setAttribute("width", 500);
        canvasElement.setAttribute("height", 375);
        setInterval(detectImageAbnormalities, 1000);
    })
}

const imageDetectorModule = (AWScredentials) => {
    AWS.config.region = AWScredentials.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: AWScredentials.identityPoolId
    });
    let rekognitionObj = new AWS.Rekognition();
    const detectLabels = (params) => {
        return rekognitionObj.detectLabels(params).promise();
    }
    const detectFaces = (params) => {
        return rekognitionObj.detectFaces(params).promise();
    }
    return {
        detectFaces,
        detectLabels
    }
};

function startVoiceDetection() {
    let harker;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then((audioStream) => {
        harker = new hark(audioStream);
        let audioStart;
        let audioEnd;
        harker.on('speaking', () => {
            audioStart = Date.now();
            cheatingattempts++;
            checkThreshold();
        });
        harker.on("stopped_speaking", () => {
            audioEnd = Date.now();
            console.log(audioEnd);
            let timelapsed = audioEnd - audioStart;
            if (timelapsed > 2000) {
                cheatingattempts++;
                checkThreshold();
            }
        });
    })
}

function checkThreshold() {
    if (cheatingattempts > examPolicies.threshold && examPolicies.automaticFailure) {
        ipcRenderer.send("cheat-auto-fail");
    }
}

function detectImageAbnormalities() {
    const width = 500;
    const height = 375;

    function getBinary(base64Image) {
        var binaryImg = atob(base64Image);
        var length = binaryImg.length;
        var ab = new ArrayBuffer(length);
        var ua = new Uint8Array(ab);
        for (var i = 0; i < length; i++) {
            ua[i] = binaryImg.charCodeAt(i);
        }
        return ab;
    }

    const takePicture = () => {
        let canvasElement = document.getElementById("canvas");
        let videoElement = document.getElementById("videoStream");
        const contex = canvasElement.getContext("2d");
        contex.drawImage(videoElement, 0, 0, width, height);
        const data = canvas.toDataURL("image/jpeg");
        const base64Image = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const imageBytes = getBinary(base64Image);
        return imageBytes;
    }

    const img = takePicture();
    if (examPolicies.facialDetection || examPolicies.headPoseDetection) {
        imageDetector.detectFaces({
            Image: {
                Bytes: img
            },
            Attributes: [
                'ALL'
            ]
        }).then((data) => {
            let faceDetails = data.FaceDetails;
            console.log(faceDetails);
            if (faceDetails.length > 1 && examPolicies.facialDetection) {
                console.log(faceDetails.length);
                cheatingattempts++;
                checkThreshold();
            }
            if (examPolicies.headPoseDetection) {
                if (headPoseValues === null) {
                    headPoseValues = faceDetails[0].Pose;
                    console.log(headPoseValues);
                }
                else {
                    console.log(headPoseValues);
                    console.log(faceDetails[0].Pose);
                    let diffRoll = Math.abs(headPoseValues.Roll - faceDetails[0].Pose.Roll);
                    let diffYaw = Math.abs(headPoseValues.Yaw - faceDetails[0].Pose.Yaw);
                    let diffPitch = Math.abs(headPoseValues.Pitch - faceDetails[0].Pose.Pitch);
                    if (diffRoll > 30 || diffYaw > 30 || diffPitch > 30) {
                        cheatingattempts++;
                        checkThreshold();
                    }
                }
            }
        });
    }
    if (examPolicies.objectDetection) {
        imageDetector.detectLabels({
            Image: {
                Bytes: img
            }
        }).then((data) => {
            let labels = data.Labels;
            labels.forEach(label => {
                if (label.Name === "Cell Phone" || label.Name === "Headset" || label.name === "Reading") {
                    cheatingattempts++;
                    checkThreshold();
                }
            });
        });
    }
}
