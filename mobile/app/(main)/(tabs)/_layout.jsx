import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useAuthStore } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../../src/i18n";

export default function TabsLayout() {
  const { user } = useAuthStore();  
  const {language}=useLanguage();

  // Sync i18n with language context
  useEffect(()=>{
    i18n.locale=language;
  },[language])  
  if(!user) return null;
  return (
    <Tabs
      screenOptions={{
        headerShown: true,             
        tabBarStyle: { backgroundColor: "green" },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "white",
        headerStyle: { backgroundColor: "green" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: i18n.t("Home"),
          headerShown: false,          
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Weather"
        options={{
          title: i18n.t("Weather"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Chat"
        options={{
          title: i18n.t("Chat"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: i18n.t("Profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
