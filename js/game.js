// Checkers code in progress

const alert_button = document.querySelector("#alert_button");
const score_add1 = document.querySelector("#you");
const score_add2 = document.querySelector("#ene");
const score_select = document.getElementById("score_box_select");
const board = document.getElementById("board");
const box_id = 'ABCDEFGH'.split('');
let nickname = localStorage.getItem("nick");
let score = [0, 0];
let cells_id = [];
let p1_click = 0;
let p2_click = 0;
let turn = 0;
let p1 = 0;
let p2 = 0;

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
    }
}

function fade(){
    document.body.style.animation = "fade 1s var(--ease) both reverse";
    document.body.style.display = "block";
    setTimeout(() => {
        document.body.style.animation = "none";
    }, 1000);
}

function cells_add(){
    for(let j = 8; j > 0; j--){
        for(let i = 0; i < 8; i++){
            let cell_id = box_id[i]+"_"+(j);
            const cell = document.createElement("div");
            board.appendChild(cell);
            if(j%2==0 && i%2!==0 || j%2!==0 && i%2==0){
                cell.className = "board_box box_select box_transparent";
                cell.id = cell_id;
            }
            else{
                cell.className = "board_box box_white";
                cell.id = cell_id;
            }
            cells_id.push(cell_id);
        }
    }
}

function checker_add(){
    for(let i = 0; i < 8; i++){
        let checker_black = document.createElement("div");
        checker_black.className = "checker_black";
        box[i].appendChild(checker_black);
        box[i].classList.add("cell_black");
    }
    for(let i = 24; i < 32; i++){
        let checker_white = document.createElement("div");
        checker_white.className = "checker_white";
        box[i].appendChild(checker_white);
        box[i].classList.add("cell_white");
    }
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
    }
}

function move_white(){
    p2_click = 0;
    p2 = 0;
    turn = 0;
    score_select.style.animation = "afade 0.5s var(--easeinout) both";
    setTimeout(() => {
        score_select.innerHTML = "Wybrane pole: ##";
    }, 250);
    setTimeout(() => {
        score_select.style.animation = "none";
    }, 250);
    console.log(p1 + ", " + turn + ", " + p1_click);
    if(turn == 1){
        p1_click = 0;
        p1 = 0;  
        return;
    }
    p2_click = 0;
    p2 = 0;
    turn = 0;
    let checker_id = this.id;
    let checker_column = checker_id.substr(0,1);
    let checker_row = parseInt(checker_id.substr(2,3));
    let column_number = checker_column.charCodeAt(0) - 64;
    let checker_up = checker_row+1;
    let checker_left = column_number-1;
    let checker_right = column_number+1;
    let checker_left_id = String.fromCharCode(64 + checker_left) + "_" + checker_up;
    let checker_right_id = String.fromCharCode(64 + checker_right) + "_" + checker_up;

    if(p1_click == 0){
        this.style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
        this.style.cursor = "pointer";
        for(let i = 0; i < box.length; i++){   
            box[i].classList.remove("box_select");
        }
        for(let i = 0; i < cell_white.length; i++){   
            cell_white[i].style.cursor = "pointer";
        }
        score_select.style.animation = "afade 0.5s var(--easeinout) both";
        setTimeout(() => {
            score_select.innerHTML = "Wybrane pole: " + checker_column + checker_row;
        }, 250);
        setTimeout(() => {
            score_select.style.animation = "none";
        }, 500);
        p1_click++;
        p1 = 0;  
    }

    else if(p1_click == 1){
        for(let i = 0; i < box.length; i++){   
            box[i].classList.remove("box_select");
            box[i].style.animation = "none";
            this.style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
        }
        for(let i = 0; i < cell_white.length; i++){   
            cell_white[i].style.cursor = "pointer";
        }
        score_select.style.animation = "afade 0.5s var(--easeinout) both";
        setTimeout(() => {
            score_select.innerHTML = "Wybrane pole: " + checker_column + checker_row;
        }, 250);
        setTimeout(() => {
            score_select.style.animation = "none";
        }, 500);
        p1 = 0;  
    }

    console.log(p1 + ", " + turn + ", " + p1_click)
    function move_check_white_left() {
        if (p1 == 1)return;
        let checker_parent = document.querySelector("#"+checker_id);
        if (document.getElementById(checker_left_id).firstChild == null){
            console.log("Ruch #1 na: " + String.fromCharCode(64 + checker_left) + "_" + checker_up);
            let new_checker_white = document.createElement("div");
            new_checker_white.className = "checker_white checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_left_id).appendChild(new_checker_white);
                document.getElementById(checker_left_id).classList.add("cell_white");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_white");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p1++;
        console.log(p1 + ", " + turn + ", " + p1_click)
    }

    function move_check_white_right() {
        if (p1 == 1)return;
        let checker_parent = document.getElementById(checker_id);
        if (document.getElementById(checker_right_id).firstChild == null){
            console.log("Ruch #2 na: " + String.fromCharCode(64 + checker_right) + "_" + checker_up);
            let new_checker_white = document.createElement("div");
            new_checker_white.className = "checker_white checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_right_id).appendChild(new_checker_white);
                document.getElementById(checker_right_id).classList.add("cell_white");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_white");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p1++;
        console.log(p1 + ", " + turn + ", " + p1_click)
    }

    function move_check_white_left_wall() {
        if (p1 == 1)return;
        let checker_check = document.querySelector(".checker_move");
        let checker_parent = document.querySelector("#"+checker_id);
        let left_check = document.getElementById(checker_left_id).contains(checker_check);
        if(left_check !== "true"){
            console.log("Ruch #1 na: " + String.fromCharCode(64 + checker_left) + "_" + checker_up);
            let new_checker_white = document.createElement("div");
            new_checker_white.className = "checker_white checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_left_id).appendChild(new_checker_white);
                document.getElementById(checker_left_id).classList.add("cell_white");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_white");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p1++;
        console.log(p1 + ", " + turn + ", " + p1_click)
    }

    function move_check_white_right_wall() {
        if (p1 == 1)return;
        let checker_check = document.querySelector(".checker_move");
        let checker_parent = document.getElementById(checker_id);
        let right_check = document.getElementById(checker_right_id).contains(checker_check);
        if(right_check !== "true"){
            console.log("Ruch #2 na: " + String.fromCharCode(64 + checker_right) + "_" + checker_up);
            let new_checker_white = document.createElement("div");
            new_checker_white.className = "checker_white checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_right_id).appendChild(new_checker_white);
                document.getElementById(checker_right_id).classList.add("cell_white");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_white");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p1++;
        console.log(p1 + ", " + turn + ", " + p1_click)
    }

    console.log("Klikasz na: " + checker_column + "_" + checker_row);
    if(column_number == 1){
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_right_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_right_id).style.cursor = "pointer";
        }
        document.getElementById(checker_right_id).addEventListener("click", move_check_white_right_wall);
    }
    else if(column_number == 8){
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_left_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_left_id).style.cursor = "pointer";
        }
        document.getElementById(checker_left_id).addEventListener("click", move_check_white_left_wall);
    }
    else{
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_left_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_right_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_left_id).style.cursor = "pointer";
            document.getElementById(checker_right_id).style.cursor = "pointer";
        }
        document.getElementById(checker_left_id).addEventListener("click", move_check_white_left);
        document.getElementById(checker_right_id).addEventListener("click", move_check_white_right);
    }
    console.log(p1 + ", " + turn + ", " + p1_click);
    document.title = "WarcApp | W grze";
}

function move_black(){
    p1_click = 0;
    p1 = 0;
    turn = 0;
    score_select.style.animation = "afade 0.5s var(--easeinout) both";
    setTimeout(() => {
        score_select.innerHTML = "Wybrane pole: ##";
    }, 250);
    setTimeout(() => {
        score_select.style.animation = "none";
    }, 250);
    console.log(p1 + ", " + turn + ", " + p1_click);
    if(turn == 1){
        p2_click = 0;
        p2 = 0;  
        return;
    }
    p2_click = 0;
    p2 = 0;
    turn = 0;
    let checker_id = this.id;
    let checker_column = checker_id.substr(0,1);
    let checker_row = parseInt(checker_id.substr(2,3));
    let column_number = checker_column.charCodeAt(0) - 64;
    let checker_up = checker_row-1;
    let checker_left = column_number+1;
    let checker_right = column_number-1;
    let checker_left_id = String.fromCharCode(64 + checker_left) + "_" + checker_up;
    let checker_right_id = String.fromCharCode(64 + checker_right) + "_" + checker_up;

    if(p2_click == 0){
        this.style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
        this.style.cursor = "pointer";
        for(let i = 0; i < box.length; i++){   
            box[i].classList.remove("box_select");
        }
        for(let i = 0; i < cell_black.length; i++){   
            cell_black[i].style.cursor = "pointer";
        }
        score_select.style.animation = "afade 0.5s var(--easeinout) both";
        setTimeout(() => {
            score_select.innerHTML = "Wybrane pole: " + checker_column + checker_row;
        }, 250);
        setTimeout(() => {
            score_select.style.animation = "none";
        }, 500);
        p2_click++;
        p2 = 0;  
    }

    else if(p2_click == 1){
        for(let i = 0; i < box.length; i++){   
            box[i].classList.remove("box_select");
            box[i].style.animation = "none";
            this.style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
        }
        for(let i = 0; i < cell_black.length; i++){   
            cell_black[i].style.cursor = "pointer";
        }
        score_select.style.animation = "afade 0.5s var(--easeinout) both";
        setTimeout(() => {
            score_select.innerHTML = "Wybrane pole: " + checker_column + checker_row;
        }, 250);
        setTimeout(() => {
            score_select.style.animation = "none";
        }, 500);
        p2 = 0;  
    }

    console.log(p2 + ", " + turn + ", " + p2_click)
    function move_check_black_left() {
        if (p2 == 1)return;
        let checker_parent = document.querySelector("#"+checker_id);
        if (document.getElementById(checker_left_id).firstChild == null){
            console.log("Ruch #1 na: " + String.fromCharCode(64 + checker_left) + "_" + checker_up);
            let new_checker_black = document.createElement("div");
            new_checker_black.className = "checker_black checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_left_id).appendChild(new_checker_black);
                document.getElementById(checker_left_id).classList.add("cell_black");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_black");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p2++;
        console.log(p2 + ", " + turn + ", " + p2_click)
    }

    function move_check_black_right() {
        if (p2 == 1)return;
        let checker_parent = document.getElementById(checker_id);
        if (document.getElementById(checker_right_id).firstChild == null){
            console.log("Ruch #2 na: " + String.fromCharCode(64 + checker_right) + "_" + checker_up);
            let new_checker_black = document.createElement("div");
            new_checker_black.className = "checker_black checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_right_id).appendChild(new_checker_black);
                document.getElementById(checker_right_id).classList.add("cell_black");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_black");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p2++;
        console.log(p2 + ", " + turn + ", " + p2_click)
    }

    function move_check_black_left_wall() {
        if (p2 == 1)return;
        let checker_check = document.querySelector(".checker_move");
        let checker_parent = document.querySelector("#"+checker_id);
        let left_check = document.getElementById(checker_left_id).contains(checker_check);
        if(left_check !== "true"){
            console.log("Ruch #1 na: " + String.fromCharCode(64 + checker_left) + "_" + checker_up);
            let new_checker_black = document.createElement("div");
            new_checker_black.className = "checker_black checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_left_id).appendChild(new_checker_black);
                document.getElementById(checker_left_id).classList.add("cell_black");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_left_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_black");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p2++;
        console.log(p2 + ", " + turn + ", " + p2_click)
    }

    function move_check_black_right_wall() {
        if (p2 == 1)return;
        let checker_check = document.querySelector(".checker_move");
        let checker_parent = document.getElementById(checker_id);
        let right_check = document.getElementById(checker_right_id).contains(checker_check);
        if(right_check !== "true"){
            console.log("Ruch #2 na: " + String.fromCharCode(64 + checker_right) + "_" + checker_up);
            let new_checker_black = document.createElement("div");
            new_checker_black.className = "checker_black checker_move";
            for(let i = 0; i < box.length; i++){
                document.getElementById(checker_right_id).appendChild(new_checker_black);
                document.getElementById(checker_right_id).classList.add("cell_black");
            }
            while (checker_parent.firstChild) {
                checker_parent.removeChild(checker_parent.firstChild);
                document.getElementById(checker_right_id).style.animation = "none";
                checker_parent.style.animation = "none";
                checker_parent.classList.remove("cell_black");
                score_select.style.animation = "afade 0.5s var(--easeinout) both";
                setTimeout(() => {
                    score_select.innerHTML = "Tura przeciwnika";
                }, 250);
            }
            turn++;
        }
        else{
            console.log("Nie możesz się ruszyć!");
        }
        p2++;
        console.log(p2 + ", " + turn + ", " + p2_click)
    }

    console.log("Klikasz na: " + checker_column + "_" + checker_row);
    if(column_number == 1){
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_right_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_right_id).style.cursor = "pointer";
        }
        document.getElementById(checker_right_id).addEventListener("click", move_check_black_right_wall);
    }
    else if(column_number == 8){
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_left_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_left_id).style.cursor = "pointer";
        }
        document.getElementById(checker_left_id).addEventListener("click", move_check_black_left_wall);
    }
    else{
        for(let i = 0; i < box.length; i++){  
            document.getElementById(checker_left_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_right_id).style.animation = "board_box infinite var(--easeinout) 1s 200ms both";
            document.getElementById(checker_left_id).style.cursor = "pointer";
            document.getElementById(checker_right_id).style.cursor = "pointer";
        }
        document.getElementById(checker_left_id).addEventListener("click", move_check_black_left);
        document.getElementById(checker_right_id).addEventListener("click", move_check_black_right);
    }
    console.log(p2 + ", " + turn + ", " + p2_click);
    document.title = "WarcApp | W grze";
}

function refresh(){
    document.title = "WarcApp | Wykonaj ruch";
    return;
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
        document.querySelector("#score_buttons").style.animation = "alert_filter 1.5s var(--easeinout) both";
    setTimeout(() => {
        if(score[0] > 8-1){
            document.getElementById("alert_h").innerHTML = "<h2>Wygrana</h2>";
        }
        else{
            document.getElementById("alert_h").innerHTML = "<h2>Przegrana</h2>";
        }
        document.querySelector("#alert").style.animation = "fade 1s var(--easeinout) both reverse";
        document.querySelector("#alert").style.display = "flex";
        }, 1250);      
    }, 500);
}

fade();
check_nick();
playernickname();
score_check();
clock();
cells_add();
const box = document.getElementsByClassName("box_transparent");
checker_add();
const cell_white = document.getElementsByClassName("cell_white");
const cell_black = document.getElementsByClassName("cell_black");
for(let i = 0; i < 8; i++){
    score_add1.addEventListener("click", add1);
    score_add2.addEventListener("click", add2);
    cell_white[i].addEventListener("click", move_white);
    cell_black[i].addEventListener("click", move_black);
    cell_white[i].addEventListener("click", refresh);
    cell_black[i].addEventListener("click", refresh);
}
alert_button.addEventListener("click", back);