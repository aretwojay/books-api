import { BOOK_COLUMNS } from "../constants.js";

class BookModel {
  constructor({
    isbn = "Unknown ISBN",
    pages = 0,
    title = "Unknown Title",
    author = "Unknown Author",
    description = "No description available",
    published = new Date(),
    publisher = "Unknown Publisher",
    subtitle = "No subtitle",
    website = "https://example.com",
    status = "unread",
    rating = null,
    comment = "",
  }) {
    this.title = title;
    this.author = author;
    this.published = published;
    this.image = `https://placehold.co/600x400?text=${encodeURIComponent(
      title
    )}`;
    this.isbn = isbn;
    this.pages = pages;
    this.description = description;
    this.publisher = publisher;
    this.subtitle = subtitle;
    this.website = website;
    this.status = status;
    this.rating = rating;
    this.comment = comment;
  }

  getDetails() {
    return `${this.title} by ${
      this.author
    }, published in ${this.published.getFullYear()}`;
  }

  getReadableStatus() {
    return BOOK_COLUMNS.find((column) => column.value === this.status)
      ? BOOK_COLUMNS.find((column) => column.value === this.status).label
      : "Unknown Status";
  }
}

export { BookModel };
