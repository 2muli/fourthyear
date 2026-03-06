import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuthStore } from "../../context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import i18n from "../../src/i18n";
import Feather from "@expo/vector-icons/Feather";

const CustomDrawerContent = (props) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme == "dark";

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const goTo = (path) => {
    router.push(path);
    props.navigation.closeDrawer(); 
  };

  const handleLogout = () => {
    logout();
    router.replace("/Login");
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: isDark ? "gray" : "#32cd32" }}
    >
      <View
        className={`p-5 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Menu")}
        </Text>
      </View>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/(tabs)/Home")}
      >
        <Ionicons
          name="home-outline"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Home")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/farms/farm")}
      >
        <Ionicons
          name="leaf-outline"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Farm")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/farms/Livestock")}
      >
        <FontAwesome5
          name="piggy-bank"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Livestock")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/farms/crops")}
      >
        <Ionicons
          name="leaf"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Crops")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/farms/Activities")}
      >
        <Feather name="activity" size={24} color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Activities")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/ImageScan")}
      >
        <Ionicons
          name="scan-outline"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Scan")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/tutorial")}
      >
        <Ionicons
          name="book-outline"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Tutorial")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onPress={() => goTo("/(main)/setting")}
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color={isDark ? "#fff" : "#333"}
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {i18n.t("Setting")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center p-4 mt-auto"
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#ff3b30"
          className="mr-4"
        />
        <Text
          className={`text-base ${isDark ? "text-red-800" : "text-red-900"}`}
        >
          {i18n.t("Logout")}
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
