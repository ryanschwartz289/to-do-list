//* Defining variables
const completedButtons = document.querySelectorAll(".item-button");
const itemsContainer = document.getElementById("items-container");
const duplicateBtn = document.getElementById("new-item-button");
const deleteAllItemsButton = document.getElementById("trash-all-button");
const noItems = document.querySelector(".no-items");

// Create template item programmatically instead of querying and removing
const originalItem = document.createElement("div");
originalItem.className = "item";
originalItem.innerHTML = `
  <button class="item-button" type="button" title="Mark Completed"></button>
  <input type="text" name="item" class="input" autocomplete="off"/>
`;

function checkNoItems() {
  const items = document.querySelectorAll(".item");
  noItems.hidden = items.length > 0;
}

//* Creating functions

/**
 * Saves all current to-do items to localStorage.
 *
 * Each item is stored as an object with the following structure:
 *
 *
 * {
 *   text: string,           // The text entered in the input field
 *
 *   isCompleted: boolean    // Whether the item is marked as completed
 * }
 *
 *
 * Completion is determined by whether the item's button has a grey background.
 */
function saveItems() {
  const items = Array.from(document.querySelectorAll(".item")).map((item) => ({
    text: item.querySelector("input").value,
    isCompleted:
      item.querySelector(".item-button").style.backgroundColor === "grey",
  }));
  localStorage.setItem("todoItems", JSON.stringify(items));
}

/**
 * Loads to-do items from localStorage and restores them to the DOM.
 *
 * For each saved item, it:
 * - Clones a base item element (`originalItem`)
 * - Sets the text and completion state
 * - Adds event listeners to the item's button
 * - Appends the item to the `itemsContainer`
 *
 * Also hides the `noItems` message if any items were loaded.
 *
 * Assumes the following variables are defined globally:
 * - `originalItem`: HTMLElement used as a template for new items
 * - `itemsContainer`: HTMLElement where items will be appended
 * - `noItems`: HTMLElement that shows a "no items" message
 * - `completeItem(button)`: Function to handle item completion logic
 */
function loadItems() {
  try {
    const savedItems = localStorage.getItem("todoItems");

    if (savedItems) {
      const items = JSON.parse(savedItems);
      items.forEach((item) => {
        const newItem = originalItem.cloneNode(true);
        const input = newItem.querySelector("input");
        const button = newItem.querySelector(".item-button");

        input.value = item.text;

        if (item.isCompleted) {
          button.style.backgroundColor = "grey";
          newItem.style.opacity = 0.5;
        }

        button.addEventListener("click", () => completeItem(button));
        itemsContainer.appendChild(newItem);
      });
    }
  } catch (e) {
    window.alert("Could not access localStorage:", e);
  }

  checkNoItems(); // Always run this regardless of success or failure
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
      // Blank input: delete immediately
      div.remove();
    } else {
      // Non-blank input: wait 2 seconds before deleting
      const timeoutId = setTimeout(() => {
        div.remove();
      }, 2000);

      div.dataset.deleteTimeout = timeoutId;
    }
  }
  checkNoItems();
  saveItems(); // Add this line
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
  saveItems(); // Add this line
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
  saveItems(); // Add this line
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

function deleteAllItems() {
  if (window.confirm("Are you sure you would like to delete all items?")) {
    const allItems = document.querySelectorAll(".item");
    allItems.forEach((item) => item.remove());
    noItems.hidden = false;
    deleteAllItemsButton.blur();
  }
}

//* Adding event listeners

duplicateBtn.addEventListener("click", duplicateItem);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    duplicateItem();
  }
});
deleteAllItemsButton.addEventListener("click", () => deleteAllItems());

document.addEventListener("keydown", (event) => handleKeyClick(event));

completedButtons.forEach((button) => {
  button.addEventListener("click", () => completeItem(button));
});

// Load items from localStorage when the page is loaded
document.addEventListener("DOMContentLoaded", loadItems);
// Save items to localStorage whenever the items are updated
const observer = new MutationObserver(saveItems);
observer.observe(itemsContainer, { childList: true, subtree: true });

// Add this with your other event listeners
document.addEventListener("input", (event) => {
  if (event.target.classList.contains("input")) {
    saveItems();
  }
});
