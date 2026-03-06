import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { ScrollView } from "react-native-gesture-handler";
import { useAuthStore } from "@/context/AuthContext";
import { router } from "expo-router";
import i18n from "../../src/i18n";
import { YOUTUBE_API_KEY } from "../../env"
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Tutorial() {
  const [search, setSearch] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user, isCheckingAuth, AuthedicatedUser } = useAuthStore();
  const {language}=useLanguage();
  const {theme}=useTheme();
  const isDark= theme == "dark";
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);
   // Sync i18n with language context (KEY PART)
    useEffect(() => {
      i18n.locale = language;
    }, [language]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  
  const getSafeThumbnail = (url) => url.replace("webp", "jpg");

  const fetchVideos = async (query) => {
  if (!query) return;
  setLoading(true);
  setSuggestions([]);

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: `${query} crop livestock`,
          key: YOUTUBE_API_KEY,
          maxResults: 20,
          type: "video",
          videoEmbeddable: "true",
          safeSearch: "moderate",
        },
      }
    );

    setVideos(response.data.items);
  } catch (error) {
    console.error("YouTube Error:", error.response?.data || error);
  } finally {
    setLoading(false);
  }
};


  const handleSearchChange = (text) => {
    setSearch(text);
    if (text.length > 2 && videos.length > 0) {
      const filtered = videos
        .filter((v) =>
          v.snippet.title.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const openPlayer = (id) => {
    setSelectedVideoId(id);
    setModalVisible(true);
    setPlaying(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVideoId(null);
    setPlaying(false);
  };

  const renderItem = ({ item }) => (
    <View className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md mb-4 p-3`}>
      <Image
        source={{ uri: getSafeThumbnail(item.snippet.thumbnails.high.url) }}
        className="w-full h-40 rounded-lg"
        resizeMode="cover"
      />
      <Text className={`text-lg font-semibold mt-2 ${isDark ? "text-white" : "text-gray-800"}`}>{item.snippet.title}</Text>
      <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.snippet.channelTitle}</Text>

      <TouchableOpacity
        onPress={() => openPlayer(item.id.videoId)}
        className="bg-green-600 rounded-full px-4 py-2 mt-3 self-start"
      >
        <Text className={`text-white font-bold ${isDark ? "text-white" : "text-white"}`}>{i18n.t("watchVideos")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-400"} p-4`}>
        <Text className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>{i18n.t("Videos")}</Text>

        {/* Search */}
        <View className="flex-row items-center mb-4">
          <View className={`flex-row items-center flex-1 ${isDark ? "bg-gray-800" : "bg-white"} rounded-full px-4 py-2 shadow`}>
            <Ionicons name="search" size={20} color={isDark ? "#9ca3af" : "gray"} />
            <TextInput
              placeholder="Search crop or livestock..."
              value={search}
              onChangeText={handleSearchChange}
              className={`ml-2 flex-1 text-base ${isDark ? "text-white" : "text-black"}`}
            />
          </View>

          <TouchableOpacity
            onPress={() => fetchVideos(search)}
            className="ml-2 bg-green-600 rounded-full px-4 py-2 shadow"
          >
              <Text className={`text-white font-bold ${isDark ? "text-white" : "text-white"}`}>{i18n.t("search")}</Text>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ScrollView
            horizontal
            className="mb-4"
            showsHorizontalScrollIndicator={false}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id.videoId}
                className={`${isDark ? "bg-gray-800" : "bg-white"} px-3 py-2 rounded-full mr-2 shadow`}
                onPress={() => openPlayer(item.id.videoId)}
              >
                <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>{item.snippet.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Video list */}
        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
        ) : (
          <>
            {videos?.length === 0 ? (
              <Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{i18n.t("NoVideos")}</Text>
            ) : (
              <FlatList
                data={videos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.videoId}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {/* Video Modal - FIXED */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "black",
                width: "90%",
                height: "50%",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              {Platform.OS !== "web" && selectedVideoId && (
                <YoutubePlayer
                  height={400}
                  play={playing}
                  videoId={selectedVideoId}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={closeModal}
              style={{
                marginTop: 15,
                backgroundColor: "white",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "black" }}>{i18n.t("Close")}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
