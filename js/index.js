import { BookController } from "./books/book.controller.js";

async function init() {
  const bookController = new BookController();
  const books = await bookController.getBooks();
  bookController.view.render(books);
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error("Error rendering books:", error);
    alert("Une erreur s'est produite lors du chargement des livres.");
  });
});
