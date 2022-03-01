const keyboard = document.querySelector(".keyboard-container");
const board = document.querySelector(".board-container");
const messageContainer = document.querySelector(".message-container");
const pointsContainer = document.querySelector("#points");
const gamesWonContainer = document.querySelector(".games-won");
const resetButton = document.querySelector(".reset-button");
resetButton.addEventListener("click", () => {
  window.location.reload();
});

const keyboardArray = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "ENTER",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  "<<",
];

let wordle;

const getWord = () => {
  fetch("http://localhost:8000/word")
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      wordle = json.toUpperCase();
    })
    .catch((err) => console.log(err));
};

getWord();

const boardArray = [
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

let currentRow = 0;
let currentTile = 0;
let points = localStorage.getItem("points") ?? 0;
let gamesWon = localStorage.getItem("games-won") ?? 0;
let gameOver = false;

pointsContainer.innerHTML = "Score: " + points;
gamesWonContainer.textContent = "Games Won: " + gamesWon;

boardArray.forEach((guessRow, rowIndex) => {
  const row = document.createElement("div");
  row.setAttribute("id", "row-" + rowIndex);
  guessRow.forEach((guess, guessIndex) => {
    const rowTile = document.createElement("div");
    rowTile.setAttribute("id", "row-" + rowIndex + "-tile-" + guessIndex);
    rowTile.classList.add("tile");
    row.append(rowTile);
  });
  board.append(row);
});

keyboardArray.forEach((key) => {
  const button = document.createElement("button");
  button.textContent = key;
  button.setAttribute("id", key);
  button.addEventListener("click", () => handleClick(key));
  keyboard.append(button);
});

const handleClick = (letter) => {
  console.log("clicked", letter);
  if (letter === "ENTER") {
    checkRow();
    return;
  }
  if (letter === "<<") {
    deleteLetter();
    return;
  }
  addLetter(letter);
};

const checkRow = () => {
  const message = document.createElement("div");
  if (currentTile === 5) {
    const guess = boardArray[currentRow].join("");

    if (guess === wordle) {
      checkTile();
      gamesWon++;
      points = +points + 200;
      localStorage.removeItem("points");
      localStorage.removeItem("games-won");
      localStorage.setItem("points", points);
      localStorage.setItem("games-won", gamesWon);
      message.textContent = "You've got it! Well done";
      messageContainer.append(message);
      setTimeout(() => {
        resetButton.classList.remove("hidden");
        resetButton.classList.add("fadeIn");
        messageContainer.firstChild.remove();
      }, 2000);
      gameOver = true;
    } else if (currentRow >= 5) {
      gameOver = true;
      message.textContent = "Game over, the word was " + wordle;
      messageContainer.append(message);
      resetButton.classList.remove("hidden");
      resetButton.classList.add("fadeIn");
    } else {
      checkTile();
      currentRow++;
      currentTile = 0;
    }
  }
};

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(
      "row-" + currentRow + "-tile-" + currentTile
    );
    tile.textContent = "";
    tile.setAttribute("data", "");
  }
};

const addLetter = (letter) => {
  if (currentTile < 5) {
    const tile = document.getElementById(
      "row-" + currentRow + "-tile-" + currentTile
    );
    tile.textContent = letter;
    boardArray[currentRow][currentTile] = letter;
    currentTile++;
  }
};

const checkTile = () => {
  const rowLetters = document.querySelector("#row-" + currentRow).childNodes;
  let LetterWordle = wordle;
  const guesses = [];

  rowLetters.forEach((letters) => {
    guesses.push({ letter: letters.textContent, colour: "gray-word" });
  });

  guesses.forEach((guess, index) => {
    if (guess.letter === wordle[index]) {
      guess.colour = "green-word";
      LetterWordle = LetterWordle.replace(guess.letter, "");
    }
  });

  guesses.forEach((guess) => {
    if (LetterWordle.includes(guess.letter) && guess.colour !== "green-word") {
      guess.colour = "yellow-word";
      LetterWordle = LetterWordle.replace(guess.letter, "");
    }
  });

  rowLetters.forEach((letter, index) => {
    setTimeout(() => {
      letter.classList.add("bounce");
      letter.classList.add(guesses[index].colour);
    }, 500 * index);
  });
};
