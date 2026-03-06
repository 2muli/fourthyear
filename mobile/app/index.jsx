import { useAuthStore } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading, isCheckingAuth } = useAuthStore();

  if (isLoading || isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(Auth)/Login" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/(main)/AdminDashboard" />;
  }

  return <Redirect href="/(main)/(tabs)/Home" />;
}