const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

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
      try {
        display.value = eval(display.value) || "";
      } catch {
        display.value = "Error";
      }
      return;
    }

    // Evita escribir operadores duplicados
    if (/[\+\-\*\/\.]/.test(value) && /[\+\-\*\/\.]$/.test(display.value)) {
      return;
    }

    display.value += value;
  });
});
