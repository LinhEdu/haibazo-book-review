import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState("");
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  async function fetchAuthors() {
    try {
      const response = await api.get("/authors");
      setAuthors(response.data);
    } catch (err) {
      setError("Cannot load authors");
    }
  }

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter name");
      return;
    }

    try {
      if (editingAuthor) {
        await api.put(`/authors/${editingAuthor.id}`, {
          name: name.trim(),
        });
      } else {
        await api.post("/authors", {
          name: name.trim(),
        });
      }

      setName("");
      setEditingAuthor(null);
      setCurrentPage(1);
      fetchAuthors();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  }

  function handleEdit(author) {
    setEditingAuthor(author);
    setName(author.name);
    setError("");
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this author?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/authors/${id}`);
      setCurrentPage(1);
      fetchAuthors();
    } catch (err) {
      setError(err.response?.data?.detail || "Cannot delete author");
    }
  }

  function handleCancelEdit() {
    setEditingAuthor(null);
    setName("");
    setError("");
  }

  const totalPages = Math.ceil(authors.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentAuthors = authors.slice(startIndex, endIndex);

  return (
    <div>
      <div className="page-header">
        <h1>Authors</h1>
      </div>

      <div className="card">
        <h2>{editingAuthor ? "Update Author" : "Create Author"}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Enter author name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button className="btn-primary" type="submit">
              {editingAuthor ? "Update" : "Create"}
            </button>

            {editingAuthor && (
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
        <h2>Author List</h2>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Books</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentAuthors.map((author, index) => (
              <tr key={author.id}>
                <td>{startIndex + index + 1}</td>
                <td>{author.name}</td>
                <td>{author.books_count}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-warning"
                      onClick={() => handleEdit(author)}
                    >
                      Update
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(author.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentAuthors.length === 0 && (
              <tr>
                <td colSpan="4">No authors found</td>
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

export default AuthorsPage;