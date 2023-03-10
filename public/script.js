import {dict} from "./words.js";

// global variables

let words = [];
let wordsCompleted = 0;
let row = document.getElementById('word-row');
let entry = document.getElementById('entry-row');
let timer = 0;
let orphans = 0;
let currentWord = "";
let perpetualMode = false;
var myInterval = null;
const date = new Date().getDate();

// Functions

function anaString() {
  const score = perpetualMode? "(Endurance) ☑️"+wordsCompleted : '#'+date.toString()+ " ⏲️"+formatTimer(timer)+' 🙁'+orphans.toString();
  return ("ANAGRAB "+score);
}

function myTimer () {
  timer++;
  document.getElementById('timer').innerHTML = formatTimer(timer);
}

function loadDict() {
  words = dict[date-1];
}

function formatTimer(seconds){
  return (seconds < 60 ? seconds.toLocaleString('en-us',{minimumIntegerDigits:2}) : (Math.floor(seconds/60).toLocaleString('en-us',{minimumIntegerDigits:2}) + ":" + (seconds%60).toLocaleString('en-us',{minimumIntegerDigits:2})));
}

function initWord(str) { // set up a new word on the page
  currentWord = str;
  for (let i =0;i<str.length;i++) {
    let squareBox = document.createElement('div'); // setup box for tile
    squareBox.className = 'empty-box';

    let letterTile = document.createElement('div'); // setup tile
    letterTile.className = 'letter-box';
    letterTile.innerHTML = str[i];
    letterTile.id = i;
    letterTile.setAttribute("draggable","true");
    letterTile.setAttribute("ondragstart","drag(event)");
    
    letterTile.addEventListener("click", function () { // enable click to move tile
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
  
  let allBlanks = Array.from(document.querySelectorAll('.empty-box'));
  allBlanks.forEach(b=>{
    b.setAttribute("ondrop","drop(event)");
    b.setAttribute("ondragover","allowDrop(event)");
  });
}

function fetchWord() {
  perpetualMode ? randWord() : initWord(words.pop());
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
  if (bool) {
    clearTiles();
    if (isEmpty()) {
      perpetualMode? perpetualRefresh() : refresh();
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

function countTiles () { 
  return document.querySelectorAll('.letter-box').length;
}

function isEmpty () { // have all our word's tiles been used?
  return (countTiles()==0);
}

function randWord () { // interact with server to get random word
  fetch('/randword/', {
    method: 'GET',

  }).then(response => response.json())
    .then(response => 
      initWord(response.random))
}

function endPerpetual() {
  document.getElementById('description').innerHTML = anaString();
  clearRows();
  document.getElementById('copy-btn').classList.remove('hidden');
}

function updateText() {
  const updateString = perpetualMode? 'so far: ' + wordsCompleted : ' left to go: ' + words.length;
  document.getElementById('description').innerHTML = 'Words '+updateString;
}

// button UI functions

function beginGame () {
  if (perpetualMode == false){
    loadDict();
    myInterval = setInterval(myTimer,"1000");
  }
  updateText();
  document.querySelector('.timer-score-box').classList.remove("hidden");
  document.getElementById('start-btn').classList.add('hidden');
  document.getElementById('endure-btn').classList.add('hidden');
  fetchWord();
}

function checkWord() { // communicate with backend to see if word exists
  const str = getWord();
  if (str == currentWord) { // keep user from just recycling word
    console.log("Nice try, wise guy");
    logWord(false);
    return false;
  } else if (str.length == 1 && ['a','i','o'].includes(str)) {
    logWord(true);
    return true;
  } else {

  fetch('/checkword/?'+'key='+str, {
    method: 'GET',

  }).then(response => response.json())
    .then(response => {logWord(response.result)});
  }
}

function refresh() { // assess penalty if needed and set up next word; if no next word, end game
  let penalty = countTiles();
  if (penalty>0) {
    timer += penalty * 15;
    orphans += penalty;
    document.getElementById('timer').innerHTML = formatTimer(timer);
  }
  clearRows();
  if (words[0]) {
    updateText();
    fetchWord();  
  } else {
    clearInterval(myInterval);
    document.getElementById('description').innerHTML = anaString();
    document.getElementById('copy-btn').classList.remove('hidden');
  }
}

function perpetualRefresh() {
  wordsCompleted++;
  orphans += countTiles();
  document.getElementById('timer').innerHTML = orphans.toLocaleString('en-us',{minimumIntegerDigits:2});
  clearRows();
  updateText();
  orphans > 4 ? endPerpetual() : fetchWord();
}

// UI


document.getElementById('start-btn').addEventListener('click',beginGame);
document.getElementById('enter-btn').addEventListener('click', checkWord);
document.getElementById('pass-btn').addEventListener('click', function(){ 
  perpetualMode? perpetualRefresh() : refresh()});
document.getElementById('endure-btn').addEventListener('click', function (){
  perpetualMode = true;
  beginGame();
});

document.getElementById('copy-btn').addEventListener('click', function(){
  navigator.clipboard.writeText(document.getElementById('description').innerHTML);
});