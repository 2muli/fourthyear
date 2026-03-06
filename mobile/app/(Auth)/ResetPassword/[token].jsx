import axios from "axios";
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
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../../../utils/api";

export default function ResetPassword() {
  const { email } = useLocalSearchParams();  // ⬅ RECEIVED FROM FORGOT PASSWORD

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Missing email address. Please start again.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword: password,
      });

      Alert.alert("Success", "Password reset successfully!");
      router.replace("/Login");
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>

      <ScrollView className="flex-1 bg-gray-400 px-6 py-10">
        <View className="items-center mt-6">
          <Image className="w-20 h-20" source={{ uri: "https://www.svgrepo.com/show/533304/lock-password.svg" }} />
          <Text className="mt-4 text-2xl font-bold text-gray-900">Reset Password</Text>
          <Text className="mt-2 text-gray-500 text-center">
            Enter the OTP sent to {email}
          </Text>
        </View>

        <View className="mt-8 bg-white p-6 rounded-xl shadow">
          <Text className="text-gray-700 mb-1">OTP</Text>
          <TextInput
            placeholder="Enter 6-digit OTP"
            className="border border-gray-300 rounded-md px-3 py-2 mb-4"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />

          <Text className="text-gray-700 mb-1">New Password</Text>
          <TextInput
            placeholder="•••••••"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-4"
            value={password}
            onChangeText={setPassword}
          />

          <Text className="text-gray-700 mb-1">Confirm Password</Text>
          <TextInput
            placeholder="•••••••"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-6"
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity className="bg-green-600 py-3 rounded-md" onPress={handleResetPassword}>
            <Text className="text-center text-white font-semibold">Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
