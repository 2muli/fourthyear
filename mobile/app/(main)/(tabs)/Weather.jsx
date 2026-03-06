import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Animated,
  ScrollView,
  RefreshControl,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_KEY, API_BASE_URL } from "../../../env";
import { router } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

// Constants for better maintainability

export default function Weather() {
  const { user, isCheckingAuth, AuthedicatedUser } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme == "dark";
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const searchTimeoutRef = useRef(null);

  // Weather condition mapping with emojis and descriptions
  const getWeatherCondition = useCallback((weatherCode, isDay = true) => {
    const conditions = {
      // Thunderstorm
      200: { emoji: "⛈️", text: "Thunderstorm with Rain", short: "Storm" },
      201: { emoji: "⛈️", text: "Thunderstorm", short: "Storm" },
      202: { emoji: "⛈️", text: "Heavy Thunderstorm", short: "Heavy Storm" },
      210: { emoji: "🌩️", text: "Light Thunderstorm", short: "Thunder" },
      211: { emoji: "🌩️", text: "Thunderstorm", short: "Thunder" },
      212: { emoji: "🌩️", text: "Heavy Thunderstorm", short: "Heavy Thunder" },
      221: { emoji: "🌩️", text: "Ragged Thunderstorm", short: "Thunder" },
      230: { emoji: "⛈️", text: "Thunderstorm with Drizzle", short: "Storm" },
      231: { emoji: "⛈️", text: "Thunderstorm with Drizzle", short: "Storm" },
      232: {
        emoji: "⛈️",
        text: "Heavy Thunderstorm with Drizzle",
        short: "Heavy Storm",
      },

      // Drizzle
      300: { emoji: "🌧️", text: "Light Drizzle", short: "Drizzle" },
      301: { emoji: "🌧️", text: "Drizzle", short: "Drizzle" },
      302: { emoji: "🌧️", text: "Heavy Drizzle", short: "Heavy Drizzle" },
      310: { emoji: "🌧️", text: "Light Drizzle Rain", short: "Drizzle" },
      311: { emoji: "🌧️", text: "Drizzle Rain", short: "Drizzle" },
      312: { emoji: "🌧️", text: "Heavy Drizzle Rain", short: "Heavy Drizzle" },
      313: { emoji: "🌧️", text: "Shower Rain and Drizzle", short: "Rain" },
      314: {
        emoji: "🌧️",
        text: "Heavy Shower Rain and Drizzle",
        short: "Heavy Rain",
      },
      321: { emoji: "🌧️", text: "Shower Drizzle", short: "Drizzle" },

      // Rain
      500: { emoji: "🌦️", text: "Light Rain", short: "Light Rain" },
      501: { emoji: "🌧️", text: "Moderate Rain", short: "Rain" },
      502: { emoji: "🌧️", text: "Heavy Rain", short: "Heavy Rain" },
      503: { emoji: "🌧️", text: "Very Heavy Rain", short: "Heavy Rain" },
      504: { emoji: "🌧️", text: "Extreme Rain", short: "Extreme Rain" },
      511: { emoji: "🌨️", text: "Freezing Rain", short: "Freezing Rain" },
      520: { emoji: "🌦️", text: "Light Shower Rain", short: "Light Rain" },
      521: { emoji: "🌧️", text: "Shower Rain", short: "Rain" },
      522: { emoji: "🌧️", text: "Heavy Shower Rain", short: "Heavy Rain" },
      531: { emoji: "🌧️", text: "Ragged Shower Rain", short: "Rain" },

      // Snow
      600: { emoji: "🌨️", text: "Light Snow", short: "Light Snow" },
      601: { emoji: "🌨️", text: "Snow", short: "Snow" },
      602: { emoji: "🌨️", text: "Heavy Snow", short: "Heavy Snow" },
      611: { emoji: "🌨️", text: "Sleet", short: "Sleet" },
      612: { emoji: "🌨️", text: "Light Shower Sleet", short: "Sleet" },
      613: { emoji: "🌨️", text: "Shower Sleet", short: "Sleet" },
      615: { emoji: "🌨️", text: "Light Rain and Snow", short: "Rain/Snow" },
      616: { emoji: "🌨️", text: "Rain and Snow", short: "Rain/Snow" },
      620: { emoji: "🌨️", text: "Light Shower Snow", short: "Light Snow" },
      621: { emoji: "🌨️", text: "Shower Snow", short: "Snow" },
      622: { emoji: "🌨️", text: "Heavy Shower Snow", short: "Heavy Snow" },

      // Atmosphere
      701: { emoji: "🌫️", text: "Mist", short: "Mist" },
      711: { emoji: "🌫️", text: "Smoke", short: "Smoke" },
      721: { emoji: "🌫️", text: "Haze", short: "Haze" },
      731: { emoji: "🌪️", text: "Sand/Dust Whirls", short: "Dust" },
      741: { emoji: "🌫️", text: "Fog", short: "Fog" },
      751: { emoji: "🌫️", text: "Sand", short: "Sand" },
      761: { emoji: "🌫️", text: "Dust", short: "Dust" },
      762: { emoji: "🌋", text: "Volcanic Ash", short: "Ash" },
      771: { emoji: "💨", text: "Squalls", short: "Squalls" },
      781: { emoji: "🌪️", text: "Tornado", short: "Tornado" },

      // Clear
      800: {
        emoji: isDay ? "☀️" : "🌙",
        text: isDay ? "Clear Sky" : "Clear Night",
        short: isDay ? "Sunny" : "Clear",
      },

      // Clouds
      801: {
        emoji: isDay ? "🌤️" : "🌙",
        text: "Few Clouds",
        short: "Mostly Sunny",
      },
      802: { emoji: "⛅", text: "Scattered Clouds", short: "Partly Cloudy" },
      803: { emoji: "🌥️", text: "Broken Clouds", short: "Cloudy" },
      804: { emoji: "☁️", text: "Overcast Clouds", short: "Overcast" },
    };

    return (
      conditions[weatherCode] || {
        emoji: "🌈",
        text: "Unknown",
        short: "Unknown",
      }
    );
  }, []);

  const fetchWeatherByCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingCurrentLocation(true);

      // Request location permission with better error handling
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError(
          "Location permission is required to show weather data. Please enable location permissions in your device settings."
        );
        setLoading(false);
        return;
      }

      // Get location with timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const loc = await locationPromise;
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;

      await fetchWeatherData(lat, lon);
    } catch (error) {
      console.error("Location fetch error:", error);
      let errorMessage = "Failed to get your location. ";

      if (error.code === "CANCELLED") {
        errorMessage += "Location request was cancelled.";
      } else if (error.code === "UNAVAILABLE") {
        errorMessage += "Location services are not available.";
      } else if (error.code === "TIMEOUT") {
        errorMessage += "Location request timed out. Please try again.";
      } else {
        errorMessage += "Please check your connection and try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchWeatherByCity = useCallback(async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUsingCurrentLocation(false);

      const geocodingUrl = `${API_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

      const geocodingResponse = await axios.get(geocodingUrl);

      if (geocodingResponse.data.length === 0) {
        setError(
          `City "${cityName}" not found. Please check the spelling and try again.`
        );
        setLoading(false);
        return;
      }

      const { lat, lon, name, country } = geocodingResponse.data[0];
      await fetchWeatherData(lat, lon);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("City weather fetch error:", error);
      let errorMessage = "Failed to fetch weather for this city. ";

      if (error.response?.status === 401) {
        errorMessage += "API key is invalid.";
      } else if (error.response?.status === 404) {
        errorMessage += "City not found.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += "Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherData = useCallback(
    async (lat, lon) => {
      try {
        const currentUrl = `${API_BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `${API_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
          axios.get(currentUrl, { timeout: 10000 }),
          axios.get(forecastUrl, { timeout: 10000 }),
        ]);

        setWeather(currentResponse.data);
        setForecast(processForecastData(forecastResponse.data));
        setLastUpdated(new Date());

        // Trigger animations when new data is loaded
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideUp, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("Weather data fetch error:", error);
        let errorMessage = "Failed to fetch weather data. ";

        if (error.code === "NETWORK_ERROR") {
          errorMessage += "Please check your internet connection.";
        } else if (error.response?.status === 429) {
          errorMessage += "Too many requests. Please wait a moment.";
        } else if (error.response?.status >= 500) {
          errorMessage += "Weather service is temporarily unavailable.";
        } else {
          errorMessage += "Please try again.";
        }

        throw new Error(errorMessage);
      }
    },
    [fade, slideUp]
  );

  const searchCities = useCallback(async (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const url = `${API_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;

        const response = await axios.get(url, { timeout: 5000 });
        setSearchResults(response.data);
      } catch (error) {
        console.error("City search error:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300); // Debounce search by 300ms
  }, []);

  // Process 5-day forecast data into daily format
  const processForecastData = useCallback((data) => {
    const dailyData = {};

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          weather: item.weather[0],
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          dt: item.dt,
          items: [item],
        };
      } else {
        dailyData[date].minTemp = Math.min(
          dailyData[date].minTemp,
          item.main.temp_min
        );
        dailyData[date].maxTemp = Math.max(
          dailyData[date].maxTemp,
          item.main.temp_max
        );
        dailyData[date].items.push(item);
      }
    });

    // Convert to array and take next 7 days
    return Object.values(dailyData).slice(0, 7);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (usingCurrentLocation) {
      fetchWeatherByCurrentLocation();
    } else if (weather) {
      fetchWeatherByCity(weather.name);
    } else {
      setRefreshing(false);
    }
  }, [
    usingCurrentLocation,
    weather,
    fetchWeatherByCurrentLocation,
    fetchWeatherByCity,
  ]);

  const getWeatherGradient = useCallback((temp) => {
    if (temp === undefined || temp === null) return ["#4facfe", "#00f2fe"];
    if (temp < 0) return ["#667eea", "#764ba2"]; // Very Cold
    if (temp < 10) return ["#4facfe", "#00f2fe"]; // Cold
    if (temp < 20) return ["#43e97b", "#38f9d7"]; // Cool
    if (temp < 30) return ["#fa709a", "#fee140"]; // Warm
    return ["#ff9a9e", "#fecfef"]; // Hot
  }, []);

  const handleSearchSelect = useCallback(
    (city) => {
      fetchWeatherByCity(
        `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`
      );
    },
    [fetchWeatherByCity]
  );

  const resetSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);
  // Initialize weather data on component mount
  useEffect(() => {
    fetchWeatherByCurrentLocation();
  }, [fetchWeatherByCurrentLocation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
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
      <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
      </View>
    );
  }
  
  const renderLoadingScreen = () => (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gradient-to-b from-blue-400 to-purple-500"} justify-center items-center`}>
      <View className={`${isDark ? "bg-gray-800" : "bg-black/20"} rounded-2xl p-8 items-center`}>
        <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
        <Text className={`mt-4 ${isDark ? "text-white" : "text-black"} text-lg font-semibold`}>
          {usingCurrentLocation
            ? "Getting your location..."
            : "Fetching weather data..."}
        </Text>
        <Text className={`${isDark ? "text-gray-300" : "text-black/80"} text-sm mt-2 text-center`}>
          {usingCurrentLocation
            ? "Accessing your current location"
            : "Loading weather information"}
        </Text>
      </View>
    </View>
  );

  const renderErrorScreen = () => (
    <View className="flex-1 bg-gradient-to-b from-blue-400 to-purple-500 justify-center items-center p-6">
      <View className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 items-center shadow-2xl max-w-sm w-full`}>
        <Text className="text-red-500 text-4xl mb-4">⚠️</Text>
        <Text className={`${isDark ? "text-red-400" : "text-red-500"} text-xl font-bold mb-4 text-center`}>
          Weather Error
        </Text>
        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"} text-base mb-6 text-center leading-6`}>
          {error}
        </Text>
        <View className="flex-row justify-center space-x-3">
          <TouchableOpacity
            className="bg-blue-500 px-5 py-3 rounded-2xl shadow-lg flex-1 mr-2"
            onPress={fetchWeatherByCurrentLocation}
          >
            <Text className={`text-center font-semibold ${isDark ? "text-white" : "text-white"}`}>
              Use My Location
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 px-5 py-3 rounded-2xl shadow-lg flex-1 ml-2"
            onPress={() => setShowSearch(true)}
          >
            <Text className={`text-center font-semibold ${isDark ? "text-white" : "text-white"}`}>
              Search City
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderNoDataScreen = () => (
    <View className="flex-1 bg-gradient-to-b from-blue-400 to-purple-500 justify-center items-center p-6">
      <View className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 items-center shadow-2xl max-w-sm w-full`}>
        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"} text-xl mb-6 text-center`}>
          No weather data available
        </Text>
        <View className="flex-row justify-center space-x-3">
          <TouchableOpacity
            className="bg-blue-500 px-5 py-3 rounded-2xl shadow-lg flex-1 mr-2"
            onPress={fetchWeatherByCurrentLocation}
          >
            <Text className={`text-center font-semibold ${isDark ? "text-white" : "text-white"}`}>
              Use My Location
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 px-5 py-3 rounded-2xl shadow-lg flex-1 ml-2"
            onPress={() => setShowSearch(true)}
          >
            <Text className={`text-center font-semibold ${isDark ? "text-white" : "text-white"}`}>
              Search City
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return renderLoadingScreen();
  }

  if (error && !weather) {
    return renderErrorScreen();
  }

  if (!weather) {
    return renderNoDataScreen();
  }

  const gradient = getWeatherGradient(weather.main?.temp);
  const currentCondition = getWeatherCondition(weather.weather?.[0]?.id, true);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        {/* Search Modal */}
        <Modal
          visible={showSearch}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={resetSearch}
        >
          <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"} pt-16`}>
            <View className={`px-6 pb-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={resetSearch} className="p-2 mr-2">
                  <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#374151"} />
                </TouchableOpacity>
                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                  Search City
                </Text>
              </View>

              <View className={`flex-row items-center ${isDark ? "bg-gray-800" : "bg-gray-100"} rounded-2xl px-4 py-3 mt-4`}>
                <Ionicons name="search" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                <TextInput
                  className={`flex-1 ml-3 ${isDark ? "text-white" : "text-gray-800"} text-lg`}
                  placeholder="Enter city name..."
                  placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchCities(text);
                  }}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    if (searchQuery.trim().length >= 2) {
                      fetchWeatherByCity(searchQuery);
                    }
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {searching && (
              <View className="p-8 items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className={`${isDark ? "text-gray-400" : "text-gray-500"} mt-2`}>Searching cities...</Text>
              </View>
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-6 py-4 border-b ${isDark ? "border-gray-700 active:bg-gray-800" : "border-gray-100 active:bg-gray-50"}`}
                  onPress={() => handleSearchSelect(item)}
                >
                  <Text className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {item.name}
                  </Text>
                  <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {item.state && `${item.state}, `}
                    {item.country}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !searching && searchQuery.length >= 2 ? (
                  <View className="p-8 items-center">
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center`}>
                      No cities found for &quot;{searchQuery}&quot;
                    </Text>
                    <Text className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mt-1`}>
                      Try checking the spelling or be more specific
                    </Text>
                  </View>
                ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                  <View className="p-8 items-center">
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Type at least 2 characters to search
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </Modal>

        <ScrollView
          className="flex-1"
          style={{ backgroundColor: gradient[0] }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ffffff"]}
              tintColor="#ffffff"
              title="Pull to refresh"
              titleColor="#ffffff"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Current Weather */}
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: slideUp }],
            }}
            className="pt-16 pb-8 px-6"
          >
            {/* Location Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-white text-3xl font-bold mr-2"
                    numberOfLines={1}
                  >
                    {weather.name}
                  </Text>
                  {usingCurrentLocation && (
                    <Ionicons name="location" size={20} color="#ffffff" />
                  )}
                </View>
                <Text className="text-white/90 text-lg">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                className="bg-white/20 rounded-full p-3 active:bg-white/30"
              >
                <Ionicons name="search" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Weather Icon and Condition */}
            <View className="items-center mb-2">
              {weather.weather && weather.weather[0]?.icon ? (
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
                  }}
                  className="w-48 h-48 -my-6"
                  resizeMode="contain"
                  onError={() => console.log("Failed to load weather icon")}
                />
              ) : null}

              {/* Weather Condition with Emoji and Text */}
              <View className="flex-row items-center bg-white/20 rounded-full px-6 py-3 mb-4">
                <Text className="text-2xl mr-3">{currentCondition.emoji}</Text>
                <View>
                  <Text className="text-white text-lg font-semibold">
                    {currentCondition.text}
                  </Text>
                  <Text className="text-white/80 text-sm capitalize">
                    {weather.weather?.[0]?.description}
                  </Text>
                </View>
              </View>
            </View>

            {/* Temperature */}
            <View className="flex-row items-end mb-2 justify-center">
              <Text className="text-7xl font-black text-white">
                {Math.round(weather.main?.temp)}
              </Text>
              <Text className="text-4xl text-white/90 mb-3 ml-2">°C</Text>
            </View>

            {/* Feels Like */}
            <Text className="text-white/80 text-lg mb-8 text-center">
              Feels like {Math.round(weather.main?.feels_like)}°C
            </Text>

            {/* Location Actions */}
            <View className="flex-row justify-center space-x-4 mb-6">
              <TouchableOpacity
                onPress={fetchWeatherByCurrentLocation}
                className="bg-white/20 mr-4 rounded-full px-6 py-3 flex-row items-center active:bg-white/30"
              >
                <Ionicons name="location" size={16} color="#ffffff" />
                <Text className="text-white ml-2 font-medium">My Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                className="bg-white/20 rounded-full px-6 py-3 flex-row items-center active:bg-white/30"
              >
                <Ionicons name="search" size={16} color="#ffffff" />
                <Text className="text-white ml-2 font-medium">Search City</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Weather Details Card */}
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: slideUp }],
            }}
            className={`${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-t-3xl pt-8 px-6`}
          >
            {/* Weather Stats Grid */}
            <View className="bg-white/20 rounded-3xl p-6 backdrop-blur-lg -mt-10 mx-4 border border-white/30">
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold mb-4 text-center`}>
                Weather Details
              </Text>
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>
                    💧 Humidity
                  </Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {weather.main?.humidity ?? "N/A"}%
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>💨 Wind</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {weather.wind?.speed ?? "N/A"} m/s
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>
                    📊 Pressure
                  </Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {weather.main?.pressure ?? "N/A"} hPa
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>
                    👁️ Visibility
                  </Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {weather.visibility
                      ? `${(weather.visibility / 1000).toFixed(1)} km`
                      : "N/A"}
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>☁️ Clouds</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {weather.clouds?.all ?? "N/A"}%
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-sm mb-2`}>
                    🌡️ Feels Like
                  </Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                    {Math.round(weather.main?.feels_like ?? 0)}°C
                  </Text>
                </View>
              </View>
            </View>

            {/* 7-Day Forecast Section */}
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2 mt-6`}>
              7-Day Forecast
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mb-6`}>
              Daily weather predictions for {weather.name}
            </Text>

            {forecast &&
              forecast.map((day, index) => {
                const dayCondition = getWeatherCondition(day.weather.id, true);
                return (
                  <View
                    key={`${day.dt}-${index}`}
                    className={`flex-row items-center justify-between py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <View className="flex-1">
                      <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold text-lg`}>
                        {index === 0
                          ? "Today"
                          : new Date(day.dt * 1000).toLocaleDateString(
                              "en-US",
                              { weekday: "long" }
                            )}
                      </Text>
                      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
                        {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>

                    <View className="flex-row items-center flex-1 justify-center">
                      <Image
                        source={{
                          uri: `https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`,
                        }}
                        className="w-12 h-12"
                        resizeMode="contain"
                        onError={() =>
                          console.log("Failed to load forecast icon")
                        }
                      />
                      <View className="ml-2">
                        <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold text-sm`}>
                          {dayCondition.short}
                        </Text>
                        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs capitalize`}>
                          {day.weather.description}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>
                          {Math.round(day.maxTemp)}°
                        </Text>
                        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-semibold text-lg ml-2`}>
                          {Math.round(day.minTemp)}°
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

            {/* Weather Explanation Section */}
            <View className={`${isDark ? 'bg-gray-800' : 'bg-blue-50'} rounded-2xl p-6 my-6 border ${isDark ? 'border-gray-700' : 'border-blue-100'}`}>
              <Text className={`${isDark ? 'text-white' : 'text-blue-800'} font-bold text-lg mb-3`}>
                📋 Weather Condition Guide
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Text className="text-2xl w-10">☀️</Text>
                  <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'} flex-1`}>
                    Sunny/Clear - Bright and clear skies
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl w-10">⛅</Text>
                  <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'} flex-1`}>
                    Partly Cloudy - Mix of sun and clouds
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl w-10">🌧️</Text>
                  <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'} flex-1`}>
                    Rainy - Expect precipitation
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl w-10">⛈️</Text>
                  <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'} flex-1`}>
                    Stormy - Thunderstorms likely
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl w-10">🌨️</Text>
                  <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'} flex-1`}>
                    Snowy - Snowfall expected
                  </Text>
                </View>
              </View>
            </View>

            {/* Sunrise & Sunset */}
            <View className={`${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-orange-100 to-pink-100'} rounded-2xl p-6 my-6 ${isDark ? 'border-gray-700' : 'border-orange-100'}`}>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-lg mb-4`}>
                🌅 Sunrise & Sunset
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View className="bg-orange-500 rounded-full p-3 mb-2">
                    <Text className="text-white text-lg">🌅</Text>
                  </View>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Sunrise</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>
                    {weather.sys?.sunrise
                      ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "N/A"}
                  </Text>
                </View>

                <View className="items-center flex-1">
                  <View className="bg-purple-500 rounded-full p-3 mb-2">
                    <Text className="text-white text-lg">🌇</Text>
                  </View>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Sunset</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>
                    {weather.sys?.sunset
                      ? new Date(weather.sys.sunset * 1000).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="py-6 items-center">
              <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                Last updated:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </Text>
              <Text className={`${isDark ? 'text-gray-600' : 'text-gray-400'} text-xs mt-1`}>
                {usingCurrentLocation
                  ? "Using your current location"
                  : `Showing weather for ${weather.name}`}
              </Text>
              <Text className={`${isDark ? 'text-gray-600' : 'text-gray-400'} text-xs mt-1`}>
                Data provided by OpenWeatherMap
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}