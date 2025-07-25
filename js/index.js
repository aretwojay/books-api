import { BookController } from "./books/book.controller.js";

const bookController = new BookController();

async function init() {
  const books = await bookController.getBooks();
  bookController.view.renderBooks(books);
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error("Error rendering books:", error);
    bookController.view.displayToast(error.message, "danger");
  });
});
