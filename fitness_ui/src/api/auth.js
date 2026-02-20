import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// LOGIN
export const loginUser = async (formData) => {
  const response = await API.post("/login", formData);
  return response.data;
};

// REGISTER (optional, later)
export const registerUser = async (formData) => {
  const response = await API.post("/register", formData);
  return response.data;
};
