import axios from "axios";

const API_URL = process.env.STRAPI_URL;

export async function loginUser({ identifier, password }) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/local`, {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        "Server responded with an error:",
        error.response.status,
        error.response.data
      );
      throw error;
    }
  }
}

export async function registerUser({ username, email, password }) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/local/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        "Server responded with an error:",
        error.response.status,
        error.response.data
      );
      throw error;
    }
  }
}
