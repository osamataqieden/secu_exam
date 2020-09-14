function showSignUpForm(){
    document.getElementById("signInForm").style.display = 'none';
    document.getElementById("sign-up-button").style.display = 'none';
    document.getElementById("signUpForm").style.display = 'block';
}

function onStartup(){
    document.getElementById("sign-up-button").addEventListener("click", showSignUpForm);
}

window.addEventListener("load", onStartup);