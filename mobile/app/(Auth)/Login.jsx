import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../src/i18n";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuthStore();
  const router = useRouter();
  const {language}=useLanguage();

  // Sync i18n with language context
  React.useEffect(()=>{
    i18n.locale=language;
  },[language])

  const handleLogin = async () => {
    try {
      //check the empty inputs
      if (!form.email || !form.password) {
        Alert.alert(i18n.t("Error"), "All fields are required");
        return;
      }
       //confirm email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Alert.alert("Error", "Enter valid email format i.e abc@example.com");
        return;
      }
      const result = await login(form.email, form.password);
      if (result.success) {
        router.replace("/(main)/(tabs)/Home");
      } else {
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };
  return (
 <KeyboardAvoidingView style={{flex:1}}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView className="flex-1 bg-gray-400 px-6 py-10">
      
      {/* HEADER */}
      <View className="items-center mt-6">
        <Image
          source={require("../../assets/images/login.png")}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold text-gray-900">
          Welcome Back
        </Text>

        <Text className="mt-2 text-gray-800">
          Don&apos;t have an account?{" "}
          <Link href="/Register" className="text-green-800 font-semibold">
            Register
          </Link>
        </Text>
      </View>

      {/* FORM */}
      <View className="mt-8 bg-white p-6 rounded-xl shadow">

        {/* Email */}
        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          placeholder="user@example.com"
          autoFocus={true}
          placeholderTextColor="#696969"
          className="border border-gray-300   text-gray-700 rounded-md px-3 py-2 mb-4"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
        />

        {/* Password */}
        <Text className="text-gray-700 mb-1">Password</Text>
        <TextInput
          placeholder="••••••"
          placeholderTextColor="#696969"
          secureTextEntry
          className="border border-gray-300  text-gray-700 rounded-md px-3 py-2 mb-4"
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
        />

        {/* Forgot Password */}
        <View className="flex-row justify-end mb-2">
          <Link href="/ForgotPassword" className="text-green-600 font-semibold">
            Forgot your password?
          </Link>
        </View>

        {/* Login Button */}
        <TouchableOpacity className="bg-green-600 py-3 rounded-md mt-4"
        onPress={handleLogin}>
          <Text className="text-center text-white font-semibold">
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
