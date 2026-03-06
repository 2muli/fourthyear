import { Stack } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import i18n from "../../src/i18n";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";


export default function MainLayout() {
  const { user } = useAuthStore();  
  const {language}=useLanguage()
  useEffect(() => {
    i18n.locale=language;
  }, [language]);
if (!user) {
  return <Stack screenOptions={{ headerShown: false }} />;
}
return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: i18n.t("Scan"),
          headerStyle: { backgroundColor: "green" },
        }}
        name="ImageScan"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: i18n.t("Tutorial"),
          headerStyle: { backgroundColor: "green" },
        }}
        name="tutorial"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: i18n.t("Setting"),
          headerStyle: { backgroundColor: "green" },
        }}
        name="setting"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: i18n.t("logout"),
          headerStyle: { backgroundColor: "green" },
        }}
        name="logout"
      />
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Admin Dashboard",
        }}
        name="AdminDashboard"
      />
    </Stack>
    
  );
}
