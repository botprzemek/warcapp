// Checkers code in progress

const alert_button = document.querySelector("#alert_button");
let score = [0, 0];
const score_add1 = document.querySelector("#you");
const score_add2 = document.querySelector("#ene");
let nickname = localStorage.getItem("nick");

function clock(){
    setInterval(() => {
        let time = new Date();
        let t = time.toLocaleTimeString();
        let d = time.toLocaleDateString();
        document.getElementById("hour").innerHTML = t;
        document.getElementById("date").innerHTML = d;
    }, 1000);
}


function check_nick(){
    if(localStorage.getItem("nick" !== null)){
        localStorage.setItem("nick", nickname);
    }
    else{
        localStorage.setItem("nick", nickname);
    }
}

function playernickname(){
    let nickname = localStorage.getItem("nick"); 
    document.getElementById("welcoming").innerHTML = "Sesja gracza: " + nickname;
}

function score_check(){
    if(localStorage.getItem("player1" == null) || localStorage.getItem("player2" == null)){
        localStorage.setItem("player1", score[0]);
        localStorage.setItem("player2", score[1]);
        console.log("cipa");
    }
}

function fade(){
    document.body.style.animation = "fade 1s var(--ease) both reverse";
    document.body.style.display = "block";
    setTimeout(() => {
        document.body.style.animation = "none";
    }, 1000);
}

function add1(){
    document.getElementById("score_p1").style.animation = "afade 0.5s var(--easeinout) both";
    setTimeout(() => {
        score[0]++;
        document.querySelector("#score_p1").innerHTML = score[0];
        localStorage.setItem("player1", score[0]);
    }, 250);
    setTimeout(() => {
        document.getElementById("score_p1").style.animation = "none";
    }, 250);
    if(score[0] >= 8-1){
        alert();
        console.log("Wynik: " + score[0]);
    }
}

function add2(){
    document.getElementById("score_p2").style.animation = "afade 0.5s var(--easeinout) both";
    setTimeout(() => {
        score[1]++;
        document.querySelector("#score_p2").innerHTML = score[1];
        localStorage.setItem("player2", score[1]);
    }, 250);
    setTimeout(() => {
        document.getElementById("score_p2").style.animation = "none";
    }, 250);
    if(score[1] >= 8-1){
        alert();
        console.log("Wynik: " + score[1]);
    }
}

function back(){
    document.body.style.animation = "fade 1s var(--ease) both";
    setTimeout(() => {
        window.location.href = "../";
    }, 1000);
}

function alert(){
    setTimeout(() => {
        document.querySelector("#game").style.animation = "alert_filter 1.5s var(--easeinout) both";
    setTimeout(() => {
        if(score[0] >= 8-1){
            document.getElementById("alert_h").innerHTML = "<h2>Wygrana</h2>";
            console.log("chuj");
        }
        else{
            document.getElementById("alert_h").innerHTML = "<h2>Przegrana</h2>";
        }
        document.querySelector("#alert").style.animation = "fade 1s var(--easeinout) both reverse";
        document.querySelector("#alert").style.display = "flex";
        }, 1250);      
    }, 500);
    console.log("Wynik: " + score[0] + ", " + score[1]);
}

check_nick();
playernickname();
score_check();
fade();
clock();
for(let i = 0; i < 2; i++){
    score_add1.addEventListener("click", add1);
    score_add2.addEventListener("click", add2);
}
alert_button.addEventListener("click", back);