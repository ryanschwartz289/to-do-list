const completedButtons = document.querySelectorAll(".item-button");
const itemsContainer = document.getElementById("items-container");
const duplicateBtn = document.getElementById("new-item-button");
let noItems = document.querySelector(".no-items");

// Create template item programmatically instead of querying and removing
const originalItem = document.createElement("div");
originalItem.className = "item";
originalItem.innerHTML = `
  <button class="item-button" type="button" title="Mark Completed"></button>
  <input type="text" name="item" class="input" autocomplete="off"/>
`;

function checkNoItems() {
  const items = document.querySelector(".item");
  if (!items) {
    noItems.hidden = false;
  }
}

/**
 * Toggles the completion state of a reminder item.
 * If the item is marked complete and has text, it will be removed after 3 seconds.
 * If the item is blank, it will be removed immediately.
 * Allows undo by clicking again within 3 seconds.
 *
 * @param {HTMLButtonElement} button - The button that was clicked to trigger the completion.
 */
function completeItem(button) {
  const div = button.parentElement;
  const input = div.querySelector("input");

  const isCompleted = button.style.backgroundColor === "grey";

  if (isCompleted) {
    // Undo completion
    button.style.backgroundColor = "transparent";
    div.style.opacity = 1;
    clearTimeout(div.dataset.deleteTimeout);
  } else {
    // Mark completed
    button.style.backgroundColor = "grey";
    div.style.opacity = 0.5;

    if (input.value.trim() === "") {
      // Blank textarea: delete immediately
      div.remove();
    } else {
      // Non-blank textarea: wait 3 seconds before deleting
      const timeoutId = setTimeout(() => {
        div.remove();
      }, 2000);

      div.dataset.deleteTimeout = timeoutId;
    }
  }
  checkNoItems();
}

/**
 * Deletes the last item with class `.item` if its input field is empty.
 */
function deleteLastItem() {
  let allItems = document.querySelectorAll(".item");
  const lastItem = allItems[allItems.length - 1];
  if (lastItem && lastItem.querySelector("input").value === "") {
    lastItem.remove();
  }
  allItems = document.querySelectorAll(".item");
  const focusItem = allItems[allItems.length - 1];
  if (focusItem) {
    focusItem.querySelector("input").focus({ preventScroll: true });
  }
  checkNoItems();
}

/**
 * Duplicates the original `.item` element, resets its input and button state,
 * attaches necessary event listeners, appends it to the container,
 * and focuses the new input without scrolling the page.
 */
function duplicateItem() {
  noItems.hidden = true;
  const clone = originalItem.cloneNode(true);

  const clonedInput = clone.querySelector("input");
  clonedInput.value = "";

  const clonedButton = clone.querySelector(".item-button");
  clonedButton.style.backgroundColor = "transparent";
  clonedButton.addEventListener("click", () => completeItem(clonedButton));

  itemsContainer.appendChild(clone);

  setTimeout(() => {
    clonedInput.focus({ preventScroll: true });
  }, 0);
}

function handleKeyClick(event) {
  switch (event.key) {
    case "Backspace":
      deleteLastItem();
      break;
    case "ArrowUp":
    case "ArrowDown":
      event.preventDefault();
      const allInputs = Array.from(document.querySelectorAll(".input"));
      const currentInput = document.activeElement;
      const currentIndex = allInputs.indexOf(currentInput);

      if (currentIndex === -1) return;
      const newIndex =
        event.key === "ArrowUp"
          ? Math.max(0, currentIndex - 1)
          : Math.min(allInputs.length - 1, currentIndex + 1);

      allInputs[newIndex].focus({ preventScroll: true });
      break;
  }
}

duplicateBtn.addEventListener("click", duplicateItem);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    duplicateItem();
  }
});

// Replace the three separate event listeners with this single one
document.addEventListener("keydown", (event) => handleKeyClick(event));

completedButtons.forEach((button) => {
  button.addEventListener("click", () => completeItem(button));
});
