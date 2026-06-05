import { NavLink, Route, Routes } from "react-router-dom";
import AuthorsPage from "./pages/AuthorsPage";
import BooksPage from "./pages/BooksPage";
import ReviewsPage from "./pages/ReviewsPage";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HAIBAZO</h2>
        <p>Book Review</p>

        <nav>
          <NavLink to="/" end>
            Authors
          </NavLink>

          <NavLink to="/books">
            Books
          </NavLink>

          <NavLink to="/reviews">
            Reviews
          </NavLink>
        </nav>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<AuthorsPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;