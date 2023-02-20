var dict = ['envelope','amazing','remarkable','evidence','lucrative','suspect','feigned','malevolent','harmonious','sympathetic','musical','impertinent','salacious','fiendish','expose','redeem','fallow','specter','phantasm','geography','wonder','morose','cackle','careen','muddle','murmur','galosh','shimmer','candid','senator','callow','mindful','museum','mockery','pestiferous','courage','merciful','clever','connect','spurious','gnostic','deciduous','debacle','nervous','tyranny','computer','falafel','mimetic','special','vacuous','crusader','philosopher','marrow','dialect','phenomenon','biblical','atavistic','leonine','carnivorous','evaluate','calligraphy','voltage','radish','pillory','quadrilateral','connive','smuggler','vivacious','resurrection','chronology','galvanize','didactic','nihilist','automotive','alleviate','cacophany','commodious','capacious','designer','hindsight','archeology','equestrian'];
let words = [];
let row = document.getElementById('word-row');
let entry = document.getElementById('entry-row');
let gameOver = false;
let timer = 0;
let orphans = 0;
let currentWord = "";

// Functions

function newWord() { // get a new word from the stack, or else game is over
  currentWord = words.pop();
  return currentWord;
}

function loadDict() {
  while (words.length<5) {
    words.push(dict[Math.floor(Math.random() * dict.length)]);
  }
}

function initWord(str) { // set up a new word on the page

  document.getElementById('description').innerHTML = "Words remaining: " + words.length+'.';

  for (let i =0;i<str.length;i++) {
    let squareBox = document.createElement('div'); // setup box for tile
    squareBox.className = 'empty-box';

    let letterTile = document.createElement('div'); // setup tile
    letterTile.className = 'letter-box';
    letterTile.innerHTML = str[i];
    letterTile.id = i;
    letterTile.setAttribute("draggable","true");
    letterTile.setAttribute("ondragstart","drag(event)");
    letterTile.addEventListener("click", function () {
      if (this.parentElement.parentElement.id=='word-row'){
        move(this,document.querySelectorAll('#entry-row .empty-box'));
      }else {
        move(this,document.querySelectorAll('#word-row .empty-box'));
      }
    });    
    squareBox.appendChild(letterTile); 
    row.appendChild(squareBox); // add it all to row
    
    let blank = document.createElement('div');
    blank.className = 'empty-box';
    entry.appendChild(blank);
  }
  allBlanks = document.querySelectorAll('.empty-box');
  for (var blank of allBlanks){
    blank.setAttribute("ondrop","drop(event)");
    blank.setAttribute("ondragover","allowDrop(event)");
  }
}

function firstEmpty(searchRow) { // find first empty node
  for (const el of searchRow) {
    if (el.firstChild==null){
      return el;
    }
  }
}

function move (element, toRow) {
  var destination = firstEmpty(toRow);
  destination.appendChild(element);
}

function getWord() { // "read" the word on the entry row
  const tiles = Array.from(document.querySelectorAll('#entry-row .letter-box'), c=>c.innerHTML);
  return tiles.join('');
}

function logWord(bool) { // if word exists, clear it out; if all tiles have been used, get a new word
  if (bool=='true') {
    clearTiles();
    if (isEmpty()) {
      refresh();
    }
  }
  else {
    console.log("Word not found in dictionary");
  }
}

function clearRows () { // clear everything away to prepare for new word
  while (row.firstChild) {
    row.removeChild(row.lastChild);
  }
  while (entry.firstChild) {
    entry.removeChild(entry.lastChild);
  }
}

function clearTiles() { // get rid of tiles in entry row
  let letterBoxes = document.querySelectorAll("#entry-row .empty-box");
  for (var box of letterBoxes) {
    if (box.firstChild){
    box.removeChild(box.firstChild);
    }
  }
}

function countTiles () { // count tiles
  return document.querySelectorAll('.letter-box').length;
}

function refresh() { // assess penalty if needed and set up next word
  let penalty = countTiles();
  if (penalty>0) {
    timer += penalty * 15;
    orphans += penalty;
    document.getElementById('timer').innerHTML = timer;
  }
  if (words[0]) {
    clearRows();
    initWord(newWord());  
  } else {
    clearRows();
    gameOver = true;
    document.getElementById('description').innerHTML = "Your time was: "+(Math.floor(timer/60)).toString()+' minutes, '+(timer%60).toString()+' seconds. You had '+orphans+' orphan tiles, for a total penalty of '+(orphans*15).toString()+' penalty seconds.';
  }
}

function checkWord() { // communicate with backend to see if word exists
  const str = getWord();
  if (str == currentWord) { // keep user from just recycling word
    console.log("Nice try, wise guy");
    logWord('false');
    return false;
  } else if (str.length == 1 && ['a','i','o'].includes(str)) {
    logWord('true');
    return true;
  } else {

  fetch('/checkword/?'+'key='+str, {
    method: 'GET',

  }).then(response => response.json())
    .then(response => {logWord(JSON.stringify(response.result))});
  }
}

function isEmpty () { // have all our word's tiles been used?
  if (countTiles()>0) {
    return false;
  } else {
    return true;
  }
}

// drag & drop  functionality for tiles

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
 const myDropper = document.getElementById(data);
 ev.target.appendChild(myDropper);
}

function beginGame () {
  loadDict();
  document.querySelector('.timer-score-box').classList.remove("hidden");
  document.getElementById('start-btn').classList.add('hidden');
  initWord(newWord());
  setInterval(function() { // initialize our timer
    if (gameOver==false) {
      timer++;
      document.getElementById('timer').innerHTML = timer;
      }
    },"1000");
}

// UI

document.getElementById('start-btn').addEventListener('click',beginGame);


const enterButton = document.getElementById('enter-btn');
enterButton.addEventListener('click', checkWord);

const passButton = document.getElementById('pass-btn');
passButton.addEventListener('click', refresh);