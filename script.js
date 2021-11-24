let button = document.getElementById("przycisk");
let nickname = document.getElementById("nick").value;
let wizyta;

function fresh(){
    if(localStorage.getItem("wizyta") == 1){
        document.getElementById("submit-page").style.display = "none";
    setTimeout(() => {
        document.getElementById("landing-page").classList.add("rfade");
        document.getElementById("landing-page").style.display = "flex";
    }, 1000);
    }
    if(nickname !== ""){
        localStorage.setItem("nick", nickname);
        document.getElementById("welcoming").innerHTML = "Witaj, " + nickname + "!";
    }
    else{
        localStorage.setItem("nick", "username");
        document.getElementById("welcoming").innerHTML = "Witaj, username!";
    }
};

function playernickname(){
    nickname = document.getElementById("nick").value;
    if(nickname !== ""){
        localStorage.setItem("nick", nickname);
        document.getElementById("welcoming").innerHTML = "Witaj, " + nickname + "!";
    }
    else{
        localStorage.setItem("nick", "username");
        document.getElementById("welcoming").innerHTML = "Witaj, username!";
    }

    localStorage.setItem("wizyta", "1");
};

function display(){
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

button.addEventListener("click", playernickname);
button.addEventListener("click", display);
fresh();