//Function that is used as helper to display and 
const UIHelper = (() => {
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
    const showTeacherFirstScreen = () => {
        document.getElementById("mainPageContainer").style.display = "block";
    }
    return {
        showLoginUpForm,
        showSignUpForm,
        hideAuthScreen,
        showTeacherFirstScreen
    }
})();

function showSignUpForm(){
    UIHelper.showSignUpForm();
}

function submitLogInForm(){
    UIHelper.hideAuthScreen();
    UIHelper.showTeacherFirstScreen();
}

function submitSignUpForm(){
    UIHelper.hideAuthScreen();
}

function onStartup(){
    document.getElementById("sign-up-button").addEventListener("click", showSignUpForm);
    document.getElementById("formSignUp").addEventListener("submit", submitSignUpForm);
    document.getElementById("formSignIn").addEventListener("submit", submitLogInForm);
}

window.addEventListener("load", onStartup);