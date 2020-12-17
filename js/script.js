"use strict";
class Calculator {
  // constructor
  constructor() {
    (this.expression = []), (this.result = 0);
  }

  // utility functions
  isNumber(n) {
    // if n is a number, Number(n) equates to the number, and not NaN
    // if n is an operator (e.g. '.' or '*'), Number(n) equates to NaN
    return !Object.is(NaN, Number(n)) || n !== n;
  }

  // cleans the expression's items
  cleanExpression(expr) {
    let exprCpy = expr.slice();
    for (let i = 0; i < exprCpy.length; ++i) {
      if (this.isNumber(exprCpy[i])) {
        // clean up the number by removing trailing zeroes
        // and place parenthesis around number
        // so powering negative numbers doesn't cause error
        exprCpy[i] = `( ${Number(exprCpy[i])} )`;
      } else {
        if (exprCpy[i] === "-") {
          // if there are two consecutive negative signs
          if (i < exprCpy.length && exprCpy[i + 1] < 0) {
            // convert "- -x" to "+ x"
            exprCpy[i] = "+";
            exprCpy[i + 1] *= -1;
          }
        } else if (exprCpy[i] === "^") {
          // set power of to eval() equivalent
          exprCpy[i] = "**";
        }
      }
    }
    return exprCpy;
  }

  // clear expression array and result
  clearAll() {
    this.expression.length = 0;
    this.result = 0;
  }
  // clear last variable / operator
  clearLast() {
    return this.expression.pop();
  }
  // check if current expression is valid
  isValidExpression() {
    let shouldBeNumber = true;
    for (let i = 0, len = this.expression.length; i < len; ++i) {
      if (shouldBeNumber) {
        // if current isn't a number
        if (!this.isNumber(this.expression[i])) {
          return false;
        }
        shouldBeNumber = false;
      } else {
        // if current is a number
        if (this.isNumber(this.expression[i])) {
          return false;
        }
        shouldBeNumber = true;
      }
    }
    // if last value is a number, expression is complete
    return this.isNumber(this.expression[this.expression.length - 1]);
  }
  // evaluates the expression array, expression array becomes result
  evaluate() {
    if (this.isValidExpression()) {
      this.result = Number(
        eval(this.cleanExpression(this.expression).join("")).toFixed(5)
      );
      this.expression.length = 0;
      this.expression.push(this.result);
    }
  }
  // retrieves last input of expression array
  lastInput() {
    return this.expression[this.expression.length - 1];
  }
  // sets last input of expression array
  setLastInput(value) {
    this.expression[this.expression.length - 1] = value;
  }
  // adds an input (variable or operator) to the expression array if it is valid
  addInput(input) {
    // if the last item of expression array was a variable (number) and input is a string
    if (this.isNumber(this.lastInput()) && !this.isNumber(input)) {
      this.expression.push(input);
    } else if (!this.isNumber(this.lastInput()) && this.isNumber(input)) {
      this.expression.push(input);
    }
  }
  // gets the expression in string form
  getExpression() {
    return this.expression.join("");
  }
  // gets the result
  getResult() {
    return this.result;
  }
  // handles all inputs
  handleInput(input) {
    let inputType = this.isNumber(input) ? "number" : "string",
      lastInput = this.lastInput(),
      lastInputType = this.isNumber(lastInput) ? "number" : "string";

    if (inputType === "number") {
      // if current input and last input are numbers
      if (lastInputType === "number") {
        // if last value of expression is result, clear expression
        // fallback for NaN added
        if (lastInput === this.getResult() || lastInput !== lastInput) {
          this.clearAll();
          this.addInput(input);
        } else {
          // continue adding more digits to last input (current number)
          this.setLastInput(lastInput + input);
        }
      } else {
        this.addInput(input);
      }
    } else if (inputType === "string") {
      // if user wants to evaluate expression
      if (input === "=") {
        this.evaluate();
      } else if (input === ".") {
        // only allow a decimal point if last input is a number with no decimal point
        // and last input isn't result
        if (
          lastInputType === "number" &&
          lastInput !== this.getResult() &&
          lastInput.indexOf(".") === -1
        ) {
          this.setLastInput(lastInput + ".");
        }
      } else if (input === "AC") {
        this.clearAll();
      } else if (input === "CE") {
        this.clearLast();
      } else if (input === "±") {
        // if last input was a number, change last input to its additive inverse / opposite
        if (this.isNumber(lastInput)) {
          this.setLastInput(lastInput * -1);
        }
      } else {
        // an operator was pressed
        this.addInput(input);
      }
    }
  }
}

// returns the value of key pressed by user
const getKeyPressed = (keycode, isShifting) => {
  const keys = {
      8: "CE",
      13: "=",
      46: "CE",
      48: "0",
      49: "1",
      50: "2",
      51: "3",
      52: "4",
      53: "5",
      54: "6",
      55: "7",
      56: "8",
      57: "9",
      61: "=",
      65: "AC",
      67: "CE",
      96: "0",
      97: "1",
      98: "2",
      99: "3",
      100: "4",
      101: "5",
      102: "6",
      103: "7",
      104: "8",
      105: "9",
      106: "*",
      107: "+",
      108: "-",
      109: "-",
      110: ".",
      111: "/",
      187: "=",
      189: "-",
      190: ".",
      191: "/",
    },
    shiftKeys = {
      54: "^",
      56: "*",
      187: "+",
    };
  return isShifting ? shiftKeys[keycode] : keys[keycode];
};

const highlight = (button) => {
  if (button) {
    button.classList.toggle("highlight");
    setTimeout(function () {
      button.classList.toggle("highlight");
    }, 200);
  }
};

// variables
const screen = document.getElementById("screen"),
  buttons = document.getElementById("buttons"),
  calculator = new Calculator();

window.addEventListener("keydown", function (e) {
  let keycode = e.keyCode || e.which,
    isShifting = e.shiftKey,
    key = getKeyPressed(keycode, e.shiftKey);
  if (key) {
    highlight(document.querySelector(`[data-id="${key}"]`));
    calculator.handleInput(key);
  }
  screen.textContent = calculator.getExpression();
});

buttons.addEventListener("click", function (e) {
  let key = e.target.getAttribute("data-id");
  if (key) {
    calculator.handleInput(key);
  }
  screen.textContent = calculator.getExpression();
});
