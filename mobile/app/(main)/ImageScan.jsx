import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import { API_URL } from "../../utils/api";
import { Linking } from "react-native";
import i18n from "../../src/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ImageScan() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const {language}=useLanguage()
  const {theme}=useTheme();
  const isDark= theme == "dark";

  const { user, isCheckingAuth, AuthedicatedUser } = useAuthStore();

  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);
  //Changing the language 
  useEffect(()=>{
    i18n.locale=language;
  },[language])

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const speak = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    Speech.speak(text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) handleImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) handleImage(result.assets[0]);
  };

  const handleImage = async (img) => {
    setImage(img.uri);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: img.uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();

      const formattedResult = {
        predicted_class: data.predicted_class,
        confidence: `${data.confidence}%`,
        causes: data.causes,
        prevention: data.prevention,
        wikipedia_link: data.wikipedia_link,
      };

      setResult(formattedResult);
      setHistory((prev) => [...prev, formattedResult]);
      setModalVisible(true);
    } catch (error) {
      setResult({
        predicted_class: "Prediction Failed",
        confidence: "N/A",
        causes: "Unable to analyze image",
        prevention: "Please try again",
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-400"} p-4`}>
        <Text className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>{i18n.t("Scan")}</Text>

        {image && (
          <Image
            source={{ uri: image }}
            className="w-full h-60 rounded-xl mb-4"
          />
        )}

        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={pickImage}
            className="bg-blue-600 rounded-lg p-4 flex-row items-center"
          >
            <Ionicons name="image" size={24} color="white" />
            <Text className="text-white ml-2">{i18n.t("UploadImage")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            className="bg-green-600 rounded-lg p-4 flex-row items-center"
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white ml-2">{i18n.t("TakePhoto")}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={loading} transparent>
          <View className="flex-1 bg-black/70 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4 text-lg">{i18n.t("AnalyzingImage")}</Text>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent>
          <View className="flex-1 bg-black/50 justify-center items-center p-4 mt-20">
            <View className={`w-full h-50 rounded-2xl p-5 ${isDark ? "bg-gray-700" : "bg-white"}`}>
              <Text className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                {result?.predicted_class}
              </Text>

              <ScrollView style={{ maxHeight: 250 }}>
                <Text>
                  <Text className="font-bold">Confidence:</Text>{" "}
                  {result?.confidence}
                </Text>
                <Text className="font-bold">Causes:</Text>

                {Array.isArray(result?.causes) &&
                  result.causes.map((cause, index) => (
                    <Text key={index} className="text-gray-400">
                      • {cause}
                    </Text>
                  ))}
                
                  <Text className="font-bold">Prevention:</Text>
                  {Array.isArray(result?.prevention) &&
                  result.prevention.map((prevent,index)=>(
                    <Text key={index} className="text-gray-400">
                    . {prevent}
                    </Text>
                  ))}
                {result?.wikipedia_link && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(result.wikipedia_link)}
                    className="mt-6 bg-blue-600 p-3 rounded-lg"
                  >
                    <Text className={`${isDark ? "text-gray-200" : "text-gray-600"}`}>📖 Learn more on Wikipedia</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {!isSpeaking ? (
                <TouchableOpacity
                  onPress={() =>
                    speak(
                      `${result?.predicted_class}. Causes: ${result?.causes}. Prevention: ${result?.prevention}`,
                    )
                  }
                  className="mt-6 bg-yellow-500 p-3 rounded-lg"
                >
                  <Text className="text-white text-center">🔊 Play Voice</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={stopSpeech}
                  className="mt-6 bg-gray-700 p-3 rounded-lg"
                >
                  <Text className="text-white text-center">⏹ Stop Voice</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-6 bg-red-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* HISTORY */}
        <Text className={`${isDark ? "text-gray-400" : "text-gray-800"} text-xl font-semibold mt-6 mb-2`}>{i18n.t("ScanHistory")}</Text>

        <ScrollView style={{ maxHeight: 500 }}>
          {history.map((item, index) => (
            <View key={index} className={`${isDark ? "bg-gray-800" : "bg-white"} p-3 rounded-lg mb-2 shadow`}>
              <Text className={`font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{item.predicted_class}</Text>
              <Text className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                Confidence: {item.confidence}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
