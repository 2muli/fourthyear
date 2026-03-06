import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../context/AuthContext";
import { router } from "expo-router";

export default function ChangePassword() {
  const { user,isCheckingAuth, AuthedicatedUser } = useAuthStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    AuthedicatedUser(); 
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login"); 
    }
  }, [isCheckingAuth, user]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
     <KeyboardAvoidingView style={{flex:1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 bg-gray-400 px-6 py-10">

        <Text className="text-2xl font-bold text-gray-900 text-center mt-6">
          Change Password
        </Text>

        <View className="mt-8 bg-white p-6 rounded-xl shadow">
          <Text className="text-gray-700 mb-1">Current Password</Text>
          <TextInput
            placeholder="••••••"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-4"
            value={oldPassword}
            onChangeText={setOldPassword}
          />

          <Text className="text-gray-700 mb-1">New Password</Text>
          <TextInput
            placeholder="••••••"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-4"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text className="text-gray-700 mb-1">Confirm New Password</Text>
          <TextInput
            placeholder="••••••"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-6"
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity className="bg-green-600 py-3 rounded-md">
            <Text className="text-center text-white font-semibold">
              Update Password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
