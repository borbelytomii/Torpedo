

function generateRandomMatrix(size) {
  var matrix = [];
  var mapType = ['H','V','T'];
  for (var i = 0; i < size; i++) {
    matrix[i] = [];
    for (var j = 0; j < size; j++) {
      matrix[i][j] = mapType[Math.floor(Math.random() * mapType.length)];
      //matrix[i][j] = Math.floor(Math.random() * 2);
    }
  }
  return matrix;
}

// H= Hajó V=Víz  T= Talált

function printMatrix(matrix) {
  var str = "";
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix.length; j++) {
      str += matrix[i][j] + " ";
    }
    str += "\n";
  }
  return str;
}

function printMatrixToTable(matrix, table) {
  var str = "";
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix.length; j++) {
      str += matrix[i][j] + " ";
    }
    str += "\n";
  }
  table.innerHTML = str;
}

 
let random = generateRandomMatrix(10);
let matrix = printMatrix(random);
console.log(matrix);
document.getElementById("table").innerHTML = matrix;



printMatrixToTable(random, document.getElementById("table"));

