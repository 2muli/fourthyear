import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";

import { useAuthStore } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { API_URL } from "@/utils/api";
import i18n from "../../src/i18n";
import { useTheme } from "@/context/ThemeContext";

export default function SettingScreen() {
  /* -------------------- STATE -------------------- */
  const [languageModal, setLanguageModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const { isCheckingAuth, user, token, AuthedicatedUser } = useAuthStore();
  const { language, changeLanguage } = useLanguage();
  const {theme,toggleTheme} = useTheme()

  const isDark= theme == "dark";

  // Check authentication
  useEffect(() => {
    AuthedicatedUser();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);

  // Sync i18n with language context (KEY PART)
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  /* -------------------- HANDLERS -------------------- */

  const handleSelectLanguage = (lang) => {
    const code = lang === "English" ? "en" : "sw";
    changeLanguage(code);
    setLanguageModal(false);
  };

  const handleUpdatePassword = async () => {
    if (newPass !== confirmPass) {
      Alert.alert(i18n.t("Error"), i18n.t("PasswordsDoNotMatch"));
      return;
    }

    if (newPass.length < 6) {
      Alert.alert(i18n.t("Error"), i18n.t("PasswordTooShort"));
      return;
    }

    try {
      await axios.put(
        `${API_URL}/auth/changepassword`,
        {
          oldPassword: oldPass,
          newPassword: newPass,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(i18n.t("Success"), i18n.t("PasswordUpdated"));
      setPasswordModal(false);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      Alert.alert(
        i18n.t("Error"),
        error.response?.data?.error || i18n.t("FailedUpdatePassword")
      );
    }
  };

  /* -------------------- LOADING -------------------- */

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 p-4 ${isDark ? "bg-black" : "bg-green-400"}`}>
        {/* Header */}
        <Text className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
          {i18n.t("Setting")}
        </Text>

        {/* Dark Mode */}
        <View className={`p-4 rounded-xl mb-4 flex-row justify-between items-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            {i18n.t("DarkMode")}
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} thumbColor={`${isDark ? "#FFF" : "#011029"}`} trackColor={{false: '#0b58d9', true: '#06398f'}}/>
        </View>

        {/* Language */}
        <TouchableOpacity
          onPress={() => setLanguageModal(true)}
          className={`p-4 rounded-xl mb-4 flex-row justify-between items-center ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            {i18n.t("Language")}
          </Text>
          <View className="flex-row items-center">
            <Text className={`mr-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {language === "en" ? "English" : "Kiswahili"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "gray"} />
          </View>
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          onPress={() => setPasswordModal(true)}
          className={`p-4 rounded-xl mb-4 flex-row justify-between items-center ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            {i18n.t("ChangePassword")}
          </Text>
          <Ionicons name="lock-closed-outline" size={22} color={isDark ? "#9ca3af" : "gray"} />
        </TouchableOpacity>

        {/* About */}
        <View className={`p-4 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}>
            {i18n.t("About")}
          </Text>
          <Text className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {i18n.t("Improving")}
          </Text>
        </View>

        {/* -------- LANGUAGE MODAL -------- */}
        <Modal animationType="slide" transparent visible={languageModal}>
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className={`p-4 h-64 w-80 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <Text className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                {i18n.t("SelectLanguage")}
              </Text>

              {["English", "Kiswahili"].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => handleSelectLanguage(lang)}
                  className={`p-3 border-b border-${isDark ? "gray-700" : "gray-200"}`}
                >
                  <Text className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setLanguageModal(false)}
                className={`bg-${isDark ? "gray-800" : "gray-400"} p-3 mt-4 rounded-xl`}
              >
                <Text className={`text-center ${isDark ? "text-white" : "text-gray-700"} font-bold`}>
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* -------- PASSWORD MODAL -------- */}
        <Modal animationType="slide" transparent visible={passwordModal}>
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className={`p-4 h-96 w-80 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <Text className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                {i18n.t("ChangePassword")}
              </Text>

              <TextInput
                placeholder={i18n.t("OldPassword")}
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                secureTextEntry
                value={oldPass}
                onChangeText={setOldPass}
                className={`border border-gray-300 ${isDark ? "text-gray-200" : "text-gray-800"} rounded-xl p-3 mb-3`}
              />

              <TextInput
                placeholder={i18n.t("NewPassword")}
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
                className={`border border-gray-300 ${isDark ? "text-gray-200" : "text-gray-800"} rounded-xl p-3 mb-3`}
              />

              <TextInput
                placeholder={i18n.t("ConfirmPassword")}
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
                className={`border border-gray-300 ${isDark ? "text-gray-200" : "text-gray-800"} rounded-xl p-3 mb-3`}
              />

              <TouchableOpacity
                className="bg-green-600 p-3 rounded-xl mb-3"
                onPress={handleUpdatePassword}
              >
                <Text className="text-center text-white font-bold">
                  {i18n.t("Update")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPasswordModal(false)}
                className={`${isDark ? "bg-gray-400" : "bg-gray-800"} p-3 rounded-xl`}
              >
                <Text className="text-center text-white font-bold">
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}