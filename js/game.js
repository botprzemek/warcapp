// Checkers code in progress

const alert_button = document.querySelector("#alert_button");

function playernickname(){
    let nickname = localStorage.getItem("nick"); 
    document.getElementById("welcoming").innerHTML = "Sesja gracza: " + nickname;
};

function fade(){
    document.querySelector("body").style.animation = "fade 1s var(--ease) both reverse";
    setTimeout(() => {
        document.querySelector("body").style.animation = "none";
    }, 1000);
}

function back(){
    document.querySelector("body").style.animation = "fade 1s var(--ease) both";
    setTimeout(() => {
        window.location.href = "../";
    }, 1000);
}

function alert(){
    setTimeout(() => {
        document.querySelector("#game").style.animation = "alert_filter 1.5s var(--easeinout) both";
        setTimeout(() => {
            document.querySelector("#alert").style.animation = "fade 1s var(--easeinout) both reverse";
            document.querySelector("#alert").style.display = "flex";
        }, 1250);      
    }, 5000);
}

playernickname();
fade();
alert();
alert_button.addEventListener("click", back);