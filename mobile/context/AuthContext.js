import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { API_URL } from "../utils/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (firstName, lastName, email, phone, password, location) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          location,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }
      set({isLoading: false });
      return { success: true };
    } catch (error) {
      console.log("Registration error:", error);
      set({ isLoading: false });
      return { success: false, error: error.message || "Something went wrong" };
    } finally {
      set({ isLoading: false });
    }
  },
 login: async (email, password) => {
  try {
    set({ isLoading: true, isCheckingAuth: true });

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      set({ isLoading: false, isCheckingAuth: false });
      return { success: false, error: data.message };
    }

    // Save token + user
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    console.log("Login successful - User data:", data.user);
    console.log("Login successful - User role:", data.user.role);

    set({
      user: data.user,
      token: data.token,
      isLoading: false,
      isCheckingAuth: false,
    });

    return { success: true };
  } catch (error) {
    console.log("Login error:", error);
    set({ isLoading: false, isCheckingAuth: false });
    return { success: false, error: error.message };
  }
},

  AuthedicatedUser: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      console.log("AuthedicatedUser - Retrieved user:", user);
      console.log("AuthedicatedUser - User role:", user?.role);
      console.log("AuthedicatedUser - Token exists:", !!token);

      set({ user, token });
    } catch (error) {
      console.log("Authentication error:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ user: null, token: null });
    } catch (error) {
      console.log("Logout error:", error);
    }
  },
}));
