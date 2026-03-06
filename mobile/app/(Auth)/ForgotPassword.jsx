import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import axios from "axios";
import { API_URL } from "../../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

      Alert.alert("Success", response.data.message);

      // ⬅ Move to ResetPassword screen WITH EMAIL
      router.push({
        pathname: "/ResetPassword/[token]",
        params: { email },
      });

    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1 bg-gray-400 px-6 py-10">
        <View className="items-center mt-6">
          <Image className="w-20 h-20" source={{ uri: "https://www.svgrepo.com/show/533238/mailbox.svg" }} />
          <Text className="mt-4 text-2xl font-bold text-gray-900">Forgot Password</Text>
          <Text className="mt-2 text-gray-800 text-center">Enter your email and we will send an OTP.</Text>
        </View>

        <View className="mt-8 bg-white p-6 rounded-xl shadow">
          <Text className="text-gray-700 mb-1">Email Address</Text>

          <TextInput
            placeholder="user@example.com"
            autoFocus={true}
            placeholderTextColor="#696969"
            className="border border-gray-300 rounded-md px-3 py-2 mb-6"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity className="bg-green-600 py-3 rounded-md" onPress={sendResetEmail}>
            <Text className="text-center text-white font-semibold">Send OTP</Text>
          </TouchableOpacity>

          <View className="items-center mt-4">
            <Link href="/Login" className="text-green-600 font-semibold">Back to Login</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
