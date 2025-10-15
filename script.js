// Ajedrez básico en JavaScript
// Representaremos el tablero como un array 8x8 con objetos {type, color} o null


const initialFEN = [
['r','n','b','q','k','b','n','r'],
['p','p','p','p','p','p','p','p'],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
['P','P','P','P','P','P','P','P'],
['R','N','B','Q','K','B','N','R']
];


const pieceSymbols = {
'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟'
};


let board = [];
let selected = null; // {r,c}
let currentTurn = 'w'; // 'w' or 'b'
let lastMove = null;


const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turnPlayer');
const resetBtn = document.getElementById('resetBtn');


function init(){
board = initialFEN.map(row => row.map(cell => {
if(!cell) return null;
const isUpper = cell === cell.toUpperCase();
return { type: cell.toUpperCase(), color: isUpper ? 'w' : 'b' };
}));
render();
}


function render(){
boardEl.innerHTML = '';
for(let r=0;r<8;r++){
for(let c=0;c<8;c++){
const square = document.createElement('div');
square.className = 'square ' + (((r+c)%2===0)?'light':'dark');
square.dataset.r = r; square.dataset.c = c;
square.addEventListener('click', onSquareClick);


const cell = board[r][c];
if(cell){
const sp = document.createElement('div');
sp.className = 'piece';
sp.textContent = pieceSymbols[cell.color === 'w' ? cell.type : cell.type.toLowerCase()];
square.appendChild(sp);
}


// last move highlight
if(lastMove && ((lastMove.from.r==r && lastMove.from.c==c) || (lastMove.to.r==r && lastMove.to.c==c))){
square.classList.add('last-move');
}


boardEl.appendChild(square);
}
}
turnEl.textContent = currentTurn === 'w' ? 'Blancas' : 'Negras';
}


function onSquareClick(e){
const r = Number(e.currentTarget.dataset.r);
const c = Number(e.currentTarget.dataset.c);
const cell = board[r][c];
init();