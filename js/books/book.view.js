import { BOOK_COLUMNS } from "../constants.js";

const renderBook = (book) =>
  `<div class="bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <img class="rounded-t-lg w-full" src="${book.image}" alt="image de ${
    book.title
  }" />
    </a>
    <div class="p-5">
        <a href="#">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${
              book.title
            }</h5>
        </a>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${
          book.author
        } (${book.published.getFullYear()})</p>
      <button
        data-book-id="${book.isbn}"
        class="update-btn block border text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        type="button"
      >
        Editer
      </button>
    </div>
</div>`;

class BookView {
  constructor(controller) {
    this.controller = controller;
    const modalEl = document.getElementById("modal-edit");
    this.modal = new Modal(modalEl);
  }

  render(data) {
    const booksByStatus = data.reduce((acc, book) => {
      if (!acc[book.status]) {
        acc[book.status] = [];
      }
      acc[book.status].push(book);
      return acc;
    }, {});
    for (const column of BOOK_COLUMNS) {
      const bookList = document.getElementById(`book-list-${column.value}`);
      const bookTab = document.getElementById(`${column.value}-styled-tab`);
      bookList.innerHTML = ""; // Clear existing content
      if (!booksByStatus[column.value]) {
        bookTab.innerHTML = `${column.label} (${0})`;
        bookList.innerHTML = `<p class="text-gray-500">Aucun livre dans cette catégorie.</p>`;
        continue;
      }
      bookTab.innerHTML = `${column.label} (${
        booksByStatus[column.value].length
      })`;
      booksByStatus[column.value].forEach((book) => {
        const bookRow = renderBook(book);
        bookList.insertAdjacentHTML("beforeend", bookRow);
      });
    }
    this.attachEventListeners();
  }

  async initForm(bookId) {
    const bookForm = document.getElementById("book-form");
    const book = await this.controller.getBookById(bookId);
    if (!book) {
      console.error("Book not found:", bookId);
      return;
    }
    const categorySelect = bookForm.querySelector("#category");
    for (const option of categorySelect.options) {
      option.selected = option.value === book.status;
    }
    bookForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(bookForm);
      this.controller.updateBook(bookId, {
        status: formData.get("category"),
      });
      this.modal.hide();
    });
  }

  attachEventListeners() {
    const updateButtons = document.querySelectorAll(".update-btn");
    const closeModalButton = document.getElementById("close-modal-edit");
    const modalEl = document.getElementById("modal-edit");
    const modal = new Modal(modalEl, {
      backdrop: true,
      keyboard: true,
      focus: true,
    });

    updateButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const bookId = event.target.dataset.bookId;
        this.modal.toggle();
        this.initForm(bookId);
      });
    });

    closeModalButton.addEventListener("click", () => {
      this.modal.toggle();
    });
  }
}

export { BookView };
