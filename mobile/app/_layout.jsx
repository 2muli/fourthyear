import { Drawer } from "expo-router/drawer";
import { ToastProvider } from "react-native-toast-notifications";
import CustomDrawerContent from "./components/CustomDrawerContent";
import "../global.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LanguageProvider>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              drawerType: "front",
              headerShown: false,
              swipeEdgeWidth: 100,
            }}
          >
            <Drawer.Screen name="(main)" options={{ headerShown: false }} />
            <Drawer.Screen name="(Auth)" options={{ headerShown: false }} />
          </Drawer>
        </LanguageProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}