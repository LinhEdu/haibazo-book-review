import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");

  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  async function fetchBooks() {
    try {
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (err) {
      setError("Cannot load books");
    }
  }

  async function fetchAuthors() {
    try {
      const response = await api.get("/authors");
      setAuthors(response.data);
    } catch (err) {
      setError("Cannot load authors");
    }
  }

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter title");
      return;
    }

    if (!authorId) {
      setError("Please select author");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        author_id: Number(authorId),
      };

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload);
      } else {
        await api.post("/books", payload);
      }

      setTitle("");
      setAuthorId("");
      setEditingBook(null);
      setCurrentPage(1);

      fetchBooks();
      fetchAuthors();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  }

  function handleEdit(book) {
    setEditingBook(book);
    setTitle(book.title);
    setAuthorId(book.author_id);
    setError("");
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/books/${id}`);
      setCurrentPage(1);

      fetchBooks();
      fetchAuthors();
    } catch (err) {
      setError(err.response?.data?.detail || "Cannot delete book");
    }
  }

  function handleCancelEdit() {
    setEditingBook(null);
    setTitle("");
    setAuthorId("");
    setError("");
  }

  const totalPages = Math.ceil(books.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentBooks = books.slice(startIndex, endIndex);

  return (
    <div>
      <div className="page-header">
        <h1>Books</h1>
      </div>

      <div className="card">
        <h2>{editingBook ? "Update Book" : "Create Book"}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Enter book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            >
              <option value="">Select author</option>

              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit">
              {editingBook ? "Update" : "Create"}
            </button>

            {editingBook && (
              <button
                className="btn-secondary"
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Book List</h2>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Title</th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentBooks.map((book, index) => (
              <tr key={book.id}>
                <td>{startIndex + index + 1}</td>
                <td>{book.title}</td>
                <td>{book.author_name}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-warning"
                      onClick={() => handleEdit(book)}
                    >
                      Update
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentBooks.length === 0 && (
              <tr>
                <td colSpan="4">No books found</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default BooksPage;