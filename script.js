const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const calculator = document.querySelector(".calculator");

let lastResult = "";

function appendValue(value) {

  if (/[\+\-\*\/\.]/.test(value) && /[\+\-\*\/\.]$/.test(display.value)) return;

  if (value === ".") {
    const parts = display.value.split(/[\+\-\*\/]/);
    if (parts[parts.length - 1].includes(".")) return;
  }

  display.value += value;
}

function calculate() {
  try {
    const result = eval(display.value);
    if (result === undefined) return;
    lastResult = display.value + " = " + result;
    display.value = result;
    showHistory();
  } catch {
    display.value = "Error";
  }
}

function showHistory() {
  let history = document.getElementById("history");
  if (!history) {
    history = document.createElement("div");
    history.id = "history";
    history.style.marginTop = "10px";
    history.style.fontSize = "1rem";
    history.style.color = "#94a3b8";
    calculator.appendChild(history);
  }
  history.textContent = lastResult;
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;
    const action = btn.dataset.action;

    if (action === "clear") {
      display.value = "";
      return;
    }

    if (action === "del") {
      display.value = display.value.slice(0, -1);
      return;
    }

    if (value === "=") {
      calculate();
      return;
    }

    appendValue(value);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendValue(e.key);
  if (["+", "-", "*", "/"].includes(e.key)) appendValue(e.key);
  if (e.key === ".") appendValue(".");
  if (e.key === "Enter") calculate();
  if (e.key === "Backspace") display.value = display.value.slice(0, -1);
  if (e.key === "Escape") display.value = "";
});
