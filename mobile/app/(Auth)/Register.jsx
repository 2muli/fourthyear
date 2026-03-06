import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    location: "",
  });
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm ||
      !form.location
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (form.password !== form.confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Enter valid email format i.e abc@example.com");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      Alert.alert(
        "Error",
        "Enter valid phone format i.e 07XXXXXXXX or 01XXXXXXXX"
      );
      return;
    }

    try {
      const result = await register(
        form.firstName,
        form.lastName,
        form.email,
        form.phone,
        form.password,
        form.location
      );

      if (result.success) {
        Alert.alert("Success", result.message || "Registered successfully");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirm: "",
          location: "",
        });
        router.replace("/Login");
      } else {
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="bg-gray-400 px-6 py-10"
      >
        <View style={{ flex: 1 }}>
          <View className="items-center mt-6">
            <Image
              source={require("../../assets/images/register.jpg")}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-900">
              Create a new account
            </Text>

            <Text className="mt-2 text-gray-600">
              Or{" "}
              <Link href="/Login" className="text-green-700 font-semibold">
                login to your account
              </Link>
            </Text>
          </View>

          <View className="mt-8 bg-white p-6 rounded-xl shadow">
            <Text className="text-gray-700 mb-1">First Name</Text>
            <TextInput
              placeholder="John"
              autoFocus={true}
              placeholderTextColor="#696969"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={form.firstName}
              onChangeText={(v) => setForm({ ...form, firstName: v })}
            />

            <Text className="text-gray-700 mb-1">Second Name</Text>
            <TextInput
              placeholder="Doe"
              placeholderTextColor="#696969"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={form.lastName}
              onChangeText={(v) => setForm({ ...form, lastName: v })}
            />

            <Text className="text-gray-700 mb-1">Phone Number</Text>
            <View className="flex-row items-center border border-gray-300 rounded-md mb-4">
              <Text className="px-3 py-2 bg-gray-100 text-gray-500">+254</Text>
              <TextInput
                placeholder="07XXXXXXXX or 01XXXXXXXX"
                placeholderTextColor="#696969"
                className="flex-1 px-3 py-2"
                keyboardType="numeric"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
              />
            </View>

            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              placeholder="user@example.com"
              placeholderTextColor="#696969"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />

            <Text className="text-gray-700 mb-1">Location</Text>
            <TextInput
              placeholder="Enter location e.g Mwingi, Kenya"
              placeholderTextColor="#696969"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
            />

            <Text className="text-gray-700 mb-1">Password</Text>
            <TextInput
              placeholder="••••••"
              placeholderTextColor="#696969"
              secureTextEntry
              className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />

            <Text className="text-gray-700 mb-1">Confirm Password</Text>
            <TextInput
              placeholder="••••••"
              placeholderTextColor="#696969"
              secureTextEntry
              className="border border-gray-300 rounded-md px-3 py-2 mb-6"
              value={form.confirm}
              onChangeText={(v) => setForm({ ...form, confirm: v })}
            />

            <TouchableOpacity
              className="bg-green-600 py-3 rounded-md"
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-center text-white font-semibold">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}