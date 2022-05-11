const socket = io();

const chat = document.getElementById("form");
var messages = document.getElementById("messages");
var input = document.getElementById("input");
var matrixSize = 5;
localUser = JSON.parse(localUser);

console.log(localUser);

socket.emit(
  "joinRoom",
  JSON.stringify({
    roomId: roomId,
    userData: localUser,
  })
);

socket.on("message", (message) => {
  console.log(message);
});

socket.on("someJoin", function (data) {
  //console.log("raw data:", data);
  let parsedData = JSON.parse(data);
  console.log("parsed data:", parsedData);
  document.querySelector("#viewerc").textContent = parsedData.viewers;
  document.querySelector("#player_name").textContent = parsedData.playerName;
  document.querySelector("#enemy_name").textContent = parsedData.enemyName;
});


//! Chat 

function sendBtnPressed() {
  console.log("megnyom");
  let input = $("#text");
  const message = input.val();
  if (message.length > 0) {
    socket.emit(
      "chatmsg",
      JSON.stringify({
        roomId: roomId,
        message: message,
        name: localUser.user_name,
      })
    );
    input.val("");
  }
}

let currentPlayer;

socket.on("alma", function (msg) {
  var item = document.createElement("li");
  var messages = document.getElementById("messages");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

//! Game section

var gameStarted = false;
var irany = true;
var pont = 0;
var fieldtype = {
  hajo: 0,
  viz: 1,
  hit: 2,
  miss: 3
};

var matrix = [];
var enemyMatrix= [];
var ships = {
  cirkalo: {
    hossz: 1,
    darab: 3,
    szin: "rgb(140, 140, 140)",
  },
  csatahajo: {
    hossz: 2,
    darab: 2,
    szin: "rgb(40, 40, 40)",
  },
  anyahajo: {
    hossz: 3,
    darab: 1,
    szin: "rgb(5, 5, 0)",
  },
};

// var userData = JSON.parse('<%- JSON.stringify(userData) %>');

//console.log( "userdata a parseolas utan", userData);

function reset() {
  renderEmptyMatrix(matrixSize);
  renderShips();
}

function changeDirection(iranyButton) {
  if (iranyButton.innerHTML == "Horizontal") {
    iranyButton.innerHTML = "Vertical";
    irany = false;
  } else {
    iranyButton.innerHTML = "Horizontal";
    irany = true;
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("shipName", ev.target.classList[0]);
  ev.dataTransfer.setData("shipId", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  let selectedShip = ships[ev.dataTransfer.getData("shipName")];
  // change divs in row
  let table = document.querySelector("#table");
  let pos = ev.target.getAttribute("name").split("_");
  //!TODO egymásra pakolás
  if (matrixSize - (parseInt(pos[1]) + selectedShip.hossz) >= 0) {
    for (let i = 0; i < selectedShip.hossz; i++) {
      if (ev.target.classList.contains("ship")) {
        return;
      }
      if (irany) {
        if (
          document
            .querySelector(
              "div[name='" + pos[0] + "_" + (parseInt(pos[1]) + i) + "']"
            )
            .classList.contains("ship")
        ) {
          return;
        }
      } else {
        if (
          document
            .querySelector(
              "div[name='" + (parseInt(pos[0]) + i) + "_" + pos[1] + "']"
            )
            .classList.contains("ship")
        ) {
          return;
        }
      }
    }
  }

  if (selectedShip.hossz == 1) {
    // 1 hosszu hajonal csak az aktlis kockat valtoztatjuk
    ev.target.classList.remove("water");
    ev.target.classList.add("ship");
    ev.target.style.backgroundColor = selectedShip.szin;
  } else {
    // ha hoszabb mint 1 akkor sorban a hossznyi diveket mind valtoztatjuk
    if (irany) {
      // vizszintes
      if (matrixSize - (parseInt(pos[1]) + selectedShip.hossz) >= 0) {
        for (let i = 0; i < selectedShip.hossz; i++) {
          document
            .querySelector(
              "div[name='" + pos[0] + "_" + (parseInt(pos[1]) + i) + "']"
            )
            .classList.remove("water");

          document
            .querySelector(
              "div[name='" + pos[0] + "_" + (parseInt(pos[1]) + i) + "']"
            )
            .classList.add("ship");

          document.querySelector(
            "div[name='" + pos[0] + "_" + (parseInt(pos[1]) + i) + "']"
          ).style.backgroundColor = selectedShip.szin;
        }
      } else {
        alert("Nincs eleg hely a táblán!");
        return;
      }
    } else {
      //fuggoleges
      if (matrixSize - (parseInt(pos[0]) + selectedShip.hossz) >= 0) {
        for (let i = 0; i < selectedShip.hossz; i++) {
          document
            .querySelector(
              "div[name='" + (parseInt(pos[0]) + i) + "_" + pos[1] + "']"
            )
            .classList.remove("water");

          document
            .querySelector(
              "div[name='" + (parseInt(pos[0]) + i) + "_" + pos[1] + "']"
            )
            .classList.add("ship");

          document.querySelector(
            "div[name='" + (parseInt(pos[0]) + i) + "_" + pos[1] + "']"
          ).style.backgroundColor = selectedShip.szin;
        }
      } else {
        alert("Nincs eleg hely a táblán!");
        return;
      }
    }
  }

  // eredeti hajo torlese a hajok matrixbol
  let shipToDelete = document.querySelector(
    "#" + ev.dataTransfer.getData("shipId")
  );
  shipToDelete.parentNode.removeChild(shipToDelete);
}

function renderEmptyMatrix(size) {
  var table = document.querySelector("#table");

  //clear matrix
  table.querySelectorAll("*").forEach((n) => n.remove());

  for (var i = 0; i < size; i++) {
    var trElement = document.createElement("tr");
    for (var j = 0; j < size; j++) {
      var tdElement = document.createElement("td");
      var divElement = document.createElement("div");
      divElement.style.width = "100px";
      divElement.style.height = "100px";
      divElement.setAttribute("name", i + "_" + j);
      divElement.setAttribute("onclick", "show(this);");
      divElement.classList.add("water");
      divElement.setAttribute("onDrop", "drop(event)");
      divElement.setAttribute("onDragover", "allowDrop(event)");
      tdElement.appendChild(divElement);
      trElement.appendChild(tdElement);
    }
    table.appendChild(trElement);
  }
}

function generateMatrix() {
  var table = document.querySelector("#table");
  let localMatrix = [];

  for (var i = 0, row; (row = table.rows[i]); i++) {
    let matrixRow = [];
    for (var j = 0, col; (col = row.cells[j]); j++) {
      if (col.children[0].classList.contains("water")) {
        matrixRow.push(fieldtype.viz);
      } else if (col.children[0].classList.contains("ship")) {
        matrixRow.push(fieldtype.hajo);
      } else {
        console.log("nem lehetett az adott mezo parsolni!!!!");
      }
    }
    localMatrix.push(matrixRow);
  }
  console.log("matrix: " + localMatrix);
  return localMatrix;
}

function renderShips() {
  let table = document.getElementById("ships");

  table.querySelectorAll("*").forEach((n) => n.remove());

  for (let ship in ships) {
    let selectedShip = ships[ship];
    for (let db = 0; db < selectedShip.darab; db++) {
      let tr = document.createElement("tr");
      let td = document.createElement("td");
      let outterDiv = document.createElement("div");
      outterDiv.classList.add(ship);
      outterDiv.setAttribute("draggable", "true");
      outterDiv.setAttribute("ondragstart", "drag(event)");
      outterDiv.id = ship + db;
      for (let hossz = 0; hossz < selectedShip.hossz; hossz++) {
        let div = document.createElement("div");
        div.style.backgroundColor = selectedShip.szin;
        div.style.border = "3px solid black";
        div.style.boxShadow = "0 0 10px black";
        div.style.width = "100px";
        div.style.height = "100px";
        div.style.display = "inline-block";
        div.style.borderRadius = "100px 0px 100px 0px";
        outterDiv.appendChild(div);
      }
      td.appendChild(outterDiv);
      tr.appendChild(td);
      table.appendChild(tr);
    }
  }
}

function call() {
  // ellenorzes: osszes hajot elhelyezte-e
  let allShipsPlaced = $("#ships td:not(:empty)").length === 0;

  if (allShipsPlaced) {
    clearInterval(timerVariable);
    startPressed();
  }
  // timer();
}

function startPressed() {
  socket.emit(
    "mp_gamestart",
    JSON.stringify({
      roomId: roomId,
      userId: localUser.idlogin_user,
      team: localUser.team,
      matrix: generateMatrix(),
      size: matrixSize,
    })
  );
  $("#startbutton").hide();
  $("#resetButton").hide();
  $("#iranyButton").hide();
  $("#enemyTable").show();
  $("#player_scores").text(pont);
  $("#enemy_scores").text(pont);
}

function renderMatrix(matrix, enemyMatrix, spectate) {

  if(!spectate){
    var table = document.querySelector("#table");
    var enemytable = document.querySelector("#enemyTable");

    //clear matrix
    table.querySelectorAll("*").forEach((n) => n.remove());
    enemytable.querySelectorAll("*").forEach((n) => n.remove());
    for (var i = 0; i < matrix.length; i++) {
      var trElement = document.createElement("tr");
      for (var j = 0; j < matrix[i].length; j++) {
        var tdElement = document.createElement("td");
        var divElement = document.createElement("div");

        divElement.style.width = "100px";
        divElement.style.height = "100px";
        divElement.setAttribute("name", i + "_" + j);
        //divElement.setAttribute("onclick", "show(this);");
        if (matrix[i][j] == fieldtype.viz) {
          //divElement.style.backgroundColor = 'blue';
          divElement.classList.add("water");
          //divElement.classList.add(overlay);
        } else if (matrix[i][j] == fieldtype.hajo) {
          divElement.classList.add("ships");
          //divElement.style.backgroundColor = "green";
        } else if (matrix[i][j] == fieldtype.hit) {
          divElement.classList.add("hit");
        }else if (matrix[i][j] == fieldtype.miss) {
          divElement.classList.add("miss");
        }
        tdElement.appendChild(divElement);
        trElement.appendChild(tdElement);
      }
      table.appendChild(trElement);
    }
    // ezt rendereli az enemy matrixot vagyis a CPU matrixot
    //console.log("enemyMatrix: " + enemyMatrix);
    for (var i = 0; i < enemyMatrix.length; i++) {
      var trElement = document.createElement("tr");
      for (var j = 0; j < enemyMatrix[i].length; j++) {
        var tdElement = document.createElement("td");
        var divElement = document.createElement("div");

        divElement.style.width = "100px";
        divElement.style.height = "100px";
        divElement.setAttribute("name", i + "_" + j);
        divElement.setAttribute("class", "enemy_matrix");
        divElement.setAttribute("onclick", "show(this);");
        if (
          enemyMatrix[i][j] == fieldtype.viz ||
          enemyMatrix[i][j] == fieldtype.hajo
        ) {
          //divElement.style.backgroundColor = 'blue';
          divElement.classList.add("water");
          //divElement.classList.add(overlay);
        } else if (enemyMatrix[i][j] == fieldtype.hit) {
          divElement.classList.add("hit");
        }else if (enemyMatrix[i][j] == fieldtype.miss) {
          divElement.classList.add("miss");
        }
        tdElement.appendChild(divElement);
        trElement.appendChild(tdElement);
      }
      enemyTable.appendChild(trElement);
    }
  } else {
    var table = document.querySelector("#table");
    var enemytable = document.querySelector("#enemyTable");

    //clear matrix
    table.querySelectorAll("*").forEach((n) => n.remove());
    enemytable.querySelectorAll("*").forEach((n) => n.remove());
    for (var i = 0; i < matrix.length; i++) {
      var trElement = document.createElement("tr");
      for (var j = 0; j < matrix[i].length; j++) {
        var tdElement = document.createElement("td");
        var divElement = document.createElement("div");

        divElement.style.width = "100px";
        divElement.style.height = "100px";
        divElement.setAttribute("name", i + "_" + j);
        //divElement.setAttribute("onclick", "show(this);");
        if (matrix[i][j] == fieldtype.viz) {
          //divElement.style.backgroundColor = 'blue';
          divElement.classList.add("water");
          //divElement.classList.add(overlay);
        } else if (matrix[i][j] == fieldtype.hajo) {
          divElement.classList.add("ships");
          //divElement.style.backgroundColor = "green";
        } else if (matrix[i][j] == fieldtype.hit) {
          divElement.classList.add("hit");
        }else if (matrix[i][j] == fieldtype.miss) {
          divElement.classList.add("miss");
        }
        tdElement.appendChild(divElement);
        trElement.appendChild(tdElement);
      }
      table.appendChild(trElement);
    }
    // ezt rendereli az enemy matrixot vagyis a CPU matrixot
    //console.log("enemyMatrix: " + enemyMatrix);
    for (var i = 0; i < enemyMatrix.length; i++) {
      var trElement = document.createElement("tr");
      for (var j = 0; j < enemyMatrix[i].length; j++) {
        var tdElement = document.createElement("td");
        var divElement = document.createElement("div");

        divElement.style.width = "100px";
        divElement.style.height = "100px";
        divElement.setAttribute("name", i + "_" + j);
        divElement.setAttribute("class", "enemy_matrix");
        divElement.setAttribute("onclick", "show(this);");
        if (
          enemyMatrix[i][j] == fieldtype.viz 
        ) {
          //divElement.style.backgroundColor = 'blue';
          divElement.classList.add("water");
          //divElement.classList.add(overlay);
        } else if (enemyMatrix[i][j] == fieldtype.hajo) {
          divElement.classList.add("ships");
        } else if (enemyMatrix[i][j] == fieldtype.hit) {
          divElement.classList.add("hit");
        }else if (enemyMatrix[i][j] == fieldtype.miss) {
          divElement.classList.add("miss");
        }
        tdElement.appendChild(divElement);
        trElement.appendChild(tdElement);
      }
      enemyTable.appendChild(trElement);
    }
  }
}




function show(x) {
  console.log(
    "current player: " + currentPlayer + " local: " + localUser.user_name
  );
  if (x.classList.contains(`enemy_matrix`)) {
    if (gameStarted && currentPlayer.user_name === localUser.user_name) {
      var adat = JSON.stringify({
        pos: x.getAttribute("name"),
        roomId: roomId,
        team: localUser.team,
      });
      socket.emit("mp_kuld", adat);
    }
  } else {
    //alert("sajat matrixodra kattints!!!!");
  }
}

socket.on("mp_wrong", (Data) => {
  alert(Data);
});

socket.on("mp_gameover", (adat) => {
  gameStarted = false;
  clearInterval(timerVariable);
  $("#startbutton").show();
  $("#resetButton").show();
  $("#iranyButton").show();
  alert(adat ? "gyoztel" : "vesztettel");
});

socket.on("mp_matrix", (matrix_) => {
  console.log(gameStarted);
  if (!gameStarted)
  {
    timer();
  }
  gameStarted = true;
  $("#startbutton").hide();

  matrix = JSON.parse(matrix_).matrix;
  enemyMatrix = JSON.parse(matrix_).enemyMatrix;
  player_scores = JSON.parse(matrix_).player_scores;
  enemy_scores = JSON.parse(matrix_).enemy_scores;
  currentPlayer = JSON.parse(matrix_).currentPlayer;
  // console.log("currentplayer: " + currentPlayer);
  console.log("rawdata: ");
  console.log(JSON.parse(matrix_));

  $("#player_scores").text(player_scores);
  $("#enemy_scores").text(enemy_scores);
  if(localUser.team === "player"){
    renderMatrix(matrix, enemyMatrix, false);
  } else if(localUser.team === "enemy"){
    renderMatrix(enemyMatrix, matrix, false);
  } else if(localUser.team === "viewer"){
    renderMatrix(matrix, enemyMatrix, true);
  }
});

socket.on('someLeave', (adat) => {
  console.log("asudcbaopsuidcbpasiduc");
  alert('Az ellenfel kilepett!!!');
});

var timerVariable;
function timer() {
  var minutes = 3;
  var seconds = 15;
  timerVariable = setInterval(function () {
    seconds--;
    if (seconds < 0) {
      minutes--;
      seconds = 59;
    }
    if (minutes < 0) {
      clearInterval(timerVariable);
      gameStarted = false;
      socket.emit("mp_gameoverTimer", roomId);
    }

    document.getElementById("timer").innerHTML =
      minutes + "m " + seconds + "s ";
  }, 1000);
}

$(window).on('load', function() {
  console.log("asdasdasdasdasd");
  if(localUser.team !== "viewer"){
  renderEmptyMatrix(matrixSize);
  renderShips();
  }
});