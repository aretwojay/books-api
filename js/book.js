import { BookController } from "./books/book.controller.js";

const bookController = new BookController();

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("isbn");
  const book = await bookController.getBookById(id);
  bookController.view.renderSingleBook(book);
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error("Error rendering books:", error);
    bookController.view.displayToast(error.message, "danger");
  });
});
