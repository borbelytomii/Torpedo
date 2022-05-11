//component
const path = require("path");
const http = require("http");
const mysql = require("mysql");
const express = require("express");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const bodyParser = require("body-parser");
const session = require("express-session");
//const $ = require( "jquery" );
//let ejs = require('ejs');
app.set("view engine", "ejs");
const util = require("util");

// Bcrypt
const saltRounds = 10;
const bcrypt = require("bcrypt");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { EDESTADDRREQ } = require("constants");
const { parse } = require("path");
const { match } = require("assert");
const { json } = require("body-parser");
//const { map } = require("jquery");
//const { data } = require('jquery');
// const { get } = require('jquery');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//! Home folder
app.use(express.static(path.join(__dirname, "index")));

//! MySQL connection

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "test",
  password: "jelszavasvagyok1234",
  database: "game_database",
});

//! Database connection
con.connect(function (err) {
  if (err) return console.log(err);
  console.log("Connected to mysql");
});

//! Session

app.use(
  session({
    secret: "madethesessionwork",
    resave: false,
    saveUninitialized: false,
  })
);
let singleplayerRooms = new Map();
//! Routing
//returns a promise that resolves to a result set on success

//! homepage
app.get("/", (req, res, next) => {
  con.query("select * from test;", (err, result) => {
    if (err) throw err;

    let regisztraltCount = result[0].db;
    //let playedgames = result[1].db;
    let gameCount = result[1].db;
    let allWins = result[2].db;
    let allLost = result[3].db;
    let draws = result[4].db;
    let shipshit = result[5].db;

    return res.render(__dirname + "/index/views/index.ejs", {
      page_name: "home",
      userData: req.session.userData,
      regCount: regisztraltCount,
      playedgames: gameCount,
      wins: allWins,
      lost: allLost,
      hitedships: shipshit,
      draws: draws,
    });
  });
});

//! Rooms

app.get("/multiplayer", (req, res) => {
  if (req.session.userData) {
    return res.render(__dirname + "/index/views/rooms.ejs", {
      page_name: "multiplayer",
      userData: req.session.userData,
      error: ""
    });
  } else {
    return res.render(__dirname + "/index/views/login.ejs", {
      page_name: "login",
    });
  }

  // return res.render(__dirname + '/index/rooms.ejs', { page_name: 'multiplayer', userData: req.session.userData })
});

//! Multiplayer

/* app.get('/multiplayer', (req, res) => {
  return res.render(__dirname + '/index/multiplayer.ejs', { page_name: 'multiplayer', isLoggedIn: req.session.isLoggedIn });
}); */
var viewer = 0;
var rooms = [];
var viewersarrays = new Map();
let M = new Map();
let players = {};

app.post("/deleteUser", (req, res) => {
  let user = req.session.userData;
  console.log(user);
  con.query("delete from login_user where idlogin_user = ?;", [user.idlogin_user], (err, result) => {
    if (err) console.log(err);

    req.session.destroy();
    return res.redirect("/");
  })
})

//! CreateRoom
app.post("/createRoom", (req, res) => {
  let roomId = req.body.roomNumber;
  let viewer = req.body.viewer;
  let generatedRoomId = 0;
  let userData = req.session.userData;
  userData["team"] = "player";

  //console.log("viewer szama: ", viewer);
  if (roomId == "") {
    // addig general amig ujat general
    do {
      var rnd = Math.floor(Math.random() * 99999) + 10000;
      generatedRoomId = rnd;

      //console.log("GeneratedId in do while: " + generatedRoomId);
      //var n = rnd.toString();
      //rooms+=n;
      rooms += generatedRoomId;
    } while (!rooms.includes(generatedRoomId));
    //console.log("jelenlegi szobak: " + rooms);
    //viewersarrays.set(generatedRoomId, {});
    //viewersarrays[generatedRoomId]['viewersCount'] = 0;

    //viewersarrays[generatedRoomId].userData = userData;

    if (viewersarrays.has(generatedRoomId)) {
      let temp = viewersarrays.get(generatedRoomId);
      temp.append(userData);
      temp.append({ viewersCount: 0 });
      temp.append({ readyCount: 0 });
      viewersarrays.set(generatedRoomId, temp);
    } else {
      viewersarrays.set(generatedRoomId, {
        userData: userData,
        viewersCount: 0,
        readyCount: 0,
      });
    }

    if (viewer) {
      viewersarrays[generatedRoomId].viewersCount++;
      userData["team"] = "viewer";
    }

    console.log("viewersarrays: ", viewersarrays);

    console.log(
      "------ generatedroomid\n" +
        util.inspect(viewersarrays.get(generatedRoomId)),
      { depth: null }
    );

    return res.render(__dirname + "/index/views/multiplayer.ejs", {
      page_name: "multiplayer",
      roomId: generatedRoomId,
      userData: req.session.userData,
      playerName: viewersarrays.get(generatedRoomId).userData.user_name,
      enemyName: "enemy",
      viewer: viewersarrays.get(generatedRoomId).viewersCount,
    });
  } // roomId != ""
  else {
    userData["team"] = "enemy";
    if (rooms.includes(parseInt(roomId))) {
      if (viewer) {
        //console.log('viewers noveles elott:', viewersarrays[roomId]);
        viewersarrays.get(parseInt(roomId)).viewersCount++;
        //console.log('viewers noveles utan:', viewersarrays[roomId]);

        userData["team"] = "viewer";
      } else {

        if (viewersarrays.has(parseInt(roomId))) {
          let temp ={};
          //let temp2 = viewersarrays.get(parseInt(roomId));
          temp = viewersarrays.get(parseInt(roomId));
          console.log("Temporary data: "+JSON.stringify(temp));
          temp["enemy"] = userData;
          console.log("Temporary data2: "+JSON.stringify(temp));
          //temp.push(userData);
          viewersarrays.set(parseInt(roomId), temp);
        } else {
          viewersarrays.set(parseInt(roomId), [userData]);
        }
      }

      //console.log("hiba----\n" + viewersarrays.get(roomId));
      let enemyname = "enemy";
      if(viewersarrays.get(parseInt(roomId)).enemy !== undefined){
        enemyname = viewersarrays.get(parseInt(roomId)).enemy.user_name;
      }

      return res.render(__dirname + "/index/views/multiplayer.ejs", {
        page_name: "multiplayer",
        roomId: roomId,
        userData: req.session.userData,
        playerName: viewersarrays.get(parseInt(roomId)).userData.user_name,
        enemyName:enemyname,
        viewer: viewersarrays.get(parseInt(roomId)).viewersCount,
      });
    }
    else {
      return res.render(__dirname + "/index/views/rooms.ejs", {
        page_name: "multiplayer",
        userData: req.session.userData,
        error: "Nem letezo szobat adtal meg!"
      });
    }
  }
});

app.get("/createRoom", function (req, res) {
  if (req.session.userData) {
    //console.log(userData+"user adatok");
    return res.render(__dirname + "/index/views/multiplayer.ejs", {
      page_name: "multiplayer",
      userData: req.session.userData,
    });
  } else {
    return res.render(__dirname + "/index/views/login.ejs", {
      page_name: "login",
    });
  }
});

//! Login form
app.get("/login", (req, res) => {
  if (req.session.user) {
    //res.send({ loggedIn: true, user: req.session.user });
    //res.sendFile(__dirname + "/index/views/index.html");
    //console.log(req.session.user);
    /*     return res.render(__dirname + "/index/views/index.ejs", {
          page_name: "home",
          userData: req.session.userData,
          regCount: 
        }); */
    return res.redirect("/");
  } else {
    //res.send({ loggedIn: false });
    //throw new Error('tesz hiba hellooooo');
    return res.render(__dirname + "/index/views/login.ejs", {
      page_name: "login",
    });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.log_username;
  const password = req.body.log_password;

  //console.log(username + "\t" + password);

  con.query(
    "SELECT * FROM login_user WHERE user_name = ?;",
    username,
    (err, result) => {
      if (err) return console.log(err);

      if (result.length == 1) {
        bcrypt.compare(password, result[0].user_pw, (error, response) => {
          if (response) {
            // Log adat feltöltése
            con.query(
              "INSERT INTO login_log(Succesful,idlogin_user, last_logindate, log_reason) value (?,?,?,?);",
              [true, result[0].idlogin_user, new Date(), "successful login"],
              (err, result) => {
                if (err) return console.log(err);
              }
            );
            // Usernek a Session adatának a tárolása
            req.session.userData = result[0];
            req.session.save();
            //console.log(req.session);
            //res.sendFile(__dirname + "/index/views/index.html");
            return res.redirect("/");
          } else {
            con.query(
              "INSERT INTO login_log(Succesful,idlogin_user, last_logindate, log_reason) value (?,?,?,?);",
              [
                false,
                result[0].idlogin_user,
                new Date(),
                "Wrong username/password combination!",
              ],
              (err, result) => {
                if (err) return console.log(err);
              }
            );
            return res.render(__dirname + "/index/views/login.ejs", {
              login_error: "wrong username or password",
            });
          }
        });
      } else {
        con.query(
          "INSERT INTO login_log(Succesful,idlogin_user, last_logindate, log_reason) value (?,?,?,?);",
          [
            false,
            null,
            new Date(),
            "User doesn't exist with " + username + "!",
          ],
          (err, result) => {
            if (err) return console.log(err);
          }
        );
        return res.render(__dirname + "/index/views/login.ejs", {
          login_error: "User doesn't exist with " + username + "!",
        });
      }
    }
  );
});

app.use(function (req, res, next) {
  res.locals.userData = req.session.userData;
  next();
});
//! Logout

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//! Register form

app.get("/register", (req, res) => {
  return res.render(__dirname + "/index/views/register.ejs", {
    page_name: "register",
    error:"",
  });
});

app.post("/register", (req, res) => {
  const email = req.body.register_email;
  const username = req.body.register_username;
  const password = req.body.register_password;

  // Titkosítás
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return console.log(err);
    let idlogin_user = -1;

    con.query(
      "INSERT INTO login_user (user_email, user_name, user_pw) VALUES (?,?,?);",
      [email, username, hash],
      (err, result) => {
        if (err) {
          console.log(err);
          if (err.errno == 1062) {
            return res.render(__dirname + "/index/views/register.ejs", {
              page_name: "register",
              error: "User already exists!",
          })
          }
        }
        //console.log(err);
        idlogin_user = result.insertId;

        con.query(
          "INSERT INTO scores (Singleplayer_Scores, Multiplayer_Scores, Singleplayer_Level, Multiplayer_Level ,idlogin_user) VALUES (?,?,?,?,?);",
          [0, 0, 0, 0, idlogin_user],
          (err, result) => {
            if (err) console.log(err);
            //console.log(err);
            return res.render(__dirname + "/index/views/login.ejs", {
              page_name: "login",
            });
          }
        );
      }
    );
  });

});

//! Profile

app.get("/profile", (req, res) => {
  //console.log(req.session.userData);
  if (req.session.userData) {
    con.query(
      "select * from profil where idlogin_user = ?;",
      [req.session.userData.idlogin_user],
      (err, result) => {
        if (err) return console.log(err);
        console.log(result[0]);

        let tomb = {};

        for(let i = 0; i < result.length; i++){
          console.log(result[i].db);
          switch(i){
            case 0:
              tomb.playedgames = result[i].db;
            case 1:
              tomb.win = result[i].db;
            case 2:
              tomb.lose = result[i].db;
            case 3:
              tomb.hitships = result[i].db;
            case 4:
              tomb.sp_score = result[i].db;
            case 5:
              tomb.sp_level = result[i].db;
            case 6:
              tomb.mp_score = result[i].db;
            case 7:
              tomb.mp_level = result[i].db;
          }
        }
        // let playedgames = tomb.playedgames;
        // let win = tomb.win;
        // let lose = result[2].db;
        // let hitships = result[3].db;
        // let sp_score = result[4].db;
        // let sp_level = result[5].db;
        // let mp_score = result[6].db;
        // let mp_level = result[7].db;

        return res.render(__dirname + "/index/views/profile.ejs", {
          page_name: "profile",
          userData: req.session.userData,
          data: tomb
        });
      }
    );
  } else {
    return res.render(__dirname + "/index/views/login.ejs", {
      page_name: "login",
    });
  }
});

//con.query("UPDATE login_user(user_email,user_name, user_pw) SET WHERE ")

app.post("/profile", (req, res) => {
  const password = req.body.log_password;
  var userData = req.session.userData;

  // Titkosítás
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return console.log(err);

    con.query("UPDATE login_user SET user_pw = ?", [hash], (err, result) => {
      //console.log(err);
      userData.user_pw = hash;
      req.session.userData = userData;
      req.session.save();
    });
  });
  return res.render(__dirname + "/index/views/profile.ejs", {
    page_name: "profile",
    userData: req.session.userData,
  });
});

//! Singleplayer

// app.get('/singleplayer', (req, res) => {
//   return res.render(__dirname + '/index/singleplayer.ejs', { page_name: 'singleplayer', isLoggedIn: req.session.isLoggedIn, user: req.session.user })
// });

var fieldtype = {
  hajo: 0,
  viz: 1,
  hit: 2,
  miss: 3
};



app.get("/singleplayer", function (req, res) {
  if (req.session.userData) {
    return res.render(__dirname + "/index/views/game.ejs", {
      page_name: "singleplayer",
      userData: req.session.userData,
    });
  } else {
    return res.render(__dirname + "/index/views/login.ejs", {
      page_name: "login",
    });
  }
});




let numUsers = [];
let viewers = [];
//!  Rooms

//! Functionok

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

// Fieldtype-s konverziója
function generateRandomMatrix2(size, socketid) {
  let matrix = [];
  let free = [];

  //Minden víz
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = fieldtype.viz;
      let temp = [];
      temp.push(i);
      temp.push(j);
      free.push(temp);
    }
  }

  console.log("ships:" + Object.keys(ships).length);

  for (let ship in ships) {
    let selectedShip = ships[ship];
    console.log(selectedShip);
    for (let j = 0; j < selectedShip.darab; j++) {
      let x, y;
      let mindViz = true;
      randomirany = Math.random() < 0.5;
      console.log("irany: " + randomirany);
      if (randomirany) {
        //vízszintes
        let hossz = -1;

        do {
          console.table(matrix);
          mindViz = true;
          x = Math.floor(Math.random() * size);
          y = Math.floor(Math.random() * size);
          console.log(x + "-" + y);
          for (let a = 0; a < selectedShip.hossz; a++) {
            if (y + a >= size) continue;
            if (matrix[x][y + a] == fieldtype.hajo) {
              mindViz = false;
            }
          }
          console.log("mindviz: " + mindViz);
          hossz = y + selectedShip.hossz;
          console.log("hossz: " + hossz);
        } while (hossz >= size || !mindViz);

        console.log(x);
        console.log(y);

        for (let a = 0; a < selectedShip.hossz; a++) {
          //y = h-re
          matrix[x][y + a] = fieldtype.hajo;
        }
      } else {
        //függőleges
        let hossz = -1;

        do {
          console.table(matrix);
          mindViz = true;
          x = Math.floor(Math.random() * size);
          y = Math.floor(Math.random() * size);
          console.log(x + "-" + y);
          for (let a = 0; a < selectedShip.hossz; a++) {
            console.log(a + ". sor: " + matrix[x + a]);
            if (x + a >= size) break;
            if (matrix[x + a][y] == fieldtype.hajo) {
              mindViz = false;
            }
          }
          console.log("mindviz: " + mindViz);
          hossz = x + selectedShip.hossz;
          console.log("hossz: " + hossz);
        } while (hossz >= size || !mindViz);
        for (let a = 0; a < selectedShip.hossz; a++) {
          //x = h-re
          matrix[x + a][y] = fieldtype.hajo;
        }
      }

      //matrix[i][j] = mapType[Math.floor(Math.random() * mapType.length)];
      //matrix[i][j] = Math.floor(Math.random() * 2);
    }
  }
  //console.log(matrix);
  singleplayerRooms[socketid].free = free;
  console.table(matrix);
  return matrix;
}

function removeFrom2Darray(item, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] == item[0] && array[i][1] == item[1]) {
      array.splice(i, 1);
    }
  }
}

function insertMatchhistory(user, enemy) {
  let match_result = "";
  let ships_hit;

  ships_hit = user.scores / 50;
  if (user.scores > enemy.scores) {
    match_result = "win";
  } else if (user.scores == enemy.scores) {
    match_result = "draw";
  } else {
    match_result = "lose";
  }

  con.query(
    "INSERT INTO match_history_data(Hit_ships, match_result, idlogin_user ) VALUES(?,?,?);",
    [ships_hit, match_result, user.idlogin_user],
    (err, result) => {
      if (err) console.log(err);
    }
  );

  if (enemy.idlogin_user !== undefined) {
    if (enemy.scores > user.scores) {
      match_result = "win";
    } else if (enemy.scores == user.scores) {
      match_result = "draw";
    } else {
      match_result = "lose";
    }
    ships_hit = enemy.scores / 50;

    con.query(
      "INSERT INTO match_history_data(Hit_ships, match_result, idlogin_user ) VALUES(?,?,?);",
      [ships_hit, match_result, enemy.idlogin_user],
      (err, result) => {
        if (err) return console.log(err);
      }
    );
  }
}

function arrayContainsOtherArray(array, search) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][0] == search[0] && array[i][1] == search[1]) {
        return true;
      }
    }
  }
  return false;
}

function updateScore(user, score) {
  //console.log("start select");
  con.query(
    "Select Singleplayer_Scores , Singleplayer_Level From scores Where idlogin_user  = ?;",
    [user.idlogin_user],
    (err, result) => {
      if (err) return console.log(err);

      var newScore, newLevel;
      newScore = result[0].Singleplayer_Scores + score;
      newLevel = result[0].Singleplayer_Level;

      while (newScore >= 300) {
        newLevel++, (newScore -= 300);
      }

      con.query(
        "UPDATE scores SET Singleplayer_Scores = ?, Singleplayer_Level = ? Where idlogin_user = ?",
        [newScore, newLevel, user.idlogin_user],
        (err, result) => {
          if (err) return console.log(err);
          //console.log(user);
          user.level = newLevel;
          user.scores = newScore;
        }
      );
    }
  );
}

function updateScore2(user, enemy) {
  //console.log(user.idlogin_user + " - undefined vagyok???");
  //console.log(user+ "- az adatok megvannak");

  //console.log("start select");
  con.query(
    "Select Multiplayer_Scores , Multiplayer_Level From scores Where idlogin_user  = ?;",
    [user.idlogin_user],
    (err, result) => {
      if (err) return console.log(err);
      //console.log("result: ", result[0].Multiplayer_Scores);
      //const { scores, level } = result;
      //console.log(scores + " - scores " + level + " - level");
      var newScore, newLevel;
      newScore = result[0].Multiplayer_Scores + user.scores;
      newLevel = result[0].Multiplayer_Level;
      //console.log(newScore);
      //console.log(newLevel);

      while (newScore >= 300) {
        newLevel++, (newScore -= 300);
      }

      //console.log("update előtt");
      con.query(
        "UPDATE scores SET  Multiplayer_Scores = ?,  Multiplayer_Level = ? Where idlogin_user = ?",
        [newScore, newLevel, user.idlogin_user],
        (err, result) => {
          if (err) {
            //console.log("hiba updatescore update query");
            //console.log(err);
          }
          //console.log(user);
          user.level = newLevel;
          user.scores = newScore;
         
          //req.session.userData = user;
          //req.session.save();
          //console.log("beolvasva az adatbázisba");
        }
      );
    }
  );

  con.query(
    "Select Multiplayer_Scores , Multiplayer_Level From scores Where idlogin_user  = ?;",
    [enemy.idlogin_user],
    (err, result) => {
      if (err) {console.log(err);}
      console.log("result:");
      console.log(result);
      //console.log("result: ", result[0].Multiplayer_Scores);
      //const { scores, level } = result;
      //console.log(scores + " - scores " + level + " - level");
      var newScore, newLevel;
      newScore = result[0].Multiplayer_Scores + enemy.scores;
      newLevel = result[0].Multiplayer_Level;
      //console.log(newScore);
      //console.log(newLevel);

      while (newScore >= 300) {
        newLevel++, (newScore -= 300);
      }

      //console.log("update előtt");
      con.query(
        "UPDATE scores SET  Multiplayer_Scores = ?,  Multiplayer_Level = ? Where idlogin_user = ?",
        [newScore, newLevel, enemy.idlogin_user],
        (err, result) => {
          if (err) {
            //console.log("hiba updatescore update query");
            //console.log(err);
          }
          //console.log(user);
          enemy.level = newLevel;
          enemy.scores = newScore;
         
        
        }
      );
    }
  );
}

function checkShips(Matrix) {
  //sajat matrixba vane neyrtes
  for (let i = 0; i < Matrix.length; i++) {
    for (let j = 0; j < Matrix[i].length; j++) {
      if (Matrix[i][j] == fieldtype.hajo) {
        return true;
      }
    }
  }
  return false;
}


function checkShipsOwn(Matrix) {
  //sajat matrixba vane neyrtes
  for (let i = 0; i < Matrix.length; i++) {
    for (let j = 0; j < Matrix[i].length; j++) {
      if (Matrix[i][j] == fieldtype.hajo) {
        return true;
      }
    }
  }
  return false;
}



function checkShipsEnemy(Matrix) {
  // enemyben van e nyertes
  for (let i = 0; i < Matrix.length; i++) {
    for (let j = 0; j < Matrix[i].length; j++) {
      if (Matrix[i][j] == fieldtype.hajo) {
        return true;
      }
    }
  }
  return false;
}

function checkWaterOwn(Matrix) {
  //sajat matrixba vane neyrtes
  for (let i = 0; i < Matrix.length; i++) {
    for (let j = 0; j < Matrix[i].length; j++) {
      if (Matrix[i][j] == fieldtype.viz) {
        return true;
      }
    }
  }
  return false;
}

function checkWaterEnemy(Matrix) {
  // enemyben van e nyertes
  for (let i = 0; i < Matrix.length; i++) {
    for (let j = 0; j < Matrix[i].length; j++) {
      if (Matrix[i][j] == fieldtype.viz) {
        return true;
      }
    }
  }
  return false;
}

//! Socket.IO-s rész

io.on("connection", (socket) => {
 

  socket.on("connected", (data) => {
    singleplayerRooms[socket.id] = {
      user: JSON.parse(data).userData,
    };
    console.log("connected:\n");
    console.log(singleplayerRooms[socket.id]);
    //console.log("socket connected: " + user);
  });

  socket.on("gamestart", (adat) => {
    data = JSON.parse(adat);
    singleplayerRooms[socket.id].matrix = data.matrix;
    singleplayerRooms[socket.id].enemyMatrix = generateRandomMatrix2(
      data.size,
      socket.id
    );
    singleplayerRooms[socket.id].userScore = 0;
    singleplayerRooms[socket.id].aiScore = 0;
    singleplayerRooms[socket.id].aiFields = [];

    socket.emit(
      "matrix",
      JSON.stringify({
        matrix: singleplayerRooms[socket.id].matrix,
        enemyMatrix: singleplayerRooms[socket.id].enemyMatrix,
        score: singleplayerRooms[socket.id].userScore,
        aiscore: singleplayerRooms[socket.id].aiScore,
      })
    );
  });

  socket.on("mp_gameoverTimer", (data) => {
    io.to(data).emit("mp_gameover", true);
  });

  socket.on("mp_gamestart", (adat) => {
    //!Todo multiplayer fix!!!

    let data = JSON.parse(adat);

    sizerandom = Math.floor(Math.random() * 8 + 3);
    //matrix = generateRandomMatrix2(sizerandom);
    //enemyMatrix = generateRandomMatrix2(sizerandom);
    console.log(data.roomId);
    if(viewersarrays.get(parseInt(data.roomId)).userData.team == data.team){
      viewersarrays.get(parseInt(data.roomId)).matrix = data.matrix;
    }else {
      viewersarrays.get(parseInt(data.roomId)).enemyMatrix = data.matrix;
    }
    console.log("data.roomid adatok: ",viewersarrays);

    viewersarrays.get(parseInt(data.roomId)).readyCount++;
    //console.log("gamestart: " + [...viewersarrays.entries()]);
    if (viewersarrays.get(parseInt(data.roomId)).readyCount == 2) {
      io.to(data.roomId).emit(
        "mp_matrix",
        JSON.stringify({
          matrix: viewersarrays.get(parseInt(data.roomId)).matrix,
          enemyMatrix: viewersarrays.get(parseInt(data.roomId)).enemyMatrix,
          player_scores: viewersarrays.get(parseInt(data.roomId)).userData.scores,
          enemy_scores: viewersarrays.get(parseInt(data.roomId)).enemy.scores,
          currentPlayer: viewersarrays.get(parseInt(data.roomId)).userData,
        })
      );
    } else {
      return;
    }
  
    

    //viewersarrays[data.roomId].matrix = data.matrix;
    //viewersarrays[data.roomId].enemyMatrix = data.matrix;

    //sizerandom = Math.floor((Math.random(6 - 3) + 3))

    let currentPlayer = viewersarrays
      .get(parseInt(data.roomId)).userData;
    let enemy = viewersarrays
      .get(parseInt(data.roomId)).enemy;

    console.log("data" + currentPlayer);

    currentPlayer["scores"] = 0;
    enemy["scores"] = 0;

  });

  socket.on("mp_kuld", (adat) => {
    let data = JSON.parse(adat);
    var coordinates = data.pos;
    var xy = coordinates.split("_");
    let currentPlayerTeam = data.team;
    let oppositTeam = currentPlayerTeam == "player" ? "enemy" : "player";
    console.log("oppositTeam: " + oppositTeam);
    let currentPlayer = (currentPlayerTeam == "player" ? viewersarrays.get(parseInt(data.roomId)).userData : viewersarrays.get(parseInt(data.roomId)).enemy);
    let nextPlayer = (oppositTeam == "player" ? viewersarrays.get(parseInt(data.roomId)).userData : viewersarrays.get(parseInt(data.roomId)).enemy);
    console.log("nextPlayer: ");
    console.log(nextPlayer);
      if (currentPlayer.team == "player") {
        if(viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] == fieldtype.hit ||
        viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] == fieldtype.miss ){
            socket.emit("mp_wrong", "ide nem lohetsz mar!!!!");
          }
        // player lo a enemy matrixba mindig own hit  kell
        
        else if (viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] == fieldtype.hajo) {
          viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] = fieldtype.hit;
          currentPlayer.scores += 50;
          console.log("!checkshops: " + !checkShips(viewersarrays.get(parseInt(data.roomId)).enemyMatrix));
          if (!checkShips(viewersarrays.get(parseInt(data.roomId)).enemyMatrix)) {
            console.log("mp_gameover");
            let user = (currentPlayer.team === "player" 
            ? viewersarrays.get(parseInt(data.roomId)).userData 
            : viewersarrays.get(parseInt(data.roomId)).enemy);
              
            let enemy = (currentPlayer.team === "player" 
            ? viewersarrays.get(parseInt(data.roomId)).enemy 
            : viewersarrays.get(parseInt(data.roomId)).userData);

            updateScore2(user, enemy);
            insertMatchhistory(user, enemy);
            io.to(data.roomId).emit(
              "mp_gameover",
              JSON.stringify({
                winner: user.user_name,
              })
            );
          }
        } else if (viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] == fieldtype.viz) {
          viewersarrays.get(parseInt(data.roomId)).enemyMatrix[xy[0]][xy[1]] = fieldtype.miss;
          if (!checkShips(viewersarrays.get(parseInt(data.roomId)).enemyMatrix)) {
            console.log("mp_gameover");
            let user = (currentPlayer.team === "player" 
            ? viewersarrays.get(parseInt(data.roomId)).userData 
            : viewersarrays.get(parseInt(data.roomId)).enemy);
              
            let enemy = (currentPlayer.team === "player" 
            ? viewersarrays.get(parseInt(data.roomId)).enemy 
            : viewersarrays.get(parseInt(data.roomId)).userData);

            updateScore2(user, enemy);
            insertMatchhistory(user, enemy);
            io.to(data.roomId).emit(
              "mp_gameover",
              JSON.stringify({
                winner:
                  user.scores > enemy.scores ? user.user_name : enemy.user_name,
              })
            );
          }
        }
      } else if (currentPlayer.team == "enemy") {
        // enemy lo a sajat amtrixba tehat enemy hit  kell mindig
        
        if(viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] == fieldtype.hit ||
        viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] == fieldtype.miss ){
            socket.emit("mp_wrong", "ide nem lohetsz mar!!!!");
          }
        else if (viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] == fieldtype.hajo) {
          viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] = fieldtype.hit;
          currentPlayer.scores += 50;
          console.log("!checkshops: " + !checkShips(viewersarrays.get(parseInt(data.roomId)).matrix));
          if (!checkShips(viewersarrays.get(parseInt(data.roomId)).matrix)) {
            console.log("mp_gameover");
            let user = (currentPlayer.team === "enemy" 
            ? viewersarrays.get(parseInt(data.roomId)).enemy 
            : viewersarrays.get(parseInt(data.roomId)).userData);

            let enemy = (currentPlayer.team === "enemy" 
            ? viewersarrays.get(parseInt(data.roomId)).userData 
            : viewersarrays.get(parseInt(data.roomId)).enemy);

            updateScore2(user, enemy);
            insertMatchhistory(user, enemy);
            io.to(data.roomId).emit(
              "mp_gameover",
              JSON.stringify({
                winner: user.user_name,
              })
            );
          }
        } else if (viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] == fieldtype.viz) {
          viewersarrays.get(parseInt(data.roomId)).matrix[xy[0]][xy[1]] = fieldtype.miss;
          if (!checkShips(viewersarrays.get(parseInt(data.roomId)).matrix)) {
            console.log("mp_gameover");
            let user = (currentPlayer.team === "enemy" 
            ? viewersarrays.get(parseInt(data.roomId)).enemy 
            : viewersarrays.get(parseInt(data.roomId)).userData);
            let enemy = (currentPlayer.team === "enemy" 
            ? viewersarrays.get(parseInt(data.roomId)).userData 
            : viewersarrays.get(parseInt(data.roomId)).enemy);

            updateScore2(user, enemy);
            insertMatchhistory(user, enemy);
            io.to(data.roomId).emit(
              "mp_gameover",
              JSON.stringify({
                winner: user.user_name,
              })
            );
          }
        }
    }

    //console.log("mp_kuld: " + [...viewersarrays.entries()]);

    io.to(data.roomId).emit(
      "mp_matrix",
      JSON.stringify({
        matrix: viewersarrays.get(parseInt(data.roomId)).matrix,
        enemyMatrix: viewersarrays.get(parseInt(data.roomId)).enemyMatrix,
        player_scores: viewersarrays
          .get(parseInt(data.roomId))
          .userData.scores,
        enemy_scores: viewersarrays
          .get(parseInt(data.roomId))
          .enemy.scores,
        currentPlayer: nextPlayer,
      })
    );

    console.log("currentPlayer");
    console.log(currentPlayer);
    
    console.log("nextPlayer");
    console.log(nextPlayer);
    currentPlayer = nextPlayer;
  });

  socket.on("kuld", (adat, aiscore) => {
    // socket.join(name);
    //console.log(adat);

    var coordinates = adat;
    var xy = coordinates.split("_");
    singleplayerRooms[socket.id].aiScore = aiscore;
    let enemyMatrix = singleplayerRooms[socket.id].enemyMatrix;
    let matrix = singleplayerRooms[socket.id].matrix;
    let user = singleplayerRooms[socket.id].user;
    let free = singleplayerRooms[socket.id].free;
    console.log("free mezo:", free);
    user.scores = singleplayerRooms[socket.id].userScore;
    let localaiscore = 0;

    console.log("singleplayerRooms", singleplayerRooms[socket.id]);

    if (
      enemyMatrix[xy[0]][xy[1]] == fieldtype.hit ||
      enemyMatrix[xy[0]][xy[1]] == fieldtype.miss
    ) {
      socket.emit("wrong", "ide nem lohetsz mar!!!!");
      // return;
    } else {
      if (enemyMatrix[xy[0]][xy[1]] == fieldtype.hajo) {
        enemyMatrix[xy[0]][xy[1]] = fieldtype.hit;
        if (!checkShipsEnemy(enemyMatrix)) {
          console.log("debug1");
          updateScore(user, singleplayerRooms[socket.id].userScore);
          insertMatchhistory(user, {
            scores: singleplayerRooms[socket.id].userScore,
          });
          let eredmeny;
          if (
            singleplayerRooms[socket.id].aiScore <
            singleplayerRooms[socket.id].userScore
          ) {
            eredmeny = "Győztél";
          } else if (
            singleplayerRooms[socket.id].aiScore >
            singleplayerRooms[socket.id].userScore
          ) {
            eredmeny = "Vesztettél";
          } else {
            eredmeny = "Döntetlen";
          }
          io.to(socket.id).emit("gameover", eredmeny);
        }
        singleplayerRooms[socket.id].userScore += 50;
        io.to(socket.id).emit(
          "matrix",
          JSON.stringify({
            matrix: singleplayerRooms[socket.id].matrix,
            enemyMatrix: singleplayerRooms[socket.id].enemyMatrix,
            score: singleplayerRooms[socket.id].userScore,
            aiscore: singleplayerRooms[socket.id].aiScore,
          })
        );
      } else if (enemyMatrix[xy[0]][xy[1]] == fieldtype.viz) {
        enemyMatrix[xy[0]][xy[1]] = fieldtype.miss;
        if (!checkWaterEnemy(enemyMatrix)) {
          console.log("debug2");
          updateScore(user, singleplayerRooms[socket.id].userScore);
          insertMatchhistory(user, {
            scores: singleplayerRooms[socket.id].userScore,
          });

          let eredmeny;
          if (
            singleplayerRooms[socket.id].aiScore <
            singleplayerRooms[socket.id].userScore
          ) {
            eredmeny = "Győztél";
          } else if (
            singleplayerRooms[socket.id].aiScore >
            singleplayerRooms[socket.id].userScore
          ) {
            eredmeny = "Vesztettél";
          } else {
            eredmeny = "Döntetlen";
          }
          io.to(socket.id).emit("gameover", eredmeny);
        }
        io.to(socket.id).emit(
          "matrix",
          JSON.stringify({
            matrix: singleplayerRooms[socket.id].matrix,
            enemyMatrix: singleplayerRooms[socket.id].enemyMatrix,
            score: singleplayerRooms[socket.id].userScore,
            aiscore: singleplayerRooms[socket.id].aiScore,
          })
        );
      }

      var randomPos = [];
      //Checking
      let seged = [[+1, 0], [-1, 0], [0, +1], [0, -1]];
      let segedIndex = 0;
      let joe = true;


      do {
        if (free.length == 0) {
          break;
        }
        joe = true;
        // ha van a tarolt pozicioban akkor onnan tippel
        if(singleplayerRooms[socket.id].aiFields.length == 0 || segedIndex == 4){
          randomPos = free[Math.floor(Math.random() * free.length)];
        } else {
          let selectedPos = singleplayerRooms[socket.id].aiFields[Math.floor(Math.random() * singleplayerRooms[socket.id].aiFields.length)];
          randomPos[0] = seged[segedIndex][0] + selectedPos[0];
          randomPos[1] = seged[segedIndex][1] + selectedPos[1];
          console.log("selectedPos:", selectedPos);
        }
        segedIndex++;
        console.log("randomPos: " + randomPos);
        if ((randomPos[0] >=5 || randomPos[1] >= 5) ||
            (randomPos[0] < 0 || randomPos[1] < 0))
            {
             
              joe = false;
            }
            else if (matrix[randomPos[0]][randomPos[1]] != fieldtype.viz &&
                matrix[randomPos[0]][randomPos[1]] != fieldtype.hajo)
                {
                  joe=false;
                }
      } while ( !joe );

      if (free.length > 0) {
        var x = randomPos[0];
        var y = randomPos[1];

        if (matrix[x][y] == fieldtype.hajo) {
          singleplayerRooms[socket.id].aiFields.push([x, y]);
          console.log("singleplayerRooms[socket.id].aiFields:", singleplayerRooms[socket.id].aiFields);

          singleplayerRooms[socket.id].aiScore += 50;
          matrix[x][y] = fieldtype.hit;
        } else {
          matrix[x][y] = fieldtype.miss;
        }
        removeFrom2Darray([x, y], free);
      }

      console.log("length: ", free.length);
      if (free.length == 0) {
        //console.log("gameover");
        updateScore(user, singleplayerRooms[socket.id].userScore);
        insertMatchhistory(user, {
          scores: singleplayerRooms[socket.id].userScore,
        });
        console.log("debug4");
        let eredmeny;
        if (
          singleplayerRooms[socket.id].aiScore <
          singleplayerRooms[socket.id].userScore
        ) {
          eredmeny = "Győztél";
        } else if (
          singleplayerRooms[socket.id].aiScore >
          singleplayerRooms[socket.id].userScore
        ) {
          eredmeny = "Vesztettél";
        } else {
          eredmeny = "Döntetlen";
        }
        io.to(socket.id).emit("gameover", eredmeny);
      }
      if (!checkShipsOwn(matrix)) {
        console.log("debug3");
        updateScore(user, singleplayerRooms[socket.id].userScore);
        insertMatchhistory(user, {
          scores: singleplayerRooms[socket.id].userScore,
        });

        let eredmeny;
        if (
          singleplayerRooms[socket.id].aiScore <
          singleplayerRooms[socket.id].userScore
        ) {
          eredmeny = "Győztél";
        } else if (
          singleplayerRooms[socket.id].aiScore >
          singleplayerRooms[socket.id].userScore
        ) {
          eredmeny = "Vesztettél";
        } else {
          eredmeny = "Döntetlen";
        }
        io.to(socket.id).emit("gameover", eredmeny);
      }

      io.to(socket.id).emit(
        "matrix",
        JSON.stringify({
          matrix: singleplayerRooms[socket.id].matrix,
          enemyMatrix: singleplayerRooms[socket.id].enemyMatrix,
          score: singleplayerRooms[socket.id].userScore,
          aiscore: singleplayerRooms[socket.id].aiScore,
        })
      );
    }
  });

  socket.on("timeExpired", (data) => {
    let parsed = JSON.parse(data);

    console.log("debug5");
    let eredmeny;
    if (
      singleplayerRooms[socket.id].aiScore <
      singleplayerRooms[socket.id].userScore
    ) {
      eredmeny = "Győztél";
    } else if (
      singleplayerRooms[socket.id].aiScore >
      singleplayerRooms[socket.id].userScore
    ) {
      eredmeny = "Vesztettél";
    } else {
      eredmeny = "Döntetlen";
    }
    updateScore(
      singleplayerRooms[socket.id].user,
      singleplayerRooms[socket.id].userScore
    );
    insertMatchhistory(singleplayerRooms[socket.id].user, {
      scores: singleplayerRooms[socket.id].aiScore,
    });
    socket.emit("gameover", eredmeny);
  });

  //todo Chat
  //console.log("client connected");
  //console.log("rooms connection hello");

  //numUsers +=1;
  //console.log("Csatlakozottak - " + numUsers)
  socket.on("joinRoom", (data) => {
    let parsed = JSON.parse(data);
    //parsed.userData = JSON.parse(parsed.userData);
    socket.join(parsed.roomId);
    if(parsed.userData.team == 'player'){
      viewersarrays.get(parseInt(parsed.roomId)).userData.socketId = socket.id;
    } else {
      viewersarrays.get(parseInt(parsed.roomId)).enemy.socketId = socket.id;
    }
    //console.log("joinroom data: ", parsed.userData.team);
    //M.set(parsed.roomId, [parsed.userData]);
    let enemyname = "enemy";
    if(viewersarrays.get(parseInt(parsed.roomId)).enemy !== undefined) {
enemyname = viewersarrays.get(parseInt(parsed.roomId)).enemy.user_name;
    }

    let viewersCount = viewersarrays.get(parseInt(parsed.roomId)).viewersCount;
    io.to(parsed.roomId).emit(
      "someJoin",
      JSON.stringify({ viewers: viewersCount,
        playerName: viewersarrays.get(parseInt(parsed.roomId)).userData.user_name,
        enemyName: enemyname })
    );
  });

  //console.log("userek " +socket.users);

  socket.on("chatmsg", (data) => {
    let parsed = JSON.parse(data);
    let alma = parsed.name + ": " + parsed.message;

    io.to(parsed.roomId).emit("alma", alma);
  });

  socket.on("disconnect", () => {
      console.log("valaki kilepett a szobából");

      let isSinglePlayer = singleplayerRooms[socket.id] !== undefined;

    console.log(isSinglePlayer);

    if (!isSinglePlayer) {
      let roomId = -1;
      for (const [key, value] of viewersarrays) {
        console.log(value.userData.socketId);
        console.log(socket.id);
        if (value.userData.socketId == socket.id) {
          roomId = key;
        } else if (value.enemy.socketId == socket.id) {
          roomId = key;
        }
      }

      
      
      
     
      
      if (viewersarrays.get(roomId).userData.socketId == socket.id) {
        if(viewersarrays.get(roomId).enemy !== undefined){
        updateScore2(viewersarrays.get(roomId).enemy, viewersarrays.get(roomId).userData);
        insertMatchhistory(viewersarrays.get(roomId).enemy, viewersarrays.get(roomId).userData);
        } 
        viewersarrays.get(roomId).userData = undefined;
      }else if(viewersarrays.get(roomId).enemy.socketId == socket.id){
        if(viewersarrays.get(roomId).userData !== undefined){
        updateScore2(viewersarrays.get(roomId).userData, viewersarrays.get(roomId).enemy);
        insertMatchhistory(viewersarrays.get(roomId).userData, viewersarrays.get(roomId).enemy);
        }
        viewersarrays.get(roomId).enemy = undefined;
      } else {
        viewersarrays.get(roomId).viewersCount -= 1;
      }
      console.log("roomId: " + roomId);


      io.to(roomId.toString()).emit("someLeave", true);


      //ha user vagy enemy meg NEM undefined akkor ne torolje
      if (viewersarrays.get(roomId).userData !== undefined
        || viewersarrays.get(roomId).enemy !== undefined 
        || viewersarrays.get(roomId).viewersCount!=0) {
          viewersarrays.delete(roomId);
        }
    } else { // isSingplayer
      singleplayerRooms.delete(socket.id);
    }
  });
});

// app.use(function (err, req, res) {
//   return res.render(__dirname + '/index/views/error.ejs', { error: err });
// })

//! For running the server
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`server run on localhost:${PORT} `));
