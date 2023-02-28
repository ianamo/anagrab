import {dict} from "./words.js";
let words = [];
let row = document.getElementById('word-row');
let entry = document.getElementById('entry-row');
let timer = 0;
let orphans = 0;
let currentWord = "";
var myInterval = null;

// Functions

function newWord() { // get a new word from the stack, or else game is over
  currentWord = words.pop();
  return currentWord;
}

function loadDict() {
  const day = new Date().getDate();
  words = dict[day-1];
}

function formatTimer(seconds){
  return (seconds < 60 ? seconds.toLocaleString('en-us',{minimumIntegerDigits:2}) : (Math.floor(seconds/60).toLocaleString('en-us',{minimumIntegerDigits:2}) + ":" + (seconds%60).toLocaleString('en-us',{minimumIntegerDigits:2})));
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
  var allBlanks = document.querySelectorAll('.empty-box'); // all boxes need drag & drop functions
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

function countTiles () { 
  return document.querySelectorAll('.letter-box').length;
}

function refresh() { // assess penalty if needed and set up next word; if no next word, end game
  console.log("refresh");
  let penalty = countTiles();
  if (penalty>0) {
    timer += penalty * 15;
    orphans += penalty;
    document.getElementById('timer').innerHTML = formatTimer(timer);
  }
  clearRows();
  if (words[0]) {
    initWord(newWord());  
  } else {
    clearInterval(myInterval);
    document.getElementById('description').innerHTML = "Your time was: "+formatTimer(timer)+'. You had '+orphans+' orphan tiles, for a total penalty of '+(orphans*15).toString()+' penalty seconds.';
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
  return (countTiles()==0);
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

// game setup functions

function myTimer () {
  timer++;
  document.getElementById('timer').innerHTML = formatTimer(timer);
}

function beginGame () {
  loadDict();
  document.querySelector('.timer-score-box').classList.remove("hidden");
  document.getElementById('start-btn').classList.add('hidden');
  initWord(newWord());
  myInterval = setInterval(myTimer,"1000");
}



// UI

document.getElementById('start-btn').addEventListener('click',beginGame);
document.getElementById('enter-btn').addEventListener('click', checkWord);
document.getElementById('pass-btn')passButton.addEventListener('click', refresh);