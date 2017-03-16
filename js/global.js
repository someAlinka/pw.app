'use strict';

/******VARISBLES*********/
var doc = document;
var header = doc.getElementById("header");
var logoutObj = doc.getElementById("auth__logout");
var loginObj = doc.getElementById("auth__login");
var authPopup = doc.getElementById("auth__popup");
var headerGreeting = doc.getElementById("header__greeting");
var staticPageLink = doc.getElementById("static-page__link");
var navBar = doc.getElementById("main-navbar");
var parrotJson = {};
/******VARISBLES*********/


/********* FUNCTIONS *********/
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function isAuthorized() {
    return  doc.cookie.indexOf('authParrot=') > -1;
}

function clearField() {
    for(var field of arguments){
        field.value = "";
    }
}

function addClass(obj, classStr) {
    obj.className = obj.className + " " + classStr;
}

function removeClass(obj, classStr) {
    obj.className = obj.className.replace(" " + classStr, "");
}

function addErrorMessage(obj, message) {
    obj.nextElementSibling.innerHTML = message;
    addClass(obj, 'js_error');
}

function resetErrors() {
    for(var field of arguments){
        removeClass(field, "js_error");
        field.nextElementSibling.innerHTML = "";
    }
}

function checkEmpty(){
    var res = true;
    for(var field of arguments){
        if(!field.value){
            addErrorMessage(field, "You can't leave this field empty.");
            res = false;
        }
    }
    return res;
}

function validateEmail(obj) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(obj.value)) {
        addErrorMessage(obj, "Email not valid.");
        return false;
    } else {
        resetErrors(obj);
        return true;
    }
}


function validTextField() {
    var res = true;
    for(var field of arguments){
        if(field.value.length < 4){
            addErrorMessage(field, "This field must contain at least 4 characters.");
            res = false;
        }else{
            resetErrors(field);
        }
    }
    return res;
}

/***** events ****/
document.addEventListener('keyup', function(event){
    if(event.target.classList.contains('js_error')){
        removeClass(event.target, 'js_error');
    }
});

document.addEventListener('click', function(event){
    var forLogin = authPopup.contains(event.target),
        forMenu = navBar.contains(event.target);

    if(!forLogin && !event.target.classList.contains("auth__login")){
        removeClass(authPopup, "open-popup");
    }
    if(!forMenu && !event.target.classList.contains("toggle-navbar")){
        removeClass(navBar, "open-menu");
    }
});


