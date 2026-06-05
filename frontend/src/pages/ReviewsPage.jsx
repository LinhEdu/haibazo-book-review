import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);

  const [bookId, setBookId] = useState("");
  const [content, setContent] = useState("");

  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  async function fetchReviews() {
    try {
      const response = await api.get("/reviews");
      setReviews(response.data);
    } catch (err) {
      setError("Cannot load reviews");
    }
  }

  async function fetchBooks() {
    try {
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (err) {
      setError("Cannot load books");
    }
  }

  useEffect(() => {
    fetchReviews();
    fetchBooks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!bookId) {
      setError("Please select book");
      return;
    }

    if (!content.trim()) {
      setError("Please enter review");
      return;
    }

    try {
      const payload = {
        book_id: Number(bookId),
        content: content.trim(),
      };

      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, payload);
      } else {
        await api.post("/reviews", payload);
      }

      setBookId("");
      setContent("");
      setEditingReview(null);
      setCurrentPage(1);

      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  }

  function handleEdit(review) {
    setEditingReview(review);
    setBookId(review.book_id);
    setContent(review.content);
    setError("");
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/reviews/${id}`);
      setCurrentPage(1);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.detail || "Cannot delete review");
    }
  }

  function handleCancelEdit() {
    setEditingReview(null);
    setBookId("");
    setContent("");
    setError("");
  }

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentReviews = reviews.slice(startIndex, endIndex);

  return (
    <div>
      <div className="page-header">
        <h1>Reviews</h1>
      </div>

      <div className="card">
        <h2>{editingReview ? "Update Review" : "Create Review"}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">Select book</option>

              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <textarea
              placeholder="Enter review"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit">
              {editingReview ? "Update" : "Create"}
            </button>

            {editingReview && (
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
        <h2>Review List</h2>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Book</th>
              <th>Author</th>
              <th>Review</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentReviews.map((review, index) => (
              <tr key={review.id}>
                <td>{startIndex + index + 1}</td>
                <td>{review.book_title}</td>
                <td>{review.author_name}</td>
                <td>{review.content}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-warning"
                      onClick={() => handleEdit(review)}
                    >
                      Update
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentReviews.length === 0 && (
              <tr>
                <td colSpan="5">No reviews found</td>
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

export default ReviewsPage;