import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "../../../utils/api";
import axios from "axios";
import ExpoSpeechRecognition, { useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function ChatScreen() {
  const { user, isCheckingAuth, AuthedicatedUser } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermissions();
    AuthedicatedUser();
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) router.replace("/Login");
  }, [isCheckingAuth, user]);

  useEffect(() => {
    if (user) {
      setMessages([
        { sender: "ai", text: `Hello ${user?.firstName || "there"}! Ask me anything about crops or animals.` },
      ]);
    }
  }, [user]);

  useEffect(() => {
    let animation;
    if (isListening) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      animation.start();
    } else pulseAnim.setValue(1);
    return () => animation?.stop();
  }, [isListening]);

  const checkPermissions = async () => {
    try {
      const { granted } = await ExpoSpeechRecognition.getPermissionsAsync();
      setPermissionGranted(granted);
    } catch {
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const { granted } = await ExpoSpeechRecognition.requestPermissionsAsync();
      setPermissionGranted(granted);
      return granted;
    } catch {
      return false;
    }
  };

  useSpeechRecognitionEvent("start", () => { setIsListening(true); setSpeechError(null); });
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results[0]) {
      setTranscript(event.results[0].transcript);
      setMessage(event.results[0].transcript);
    }
  });
  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setSpeechError({ message: event.message || event.error });
    if (event.error === "not-allowed") setPermissionGranted(false);
  });

  const startListening = async () => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert("Permission Required", "Please grant microphone permission.", [{ text: "OK" }]);
        return;
      }
    }
    setTranscript("");
    setMessage("");
    await ExpoSpeechRecognition.start({ lang: "en-US", interimResults: true, continuous: false });
  };

  const stopListening = async () => {
    await ExpoSpeechRecognition.stop();
    setIsListening(false);
    if (message.trim()) setTimeout(() => sendMessage(), 200);
  };

  const toggleListening = async () => { isListening ? await stopListening() : await startListening(); };

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const text = message;
    setMessage("");
    addMessage({ sender: "user", text });
    Keyboard.dismiss();
    setLoading(true);
    if (isListening) await ExpoSpeechRecognition.stop();
    try {
      const response = await axios.post(`${API_URL}/chat/ask`, { message: text });
      addMessage({ sender: "ai", text: response.data?.reply || "No response from server." });
    } catch {
      addMessage({ sender: "ai", text: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-[#f0f2f5]"}`}>
        <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            className="flex-1 px-3"
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, i) => (
              <View
                key={i}
                className={`max-w-[75%] mt-2 p-3 rounded-2xl ${
                  msg.sender === "user"
                    ? `self-end ${isDark ? "bg-green-800" : "bg-[#d9fdd3]"} rounded-br-none`
                    : `self-start ${isDark ? "bg-gray-800" : "bg-white"} rounded-bl-none`
                }`}
              >
                <Text className={isDark ? "text-white" : "text-black"}>{msg.text}</Text>
              </View>
            ))}

            {loading && (
              <View className={`self-start mt-2 p-2 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl flex-row items-center`}>
                <ActivityIndicator size="small" />
                <Text className={`ml-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>AI is thinking...</Text>
              </View>
            )}

            {isListening && (
              <View className="flex-row items-center mt-2">
                <Animated.View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "red", marginRight: 8, transform: [{ scale: pulseAnim }] }} />
                <Text className={`text-red-600 font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                  Listening... (Tap mic to stop)
                </Text>
              </View>
            )}

            {speechError && !isListening && (
              <Text className={`${isDark ? "text-red-400" : "text-red-500"} mt-2`}>Error: {speechError.message}</Text>
            )}

            {!permissionGranted && (
              <TouchableOpacity onPress={requestPermissions} className={`${isDark ? "bg-yellow-900" : "bg-yellow-100"} p-3 mt-2 rounded-lg`}>
                <Text className={isDark ? "text-yellow-300" : "text-yellow-800"}>Microphone permission denied. Tap to request again.</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View className={`flex-row items-center px-3 py-2 border-t ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
            <View className={`flex-1 ${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-3xl px-4 py-2`}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={isListening ? "Listening..." : "Ask about crops or animals…"}
                className={`text-[16px] ${isDark ? "text-white" : "text-black"}`}
                multiline
                editable={!isListening}
              />
            </View>

            <View className="ml-2">
              {message.trim() === "" && !isListening ? (
                <TouchableOpacity onPress={toggleListening} disabled={!permissionGranted}>
                  <Ionicons name="mic-outline" size={32} color={permissionGranted ? "#007AFF" : "#999"} />
                </TouchableOpacity>
              ) : isListening ? (
                <TouchableOpacity onPress={stopListening}>
                  <Ionicons name="stop-circle" size={32} color="red" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={sendMessage}>
                  <Ionicons name="send" size={28} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}