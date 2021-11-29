const submit_button = document.querySelector("#submit_button");
const arrow_button = document.querySelectorAll(".arrow_button");
const menu_button = document.querySelector("#menu_button");
let nickname = document.getElementById("nick").value;
let wizyta;
let j = 0;

function fade(){
    if(localStorage.getItem("wizyta") == null){
        document.body.style.animation = "fade 1s var(--ease) both reverse";
        document.body.style.display = "block";
        setTimeout(() => {
            document.body.style.animation = "none";
        }, 1000);
    }
    else{
        document.body.style.display = "block";
        document.getElementById("submit-page").style.display = "none";
        document.getElementById("landing-page").style.animation = "fade 1s var(--ease) both reverse";
        document.getElementById("landing-page").style.display = "flex";
    }
}

function checkname(){
    nickname = document.getElementById("nick").value;
    if(nickname !== ""){
        localStorage.setItem("nick", nickname);
        document.getElementById("welcoming").innerHTML = "Witaj, " + nickname + "!";
    }
    else{
        localStorage.setItem("nick", "username");
        document.getElementById("welcoming").innerHTML = "Witaj, username!";
    }
}

function fresh(){
    if(localStorage.getItem("wizyta") == 1)
    checkname();
};

function playernickname(){
    checkname();
    localStorage.setItem("wizyta", "1");
};

function display_submit(){
    document.getElementById("submit-page").classList.add("fade");
    setTimeout(() => {
        document.getElementById("submit-page").style.position = "absolute";
    }, 1000);
    setTimeout(() => {
        document.getElementById("landing-page").style.display = "flex";
        document.getElementById("landing-page").classList.add("rfade");
        document.getElementById("submit-page").style.display = "none";
    }, 1000);
};

function swap(){
    document.getElementById("menu_button").style.animation = "afade 1s var(--easeinout) both";
    setTimeout(() => {
        if(j !== 0){
            document.getElementById("box_h").innerHTML = "<h2>Start</h2>";
            document.getElementById("box_text").innerHTML = "<p>WarcApp to platforma dla każdego, kto chce zagrać w warcaby online</p>";
            document.getElementById("menu_button").innerHTML = "<span>Start</span>";
            j = 0;
        }
        else{
            document.getElementById("box_h").innerHTML = "<h2>O grze</h2>";
            document.getElementById("box_text").innerHTML = "<p>Warcaby to gra planszowa z XII wieku. Autorem strony jest Przemysław Szymański</p>";
            document.getElementById("menu_button").innerHTML = "<span>Więcej</span>";
            j = 1;
        }
    }, 500);
    for(let i = 0; i < 3; i++){
        document.getElementsByClassName("box_animation")[i].style.animation = "afade 1s var(--easeinout) both";
        setTimeout(() => {
            document.getElementsByClassName("box_animation")[i].style.animation = "none";
        }, 1000);
    }
}

function link(){
    if(j !== 1){
        document.body.style.animation = "fade 1s var(--ease) both";
        setTimeout(() => {
            window.open("html/game.html", "_self");
            document.body.style.animation = "none";
            document.body.style.display = "none";
        }, 1000);
    }
    else{
        document.body.style.animation = "fade 1s var(--ease) both";
        setTimeout(() => {
            window.open("https://github.com/przemek3d/warcapp");
            document.body.style.animation = "none";
            document.body.style.display = "none";
        }, 1000);
        setTimeout(() => {
            document.body.style.display = "block";
        }, 1000);
        document.body.style.display = "block";
    }
}

fade();
submit_button.addEventListener("click", playernickname);
submit_button.addEventListener("click", display_submit);
for(let i = 0; i < 2; i++)arrow_button[i].addEventListener("click", swap);
menu_button.addEventListener("click", link);
fresh();
