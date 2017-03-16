'use strict';
/* Controllers */

// Main controller
pwApp.controller('ParrotCtrl',['$scope','$http', '$location', function($scope, $http, $location) {
    staticPageLink = doc.getElementById("static-page__link");

    if (isAuthorized()) {
        addClass(header, "authorized");
        parrotJson = JSON.parse(localStorage.parrotJson);
        headerGreeting.innerHTML = `Hello, ${parrotJson['name']}`;
        setTimeout(function() {
            if(staticPageLink) staticPageLink.setAttribute("href", '#/transaction');
        }, 0);
    }

    $scope.login = function(event) {
        event.preventDefault();
        var mail = doc.getElementById("login__email"),
            pass = doc.getElementById("login__password"),
            isValidMail, isValidText, isNotEmpty;

        resetErrors(mail, pass);
        isValidMail = validateEmail(mail),
        isValidText = validTextField(pass),
        isNotEmpty = checkEmpty(mail, pass);
        if(isNotEmpty && isValidMail && isValidText){
            var body = `${mail.value},${pass.value}`;
            $http.post("http://127.0.0.1:8080/login", body).success(function(data, status) {
                if(data.success){
                    addClass(header, "authorized");
                    parrotJson["id"] = data.userId;
                    parrotJson["name"] = data.userName;
                    parrotJson["email"] = mail.value;
                    parrotJson["balance"] = data.balance;

                    localStorage.setItem('parrotJson', JSON.stringify(parrotJson));
                    doc.cookie = `authParrot=${data.idToken}`;
                    removeClass(authPopup, "open-popup");
                    headerGreeting.innerHTML = `Hello, ${data.userName}`;
                    clearField(mail, pass);
                    setTimeout(function() {
                        if(staticPageLink) staticPageLink.setAttribute("href", '#/transaction');
                    }, 0);
                }else{
                    if(data.hasOwnProperty("mailMess")){
                        addErrorMessage(mail, data.mailMess);
                    }
                    if(data.hasOwnProperty("passMess")){
                        addErrorMessage(pass, data.passMess);
                    }
                }
            });
        }
    }

    $scope.logout = function(event) {
        doc.cookie = 'authParrot=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        headerGreeting.innerHTML = "";
        setTimeout(function() {
            if(staticPageLink) staticPageLink.setAttribute("href", '#/registration');
            removeClass(header, "authorized");
        }, 0);
        localStorage.removeItem('parrotJson');
        window.location.href = "#/";
    };

    $scope.closeLoginPopup = function(){
        removeClass(authPopup, "open-popup");
    }

}]);

//Registration Controller
pwApp.controller('RegistrationCtrl',['$scope','$http', '$location', function($scope, $http, $location) {
    $scope.register = function (event) {
        var name = doc.getElementById("register__name"),
            mail = doc.getElementById("register__email"),
            pass = doc.getElementById("register__password"),
            passConfirm = doc.getElementById("register__confirm-password"),
            isValidMail, isValidText, isNotEmpty, isPassword = false;

        event.preventDefault();
        isValidText = validTextField(name, pass, passConfirm);
        if(pass.value === passConfirm.value){
            resetErrors(passConfirm);
            isPassword = true;
        }else{
            addErrorMessage(passConfirm, "The passwords must match.");
        }
        isValidMail = validateEmail(mail);
        isNotEmpty = checkEmpty(name,mail, pass,passConfirm);
        if(isNotEmpty && isValidMail && isValidText && isPassword){
            var body = `${name.value},${mail.value},${pass.value}`;
            $http.post("http://127.0.0.1:8080/registration", body).success(function(data, status) {
                if(data.success){
                    addClass(doc.getElementById("register-form"), "main-wrapper_disabled");
                    removeClass(doc.getElementById("complete"), "main-wrapper_disabled");
                }else{
                    if(data.hasOwnProperty("mailMess")){
                        addErrorMessage(mail, data.mailMess);
                    }
                }
            });
        }
    }
}]);

//Profile Controller
pwApp.controller('ProfileCtrl',['$scope','$http', '$location', function($scope, $http, $location) {
    if(!isAuthorized()) window.location.href = "#/";
    parrotJson = JSON.parse(localStorage.parrotJson);
    $scope.name = parrotJson['name'];
    $scope.email = parrotJson['email'];
    $scope.balance = parrotJson['balance'];
}]);

//Transaction Controller
pwApp.controller('TransactionCtrl',['$scope','$http', '$location', function($scope, $http, $location) {
    if(!isAuthorized()) window.location.href = "#/";

    parrotJson = JSON.parse(localStorage.parrotJson);
    $scope.balance = parrotJson['balance'];

    $scope.transaction = function(event){
        event.preventDefault();
        var form = doc.getElementById("transact-form"),
            mail = doc.getElementById("transact__email"),
            amonth = doc.getElementById("transact__amonth"),
            isValidMail, isNaNAmonth, isNotEmpty;

        resetErrors(mail, amonth);
        isValidMail = validateEmail(mail);
        isNaNAmonth = (isNaN(parseInt(amonth.value)))? false : true;
        if(!isNaNAmonth) addErrorMessage(amonth, "Must be number");
        isNotEmpty = checkEmpty(mail, amonth);

        if(parrotJson['email'] === mail.value){
            addErrorMessage(mail, "Cant be your email");
            isValidMail = false;
        }
        if(isNotEmpty && isValidMail && isNaNAmonth){
            var body = `${parrotJson['email']},${mail.value},${amonth.value}`;
            $http.post("http://127.0.0.1:8080/transaction", body).success(function(data, status) {
                if(data.success){
                    $scope.balance = $scope.balance - amonth.value;
                    doc.getElementById("amonth").innerHTML = $scope.balance;
                    parrotJson["balance"] = $scope.balance;
                    localStorage.setItem('parrotJson', JSON.stringify(parrotJson));
                    clearField(mail, amonth);
                    addClass(form, "completed");
                    setTimeout(function() {
                        removeClass(form, "completed");
                    }, 3000);
                }else{
                    if(data.hasOwnProperty("mailMess")){
                        addErrorMessage(mail, data.mailMess);
                    }
                    if(data.hasOwnProperty("balanceMess")){
                        addErrorMessage(amonth, data.balanceMess);
                    }
                }
            });
        }
    }
}]);

//History Controller
pwApp.controller('HistoryCtrl',['$scope','$http', '$location', function($scope, $http, $location) {
    if(!isAuthorized()) window.location.href = "#/";

    var historyForm = doc.getElementById("history-form");

    $scope.sortField = undefined;
    $scope.reverseSort = false;
    $scope.sortHistory = function(fieldName){
        if($scope.sortField === fieldName){
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortField = fieldName;
            $scope.reverseSort = false;
        }
    }
    
    parrotJson = JSON.parse(localStorage.parrotJson);
    $scope.userId = parrotJson['id'];
    $scope.email = parrotJson['email'];
    $scope.balance = parrotJson['balance'];
    var body = `${parrotJson['id']},${parrotJson['email']}`;
    $http.post("http://127.0.0.1:8080/history", body).success(function(data, status) {
        if(data.success){
            $scope.history = data.history;
        }else{
            addClass(historyForm, 'history-no');
        }
    });

    $scope.transaction = function(event){
        var parent = event.target.parentElement.parentElement,
            retry_email = parent.getElementsByClassName('history__email-recipient')[0].innerHTML,
            retry_balance = parseInt(parent.getElementsByClassName('history__balance')[0].innerHTML),
            body = `${parrotJson['email']},${retry_email},${retry_balance}`;
        $http.post("http://127.0.0.1:8080/transaction", body).success(function(data, status) {
            if(data.success){
                $scope.balance = $scope.balance - parseInt(retry_balance);
                doc.getElementById("amonth").innerHTML = $scope.balance;
                parrotJson["balance"] = $scope.balance;
                localStorage.setItem('parrotJson', JSON.stringify(parrotJson));

                addClass(historyForm, "history-ok");
                setTimeout(function() {
                    window.location.reload();
                }, 3000);
            }else{
                addClass(historyForm, "history-error");
                setTimeout(function() {
                    removeClass(historyForm, "history-error");
                }, 3000);
            }
        });
    };
}]);