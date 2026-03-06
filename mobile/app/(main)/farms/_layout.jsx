import { Stack } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";

export default function _layout() {
  const { user } = useAuthStore();  
  if(!user) return null;
  return (
    <Stack screenOptions={{ headerShown: true,headerStyle:{backgroundColor:"green"} }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Farm List",
        }}
        name="farm"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Crops List",
        }}
        name="crops"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle:"Livestock List",
        }}
        name="Livestock"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Farm Activities",
        }}
        name="Activities"
      />
    </Stack>
  )
}