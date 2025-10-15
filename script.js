// Ajedrez básico corregido
const color = (cell === cell.toUpperCase()) ? 'w' : 'b';
const type = cell.toUpperCase();
const moves = [];


const addIfEmptyOrCapture = (rr,cc) => {
if(!inBounds(rr,cc)) return;
const t = board[rr][cc];
if(!t) moves.push({r:rr,c:cc});
else if((t === t.toUpperCase()) !== (cell === cell.toUpperCase())) moves.push({r:rr,c:cc});
};


if(type === 'P'){
const dir = (color === 'w') ? -1 : 1;
// un paso
if(inBounds(r+dir,c) && !board[r+dir][c]) moves.push({r:r+dir,c});
// dos pasos desde fila inicial
const startRow = (color==='w') ? 6 : 1;
if(r===startRow && !board[r+dir][c] && !board[r+2*dir][c]) moves.push({r:r+2*dir,c});
// capturas
[[r+dir,c-1],[r+dir,c+1]].forEach(([rr,cc])=>{
if(inBounds(rr,cc) && board[rr][cc] && ((board[rr][cc]===board[rr][cc].toUpperCase()) !== (cell===cell.toUpperCase()))) moves.push({r:rr,c:cc});
});
return moves;


if(type === 'N'){
const deltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
deltas.forEach(([dr,dc])=> addIfEmptyOrCapture(r+dr,c+dc));
return moves;
}


if(type === 'B' || type === 'Q'){
[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(dir=> slide(r,c,dir[0],dir[1],cell,moves));
}
if(type === 'R' || type === 'Q'){
[[-1,0],[1,0],[0,-1],[0,1]].forEach(dir=> slide(r,c,dir[0],dir[1],cell,moves));
}


if(type === 'K'){
for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
if(dr===0 && dc===0) continue;
addIfEmptyOrCapture(r+dr,c+dc);
}
return moves;
}


return moves;
}


function slide(r,c,dr,dc,cell,moves){
let rr = r+dr, cc = c+dc;
while(inBounds(rr,cc)){
if(!board[rr][cc]){ moves.push({r:rr,c:cc}); }
else{ if((board[rr][cc]===board[rr][cc].toUpperCase()) !== (cell===cell.toUpperCase())) moves.push({r:rr,c:cc}); break; }
rr += dr; cc += dc;
}
}


function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }


resetBtn.addEventListener('click', ()=>{ init(); });


// inicar
init();