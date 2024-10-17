// src/utils/auth.js
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export function getUser() {
  const token = Cookies.get("token");
  console.log("Token from cookies:", token);
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded);
      return {
        id: decoded.userId,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Invalid token:", error);
      console.error("Invalid token:", error);
      return null;
    }
  }
  return null;
}

export function clearUser() {
  // Remove the token cookie
  Cookies.remove("token");
}
