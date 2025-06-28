import { BookModel } from "./book.model.js";
import { BookView } from "./book.view.js";

class BookErrorController extends Error {
  constructor(message, options) {
    super(message, options);
  }
}

class BookController {
  constructor() {
    this.view = new BookView(this);
  }

  async getBooks() {
    try {
      let data;
      const localBooks = localStorage.getItem("books");
      if (localBooks) {
        data = JSON.parse(localBooks);
        return data.map(
          (book) =>
            new BookModel({
              ...book,
              published: new Date(book.published),
            })
        );
      } else {
        const response = await fetch(
          "https://keligmartin.github.io/api/books.json"
        );
        if (!response.ok) {
          throw new BookErrorController("Impossible de récupérer les livres", {
            cause: new Error(
              `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
            ),
          });
        }
        data = JSON.parse(await response.text());
      }

      const books = data.map(
        (book) =>
          new BookModel({
            title: book.title,
            author: book.author,
            published: new Date(book.published),
            image: book.image,
            isbn: book.isbn,
            pages: book.pages,
            description: book.description,
            publisher: book.publisher,
            subtitle: book.subtitle,
            website: book.website,
          })
      );
      localStorage.setItem("books", JSON.stringify(books));
      return books;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw new BookErrorController(
        "Une erreur s'est produite lors de la récupération des livres.",
        { cause: error }
      );
    }
  }

  async getBookById(bookId) {
    try {
      const books = await this.getBooks();
      const book = books.find((book) => book.isbn === bookId);
      if (!book) {
        throw new BookErrorController("Livre non trouvé");
      }
      return book;
    } catch (error) {
      console.error("Error fetching book by ID:", error);
      throw new BookErrorController(
        "Une erreur s'est produite lors de la récupération du livre.",
        { cause: error }
      );
    }
  }

  async updateBook(bookId, bookData) {
    try {
      const books = await this.getBooks();
      const bookIndex = books.findIndex((book) => book.isbn === bookId);
      if (bookIndex === -1) {
        throw new BookErrorController("Livre non trouvé");
      }
      books[bookIndex] = { ...books[bookIndex], ...bookData };
      localStorage.setItem("books", JSON.stringify(books));
      this.view.render(books);
    } catch (error) {
      console.error("Error updating book:", error);
      throw new BookErrorController(
        "Une erreur s'est produite lors de la mise à jour du livre.",
        { cause: error }
      );
    }
  }
}

export { BookController };
