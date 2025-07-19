import { BOOK_COLUMNS } from "../constants.js";

const renderBook = (book) =>
  `<div class="bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <a href="/book.html?isbn=${book.isbn}">
        <img class="rounded-t-lg w-full" src="${book.image}" alt="image de ${
    book.title
  }" />
    </a>
    <div class="p-5">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">${
              book.title
            }</h5>
        <p class="mb-3 font-normal text-white line-clamp-2">${
          book.rating ? `Note : ${book.rating}` : "Non noté"
        }</p>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-2">${
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

const renderBookDetails = (book) =>
  `
      <h1 class="text-3xl font-bold mb-4">Titre : ${book.title}</h1>
            <img src="${book.image}" alt="${
    book.title
  }" class="mb-4 rounded-lg w-full object-cover h-64">
      <p class="text-gray-700 mb-2"><strong>Statut :</strong> ${book.getReadableStatus()}</p>
      <p class="text-gray-700 mb-2"><strong>Votre note :</strong> ${
        book.rating || "Non noté"
      }</p>
      <p class="text-gray-700 mb-2"><strong>Commentaire :</strong> ${
        book.comment || "Aucun commentaire"
      }</p>
      <p class="text-gray-700 mb-2"><strong>ISBN:</strong> ${book.isbn}</p>
      <p class="text-gray-700 mb-2"><strong>Sous-titre:</strong> ${
        book.subtitle
      }</p>
      <p class="text-gray-700 mb-2"><strong>Auteur:</strong> ${
        book.author
      } (${book.published.getFullYear()})</p>
      <p class="text-gray-600 mb-4"><strong>Description :</strong> ${
        book.description
      }</p>
      <p class="text-gray-600 mb-4"><strong>Éditeur :</strong> ${
        book.publisher
      }</p>
      <p class="text-gray-600 mb-4"><strong>Pages :</strong> ${book.pages}</p>
      <a href="${
        book.website
      }" target="_blank" class="text-gray-500 hover:underline font-bold">Site web</a>
    `;

class BookView {
  constructor(controller) {
    this.controller = controller;
    const modalEl = document.getElementById("modal-edit");
    this.modal = modalEl ? new Modal(modalEl) : null;
  }

  renderBooks(data) {
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
      if (!bookList || !bookTab) {
        console.error(`Element not found for column: ${column.value}`);
        continue;
      }
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
    this.initBookForm();
  }

  renderSingleBook(book) {
    if (!book) {
      this.displayToast("Livre non trouvé", "danger");
      return;
    }
    const bookDetails = document.getElementById("book-details");
    bookDetails.innerHTML = renderBookDetails(book);
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
    const ratingInput = bookForm.querySelector("#counter-input");
    const commentInput = bookForm.querySelector("#comment");
    ratingInput.value = book.rating || "";
    commentInput.value = book.comment || "";
    for (const option of categorySelect.options) {
      option.selected = option.value === book.status;
    }
    bookForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(bookForm);
      this.controller.updateBook(bookId, {
        status: formData.get("category"),
        rating: formData.get("rating"),
        comment: formData.get("comment"),
      });
      this.displayToast("Livre mis à jour avec succès !");
      this.modal.hide();
    });
  }

  async initBookForm() {
    const addBookBtn = document.getElementById("add-book-button");

    if (!addBookBtn) {
      console.error("Add book button not found");
      return;
    }
    addBookBtn.addEventListener("click", () => {
      const bookForm = document.getElementById("add-book-form");
      if (!bookForm) {
        console.error("Add book form not found");
        return;
      }
      const formData = new FormData(bookForm);
      this.controller.addBook(Object.fromEntries(formData.entries()));
      this.displayToast("Livre ajouté avec succès !");
    });
  }

  displayToast(message, type = "success") {
    const toastType = type === "success" ? "success" : "danger";
    const toastContent = document.getElementById(`toast-${toastType}-content`);
    const toastElement = document.getElementById(`toast-${toastType}`);

    toastContent.textContent = message;
    toastElement.classList.remove("opacity-0");
    toastElement.classList.remove("hidden");

    const toast = new Dismiss(toastElement);
    setTimeout(() => {
      toast.hide();
    }, 3000);
  }

  attachEventListeners() {
    const updateButtons = document.querySelectorAll(".update-btn");
    const closeModalButton = document.getElementById("close-modal-edit");

    updateButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("isbn");
        const bookId = event.target.dataset.bookId || id;
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
