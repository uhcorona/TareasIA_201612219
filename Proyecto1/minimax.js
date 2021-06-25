var createError = require('http-errors');
var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var reversiRouter = require('./routes/reversi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/reversi', reversiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
ubuntu@ip-172-31-17-40:~/proyecto$ cd routes/
ubuntu@ip-172-31-17-40:~/proyecto/routes$ ls
index.js  reversi.js
ubuntu@ip-172-31-17-40:~/proyecto/routes$ cat reversi.js 
var express = require('express');
var router = express.Router();

var heuristicmatrix = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120]
];

var heuristicmatrix2 = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, -20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, -20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120]
];


router.get('/', function (req, res, next) {
    let turn = Number(req.query.turno);
    let state = convertmatrix(req.query.estado.split(""));
    let bestminimax = minimax(state, turn, 4, true, turn == 0 ? 0 : 1);
    res.send(String(bestminimax[0]) + String(bestminimax[1]));
});

function calculateheuristic(state, turng) {
    let h0 = 0;
    let h1 = 0;
    let newheuristicmatrix;
    if (turng == 1) {
        newheuristicmatrix = heuristicmatrix2;
    }
    else {
        newheuristicmatrix = heuristicmatrix;
    }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (state[i][j] == 0) {
                h0 += newheuristicmatrix[i][j];
            }
            else if (state[i][j] == 1) {
                h1 += newheuristicmatrix[i][j];
            }
        }
    }
    if (turng == 0) {
        return [, , h0 - h1];
    }
    if (turng == 1) {
        return [, , h1 - h0];
    }
}

function reestructurateheuristic(state, turng) {
    let newheurisitcmatrix = clonematrix(heuristicmatrix);
    if (state[0][0] == turng) {
        newheurisitcmatrix[0][1] = 3;
        newheurisitcmatrix[1][0] = 3;
    }
    if (state[7][0] == turng) {
        newheurisitcmatrix[7][1] = 3;
        newheurisitcmatrix[6][0] = 3;
    }
    if (state[0][7] == turng) {
        newheurisitcmatrix[0][6] = 3;
        newheurisitcmatrix[1][7] = 3;
    }
    if (state[7][7] == turng) {
        newheurisitcmatrix[7][6] = 3;
        newheurisitcmatrix[6][7] = 3;
    }

    if (state[0][0] == turng && state[0][1] == turng && state[0][2] == turng && state[1][0] == turng && state[2][0] == turng) {
        newheurisitcmatrix[1][1] = 30;
    }

    if (state[7][0] == turng && state[7][1] == turng && state[7][2] == turng && state[6][0] == turng && state[5][0] == turng) {
        newheurisitcmatrix[6][1] = 30;
    }

    if (state[0][7] == turng && state[0][6] == turng && state[1][7] == turng && state[0][5] == turng && state[2][7] == turng) {
        newheurisitcmatrix[1][6] = 30;
    }

    if (state[7][7] == turng && state[7][6] == turng && state[6][7] == turng && state[7][5] == turng && state[5][7] == turng) {
        newheurisitcmatrix[6][6] = 30;
    }
    return newheurisitcmatrix;
}

function minimax(state, turn, depth, flag, turng) {
    if (depth == 0) {
        return calculateheuristic(state, turng);
    }
    else if (flag == true) {
        let bestmove = [-1, -1, -999]; //La mejor posible maximizacion

        let bestoptions = lookavailables(state, turn); //Posibles movimientos de este jugador

        for (let i = 0; i < bestoptions.length; i++) {
            let bestnewgame = lookkills(state, turn, bestoptions[i][0], bestoptions[i][1]);

            if (lookavailables(bestnewgame, turn == 0 ? 1 : 0).length == 0) {
                let bestheruisitc = calculateheuristic(bestnewgame, turng);
                if (bestheruisitc != -1 && bestheruisitc[2] > bestmove[2]) {
                    bestmove[2] = bestheruisitc[2];
                    bestmove[0] = bestoptions[i][0];
                    bestmove[1] = bestoptions[i][1];
                }
                continue;
            }

            let bestheruisitc = minimax(bestnewgame, turn == 0 ? 1 : 0, depth - 1, false, turng);
            if (bestheruisitc != -1 && bestheruisitc[2] > bestmove[2]) {
                bestmove[2] = bestheruisitc[2];
                bestmove[0] = bestoptions[i][0];
                bestmove[1] = bestoptions[i][1];
            }
        }
        return bestmove;
    }
    else if (flag == false) {
        let worstmove = [-1, -1, 999];

        let worstoptions = lookavailables(state, turn); //Posibles movimientos de este jugador

        for (let i = 0; i < worstoptions.length; i++) {
            let worstnewgame = lookkills(state, turn, worstoptions[i][0], worstoptions[i][1]);

            if (lookavailables(worstnewgame, turn == 0 ? 1 : 0).length == 0) {
                let worstheruisitc = calculateheuristic(worstnewgame, turng);
                if (worstheruisitc != -1 && worstheruisitc[2] < worstmove[2]) {
                    worstmove[2] = worstheruisitc[2];
                    worstmove[0] = worstoptions[i][0];
                    worstmove[1] = worstoptions[i][1];
                }
                continue;
            }

            let worstheruisitc = minimax(worstnewgame, turn == 0 ? 1 : 0, depth - 1, true, turng);
            if (worstheruisitc != -1 && worstheruisitc[2] < worstmove[2]) {
                worstmove[2] = worstheruisitc[2];
                worstmove[0] = worstoptions[i][0];
                worstmove[1] = worstoptions[i][1];
            }
        }

        return worstmove;
    }
}

function lookavailables(matrix, turn) {
    let availables = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (matrix[i][j] == turn) {
                availables = availables.concat(lookflank(matrix, turn, i, j));
            }
        }
    }
    return availables;
}

function bestpossibleflank(options) {
    let bestoption = options[0];
    let bestheruisitc = -120;
    for (let i = 0; i < options.length; i++) {
        let j = options[i][0];
        let k = options[i][1];
        if (heuristicmatrix[j][k] > bestheruisitc) {
            bestoption = options[i];
            bestheruisitc = heuristicmatrix[j][k];
        }
    }
    return [bestoption[0], bestoption[1], bestheruisitc];
}

function lookflank(matrix, turn, i, j) {
    let rowstart = i - 1 > 0 ? i - 1 : 0;
    let colstart = j - 1 > 0 ? j - 1 : 0;
    let rowend = i + 1 < 8 ? i + 1 : 7;
    let colend = j + 1 < 8 ? j + 1 : 7;
    let posiblekills = [];
    for (let k = rowstart; k <= rowend; k++) {
        for (let l = colstart; l <= colend; l++) {
            if (matrix[k][l] != turn && matrix[k][l] != 2) {
                if (i == k + 1 && j == l + 1) {
                    let kill = lookkill0(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k + 1 && j == l) {
                    let kill = lookkill1(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k + 1 && j == l - 1) {
                    let kill = lookkill2(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k && j == l + 1) {
                    let kill = lookkill3(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k && j == l - 1) {
                    let kill = lookkill4(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k - 1 && j == l + 1) {
                    let kill = lookkill5(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k - 1 && j == l) {
                    let kill = lookkill6(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
                else if (i == k - 1 && j == l - 1) {
                    let kill = lookkill7(matrix, turn, k, l);
                    if (kill != -1) {
                        posiblekills.push(kill);
                    }
                }
            }
        }
    }
    return posiblekills;
}

function lookkill0(matrix, turn, i, j) {
    let l = j;
    for (let k = i; k > -1; k--) {
        if (l > -1) {
            if (matrix[k][l] == turn) {
                return -1;
            }
            else if (matrix[k][l] == 2) {
                return [k, l];
            }
        }
        else {
            return -1;
        }
        l--;
    }
    return -1;
}

function lookkill1(matrix, turn, i, j) {
    for (let k = i; k > -1; k--) {
        if (matrix[k][j] == turn) {
            return -1;
        }
        else if (matrix[k][j] == 2) {
            return [k, j];
        }
    }
    return -1;
}

function lookkill2(matrix, turn, i, j) {
    let l = j;
    for (let k = i; k > -1; k--) {
        if (l < 8) {
            if (matrix[k][l] == turn) {
                return -1;
            }
            else if (matrix[k][l] == 2) {
                return [k, l];
            }
        }
        else {
            return -1;
        }
        l++;
    }
    return -1;
}

function lookkill3(matrix, turn, i, j) {
    for (let l = j; l > -1; l--) {
        if (matrix[i][l] == turn) {
            return -1;
        }
        else if (matrix[i][l] == 2) {
            return [i, l];
        }
    }
    return -1;
}

function lookkill4(matrix, turn, i, j) {
    for (let l = j; l < 8; l++) {
        if (matrix[i][l] == turn) {
            return -1;
        }
        else if (matrix[i][l] == 2) {
            return [i, l];
        }
    }
    return -1;
}

function lookkill5(matrix, turn, i, j) {
    let l = j;
    for (let k = i; k < 8; k++) {
        if (l > -1) {
            if (matrix[k][l] == turn) {
                return -1;
            }
            else if (matrix[k][l] == 2) {
                return [k, l];
            }
        }
        else {
            return -1;
        }
        l--;
    }
    return -1;
}

function lookkill6(matrix, turn, i, j) {
    for (let k = i; k < 8; k++) {
        if (matrix[k][j] == turn) {
            return -1;
        }
        else if (matrix[k][j] == 2) {
            return [k, j];
        }
    }
    return -1;
}

function lookkill7(matrix, turn, i, j) {
    let l = j;
    for (let k = i; k < 8; k++) {
        if (l < 8) {
            if (matrix[k][l] == turn) {
                return -1;
            }
            else if (matrix[k][l] == 2) {
                return [k, l];
            }
        }
        else {
            return -1;
        }
        l++;
    }
    return -1;
}

function convertmatrix(array) {
    let matrizactual = [];
    let i, k;
    for (i = 0, k = -1; i < array.length; i++) {
        if (i % 8 === 0) {
            k++;
            matrizactual[k] = [];
        }
        matrizactual[k].push(Number(array[i]));
    }
    return matrizactual;
}

function lookkills(matrix, turn, i, j) {
    let rowstart = i - 1 > 0 ? i - 1 : 0;
    let colstart = j - 1 > 0 ? j - 1 : 0;
    let rowend = i + 1 < 8 ? i + 1 : 7;
    let colend = j + 1 < 8 ? j + 1 : 7;
    let posiblekills = [];
    for (let k = rowstart; k <= rowend; k++) {
        for (let l = colstart; l <= colend; l++) {
            if (matrix[k][l] != turn && matrix[k][l] != 2) {
                if (i == k + 1 && j == l + 1) {
                    matrix = makekill0(matrix, turn, k, l);
                }
                else if (i == k + 1 && j == l) {
                    matrix = makekill1(matrix, turn, k, l);
                }
                else if (i == k + 1 && j == l - 1) {
                    matrix = makekill2(matrix, turn, k, l);
                }
                else if (i == k && j == l + 1) {
                    matrix = makekill3(matrix, turn, k, l);
                }
                else if (i == k && j == l - 1) {
                    matrix = makekill4(matrix, turn, k, l);
                }
                else if (i == k - 1 && j == l + 1) {
                    matrix = makekill5(matrix, turn, k, l);
                }
                else if (i == k - 1 && j == l) {
                    matrix = makekill6(matrix, turn, k, l);
                }
                else if (i == k - 1 && j == l - 1) {
                    matrix = makekill7(matrix, turn, k, l);
                }
            }
        }
    }
    matrix[i][j] = turn;
    return matrix;
}

function makekill0(matrix, turn, i, j) {
    let l = j;
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k > -1; k--) {
        if (l > -1) {
            if (matrix[k][l] == turn) {
                return possiblenewmatrix;
            }
            else if (matrix[k][l] == 2) {
                return matrix;
            }
            else {
                possiblenewmatrix[k][l] = turn;
            }
        }
        else {
            return matrix;
        }
        l--;
    }
    return matrix;
}

function makekill1(matrix, turn, i, j) {
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k > -1; k--) {
        if (matrix[k][j] == turn) {
            return possiblenewmatrix;
        }
        else if (matrix[k][j] == 2) {
            return matrix;
        }
        else {
            possiblenewmatrix[k][j] = turn;
        }
    }
    return matrix;
}

function makekill2(matrix, turn, i, j) {
    let l = j;
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k > -1; k--) {
        if (l < 8) {
            if (matrix[k][l] == turn) {
                return possiblenewmatrix;
            }
            else if (matrix[k][l] == 2) {
                return matrix;
            }
            else {
                possiblenewmatrix[k][l] = turn;
            }
        }
        else {
            return matrix;
        }
        l++;
    }
    return matrix;
}

function makekill3(matrix, turn, i, j) {
    let possiblenewmatrix = clonematrix(matrix);
    for (let l = j; l > -1; l--) {
        if (matrix[i][l] == turn) {
            return possiblenewmatrix;
        }
        else if (matrix[i][l] == 2) {
            return matrix;
        }
        else {
            possiblenewmatrix[i][l] = turn;
        }
    }
    return matrix;
}

function makekill4(matrix, turn, i, j) {
    let possiblenewmatrix = clonematrix(matrix);
    for (let l = j; l < 8; l++) {
        if (matrix[i][l] == turn) {
            return possiblenewmatrix;
        }
        else if (matrix[i][l] == 2) {
            return matrix;
        }
        else {
            possiblenewmatrix[i][l] = turn;
        }
    }
    return matrix;
}

function makekill5(matrix, turn, i, j) {
    let l = j;
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k < 8; k++) {
        if (l > -1) {
            if (matrix[k][l] == turn) {
                return possiblenewmatrix;
            }
            else if (matrix[k][l] == 2) {
                return matrix;
            }
            else {
                possiblenewmatrix[k][l] = turn;
            }
        }
        else {
            return matrix;
        }
        l--;
    }
    return matrix;
}

function makekill6(matrix, turn, i, j) {
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k < 8; k++) {
        if (matrix[k][j] == turn) {
            return possiblenewmatrix;
        }
        else if (matrix[k][j] == 2) {
            return matrix;
        }
        else {
            possiblenewmatrix[k][j] = turn;
        }
    }
    return matrix;
}

function makekill7(matrix, turn, i, j) {
    let l = j;
    let possiblenewmatrix = clonematrix(matrix);
    for (let k = i; k < 8; k++) {
        if (l < 8) {
            if (matrix[k][l] == turn) {
                return possiblenewmatrix;
            }
            else if (matrix[k][l] == 2) {
                return matrix;
            }
            else {
                possiblenewmatrix[k][l] = turn;
            }
        }
        else {
            return matrix;
        }
        l++;
    }
    return matrix;
}

function clonematrix(matrix) {
    let cloned = [[], [], [], [], [], [], [], []];
    let a = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            a = matrix[i][j].toString();
            cloned[i][j] = Number(a);
        }
    }
    return cloned;
}

module.exports = router;
