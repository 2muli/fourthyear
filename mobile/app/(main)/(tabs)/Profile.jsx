import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import axios from "axios";
import { API_URL } from "../../../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import i18n from "../../../src/i18n";

export default function ProfileForm() {
  const [profileImage, setProfileImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [editable, setEditable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  });

  const { user, token, isCheckingAuth, AuthedicatedUser, logout } =
    useAuthStore();

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    } else if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });
      setProfileImage(user.profilePicture || null);
    }
  }, [isCheckingAuth, user]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  const pickImage = async () => {
    if (!editable) return;
    Alert.alert("Select Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: launchImageLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const launchImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/Login");
  };

  const handleUpdate = async () => {
    if (!editable) {
      setEditable(true);
      return;
    }
    setIsUpdating(true);
    try {
      const imageDataUri = imageBase64
        ? `data:image/jpeg;base64,${imageBase64}`
        : null;
      const response = await axios.put(
        `${API_URL}/auth/update`,
        { ...form, profilePicture: imageDataUri },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      if (response.data.updatedUser?.profilePicture) {
        setProfileImage(response.data.updatedUser.profilePicture);
      }
      setEditable(false);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const inputBase = `
    p-4 mb-4 rounded-xl border
    ${editable ? "border-green-500" : isDark ? "border-gray-600" : "border-gray-300"}
  `;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-400"} p-4`}
      >
        <View className="items-center mt-4">
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <View className="relative">
                <Image
                  source={{ uri: profileImage }}
                  className={`w-32 h-32 rounded-full border-4 ${
                    editable
                      ? "border-green-600"
                      : isDark
                      ? "border-gray-600"
                      : "border-gray-400"
                  }`}
                />
                {editable && (
                  <View className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                )}
              </View>
            ) : (
              <View
                className={`w-32 h-32 rounded-full ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                } items-center justify-center border-4 ${
                  editable
                    ? "border-green-600"
                    : isDark
                    ? "border-gray-600"
                    : "border-gray-400"
                }`}
              >
                <Ionicons
                  name="person"
                  size={40}
                  color={isDark ? "#9ca3af" : "gray"}
                />
                {editable && (
                  <View className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-6 space-y-4">
          <TextInput
            placeholder="First Name"
            editable={editable}
            value={form.firstName}
            onChangeText={(t) => setForm({ ...form, firstName: t })}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            selectionColor={isDark ? "#22c55e" : "#16a34a"}
            className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} ${inputBase}`}
          />

          <TextInput
            placeholder="Last Name"
            editable={editable}
            value={form.lastName}
            onChangeText={(t) => setForm({ ...form, lastName: t })}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            selectionColor={isDark ? "#22c55e" : "#16a34a"}
            className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} ${inputBase}`}
          />

          <TextInput
            placeholder="Email"
            editable={editable}
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            selectionColor={isDark ? "#22c55e" : "#16a34a"}
            className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} ${inputBase}`}
          />

          <TextInput
            placeholder="Phone Number"
            editable={editable}
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            selectionColor={isDark ? "#22c55e" : "#16a34a"}
            className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} ${inputBase}`}
          />

          <TextInput
            placeholder="Location"
            editable={editable}
            value={form.location}
            onChangeText={(t) => setForm({ ...form, location: t })}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            selectionColor={isDark ? "#22c55e" : "#16a34a"}
            className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} ${inputBase}`}
          />

          <TextInput
            placeholder="Created At"
            editable={false}
            value={user?.createdAt ? user.createdAt.split("T")[0] : ""}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            className={`${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"} p-4 mb-4 rounded-xl border ${
              isDark ? "border-gray-600" : "border-gray-300"
            }`}
          />
        </View>

        <TouchableOpacity
          className="mt-6 bg-green-600 p-4 rounded-2xl items-center mb-4"
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              {editable ? i18n.t("SaveChanges") : i18n.t("UpdateProfile")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 p-4 rounded-2xl items-center mb-4"
          onPress={handleLogout}
        >
          <Text className="text-lg font-semibold text-white">
            {i18n.t("Logout")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

