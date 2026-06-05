import axios from "axios";

const api = axios.create({
  baseURL: "https://haibazo-book-review-9f4c.onrender.com",
});

export default api;