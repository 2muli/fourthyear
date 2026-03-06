import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import i18n from "../../../src/i18n";
import * as Location from "expo-location";
import axios from "axios";
import { API_KEY, API_BASE_URL } from "../../../env";
import { API_URL } from "../../../utils/api";

export default function Home() {
  const navigation = useNavigation();
  const { user, token, isCheckingAuth, AuthedicatedUser } = useAuthStore();
  const {language}=useLanguage();
  const {theme}=useTheme();
  const isDark= theme == "dark";
  const [profileImage, setProfileImage] = useState(null);

  // Sync i18n with language context
  useEffect(()=>{
    i18n.locale=language;
  },[language])

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(false);
  const [activityloading,setActivityLoading]= useState(false);
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [livestockLoading, setLivestockLoading] = useState(false);
  const [healthyLivestocks, setHealthyLivestocks] = useState([]);
  const [healthyLivestocksLoading, setHealthyLivestocksLoading] = useState(false);
  
  const fade = useRef(new Animated.Value(0)).current;

  // Weather condition mapping
  const getWeatherCondition = useCallback((weatherCode, isDay = true) => {
    const conditions = {
      200: { emoji: "⛈️", text: "Thunderstorm with Rain", short: "Storm" },
      201: { emoji: "⛈️", text: "Thunderstorm", short: "Storm" },
      202: { emoji: "⛈️", text: "Heavy Thunderstorm", short: "Heavy Storm" },
      210: { emoji: "🌩️", text: "Light Thunderstorm", short: "Thunder" },
      211: { emoji: "🌩️", text: "Thunderstorm", short: "Thunder" },
      212: { emoji: "🌩️", text: "Heavy Thunderstorm", short: "Heavy Thunder" },
      221: { emoji: "🌩️", text: "Ragged Thunderstorm", short: "Thunder" },
      230: { emoji: "⛈️", text: "Thunderstorm with Drizzle", short: "Storm" },
      231: { emoji: "⛈️", text: "Thunderstorm with Drizzle", short: "Storm" },
      232: { emoji: "⛈️", text: "Heavy Thunderstorm with Drizzle", short: "Heavy Storm" },
      300: { emoji: "🌧️", text: "Light Drizzle", short: "Drizzle" },
      301: { emoji: "🌧️", text: "Drizzle", short: "Drizzle" },
      302: { emoji: "🌧️", text: "Heavy Drizzle", short: "Heavy Drizzle" },
      310: { emoji: "🌧️", text: "Light Drizzle Rain", short: "Drizzle" },
      311: { emoji: "🌧️", text: "Drizzle Rain", short: "Drizzle" },
      312: { emoji: "🌧️", text: "Heavy Drizzle Rain", short: "Heavy Drizzle" },
      313: { emoji: "🌧️", text: "Shower Rain and Drizzle", short: "Rain" },
      314: { emoji: "🌧️", text: "Heavy Shower Rain and Drizzle", short: "Heavy Rain" },
      321: { emoji: "🌧️", text: "Shower Drizzle", short: "Drizzle" },
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
      800: {
        emoji: isDay ? "☀️" : "🌙",
        text: isDay ? "Clear Sky" : "Clear Night",
        short: isDay ? "Sunny" : "Clear",
      },
      801: {
        emoji: isDay ? "🌤️" : "🌙",
        text: "Few Clouds",
        short: "Mostly Sunny",
      },
      802: { emoji: "⛅", text: "Scattered Clouds", short: "Partly Cloudy" },
      803: { emoji: "🌥️", text: "Broken Clouds", short: "Cloudy" },
      804: { emoji: "☁️", text: "Overcast Clouds", short: "Overcast" },
    };

    return conditions[weatherCode] || { emoji: "🌈", text: "Unknown", short: "Unknown" };
  }, []);

  const fetchWeatherByCurrentLocation = useCallback(async () => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      setUsingCurrentLocation(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setWeatherError("Location permission required for weather data");
        setWeatherLoading(false);
        return;
      }

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
      setWeatherError("Failed to get your location");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      const currentUrl = `${API_BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const currentResponse = await axios.get(currentUrl, { timeout: 10000 });

      setWeather(currentResponse.data);
      setWeatherError(null);

      // Trigger animation when data is loaded
      Animated.timing(fade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Weather data fetch error:", error);
      setWeatherError("Failed to fetch weather data");
    }
  }, [fade]);

  const getWeatherGradient = useCallback((temp) => {
    if (temp === undefined || temp === null) return ["#4facfe", "#00f2fe"];
    if (temp < 0) return ["#667eea", "#764ba2"];
    if (temp < 10) return ["#4facfe", "#00f2fe"];
    if (temp < 20) return ["#43e97b", "#38f9d7"];
    if (temp < 30) return ["#fa709a", "#fee140"];
    return ["#ff9a9e", "#fecfef"];
  }, []);

  const getWeatherForecast = useCallback((temp, condition) => {
    if (!temp || !condition) return "Good for planting";
    
    const tempNum = Math.round(temp);
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes("rain") || conditionLower.includes("storm")) {
      return "Avoid outdoor activities";
    } else if (conditionLower.includes("snow") || conditionLower.includes("freezing")) {
      return "Protect crops from frost";
    } else if (tempNum > 30) {
      return "Increase irrigation frequency";
    } else if (tempNum < 10) {
      return "Protect sensitive crops";
    } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
      return "Good for planting";
    } else if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
      return "Ideal for harvesting";
    } else {
      return "Good for planting";
    }
  }, []);

  // Original dashboard state
  const [refreshing, setRefreshing] = useState(false);

  const statisticsData = {
    totalFarms: 8,
    totalCrops: 12,
    totalLivestock: 1500,
    totalArea: 235,
    healthyAnimals: 1450,
    upcomingHarvests: 3,
    pendingTasks: 5,
    monthlyRevenue: "KES 4,200,000",
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh weather data along with other data
    fetchWeatherByCurrentLocation();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    if (user) {
      setProfileImage(user.profilePicture || null);
    }
  }, [user]);

  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);

  // Initialize weather data
  useEffect(() => {
    fetchWeatherByCurrentLocation();
  }, [fetchWeatherByCurrentLocation]);
  useEffect(()=>{
    fetchFarms();
  },[])
 useEffect(()=>{
  fetchCrops();
 },[])
 useEffect(()=>{
  fetchLivestock();
 },[])
 useEffect(()=>{
  fetchHealthyLivestocks();
 },[])
 useEffect(() => {
      fetchActivities();
    }, []);
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };
  const fetchFarms=async()=>{
    try {
      setFarmsLoading(true);
      const response=await axios.get(`${API_URL}/farm/farmerfarms`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      setFarms(response.data);
            
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch farms");
    }finally{
      setFarmsLoading(false);
    }
    
  }
  const fetchActivities = async () => {
      try {
        setActivityLoading(true);
        const res = await axios.get(`${API_URL}/activity/farmer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(res.data);
      } catch {
        Alert.alert(i18n.t("Error"), "Failed to load activities");
      } finally {
        setActivityLoading(false);
      }
    };

  const fetchCrops=async()=>{
    try {
      setCropsLoading(true)
      const crops= await axios.get(`${API_URL}/crop/farmercrops`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      setCrops(crops.data);
      
    } catch (error) {
      console.log("Error fetching crops",error);
      Alert.alert("Error", "Failed to fetch crops");
    }finally{
      setCropsLoading(false);
    }
  }
  const fetchLivestock= async ()=>{
     try {
      setLivestockLoading(true);
      const livestocks= await axios.get(`${API_URL}/livestock/farmerlivestock`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      setLivestock(livestocks.data);
      
     } catch (error) {
      console.log("Error fetching livestock",error);
      Alert.alert("Error", "Failed to fetch livestock");
     }finally{
      setLivestockLoading(false)
     }
  }
  const fetchHealthyLivestocks=async()=>{
  try {
    setHealthyLivestocksLoading(true);
    const healthyLivestocks= await axios.get(`${API_URL}/livestock/healthylivestocksforfarmer`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });
    setHealthyLivestocks(healthyLivestocks.data);
    
  } catch (error) {
    console.log("Error fetching healthy livestock",error);
    Alert.alert("Error", "Failed to fetch healthy livestock");
  }finally{
     setHealthyLivestocksLoading(false);
  }
  }
 const unhealthyLivestocks=livestock.length-healthyLivestocks.length;
  // Calculate statistics
  const totalArea = farms.reduce(
    (sum, farm) => sum + parseFloat(farm.size || 0),
    0
  );
  const farmTypesCount = [...new Set(farms.map((farm) => farm.type))].length;
  const totalEmployees = farms.reduce(
    (sum, farm) => sum + parseInt(farm.employees || 0),
    0
  );
  const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 7)
    return days === 1 ? "1 day ago" : `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};
  // Greetings based on the time of day
  const getCurrentTime = () => {
    const date = new Date();
    const hours = date.getHours();

    if (hours >= 0 && hours < 12) {
      return i18n.t("greetmorning")+"🌅";
    } else if (hours >= 12 && hours < 18) {
      return  i18n.t("greetafternoon")+"☀️";
    } else if (hours >= 18 && hours < 22) {
      return i18n.t("greetafternoon")+"🌤️";
    } else {
      return i18n.t("greetnight")+"🌃";
    }
  };

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Get current weather condition for dashboard
  const currentCondition = weather ? getWeatherCondition(weather.weather?.[0]?.id, true) : null;
  const weatherForecast = weather ? getWeatherForecast(weather.main?.temp, currentCondition?.text) : "Good for planting";

  // Render statistics cards without function
  const StatCard = ({ icon, value, label }) => (
    <View className={`bg-white rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{value}</Text>
          <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{label}</Text>
        </View>
        <Ionicons name={icon} size={32} color="#6b7280" />
      </View>
    </View>
  );
  console.log(user.role)
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 ${isDark ? "bg-gray-900":"bg-green-300"}`}>
        {/* Header */}
        <View className="bg-green-600 pt-14 pb-5 px-5 flex-row justify-between items-center">
          {/* Menu Button */}
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">Home</Text>

          {/* Profile Icon */}
          <TouchableOpacity onPress={() => router.push("/Profile")}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-12 h-12 rounded-full mt-2"
              />
            ) : (
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with Welcome */}
          <View className="bg-green-600 px-6 py-8">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white text-2xl font-bold">
                  {getCurrentTime()}   
                </Text>
                <Text className="text-green-100 text-lg mt-1">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-green-200 mt-2">
                {i18n.t("welcome")}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Weather Card */}
          <View className="px-6 -mt-6">
            <Animated.View 
              style={{ opacity: fade }}
              className={`${isDark ?"bg-gray-700":"bg-white"} rounded-xl p-4 shadow-lg border border-gray-200`}>
              {weatherLoading ? (
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">Loading...</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Fetching weather data</Text>
                  </View>
                  <ActivityIndicator size="small" color="#f59e0b" />
                </View>
              ) : weatherError ? (
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">--°C</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Weather unavailable</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {weatherError}
                    </Text>
                  </View>
                  <Ionicons name="cloud-offline" size={48} color="#6b7280" />
                </View>
              ) : weather ? (
                <>
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className={`text-3xl font-bold ${isDark ? "text-gray-200" : "text-gray-500"}`}>
                        {Math.round(weather.main?.temp)}°C
                      </Text>
                      <Text className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>{currentCondition?.text}</Text>
                      <Text className={`${isDark ? "text-gray-200" : "text-gray-500"} text-sm mt-1`}>
                        Humidity: {weather.main?.humidity}%
                      </Text>
                      <Text className={`${isDark ? "text-gray-200" : "text-gray-500"} text-sm`}>
                        Feels like: {Math.round(weather.main?.feels_like)}°C
                      </Text>
                    </View>
                    <View className="items-center">
                      {weather.weather && weather.weather[0]?.icon ? (
                        <Image
                          source={{
                            uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                          }}
                          className="w-16 h-16"
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="partly-sunny" size={48} color="#f59e0b" />
                      )}
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {weather.name}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <Text className="text-green-600 font-medium">
                      {weatherForecast}
                    </Text>
                  </View>
                </>
              ) : (
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">--°C</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>No weather data</Text>
                  </View>
                  <Ionicons name="partly-sunny" size={48} color="#f59e0b" />
                </View>
              )}
            </Animated.View>
          </View>

          {/* Quick Actions - Static without loops */}
          <View className="px-6 mt-6">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>
              {i18n.t("QuickActions")}
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {/* Crop Management */}
              <TouchableOpacity
                className={`${isDark ?"bg-gray-700":"bg-green-500"} rounded-xl p-4 flex-1 m-1 min-w-[45%]`}
                onPress={() => router.push("/(main)/farms/crops")}
              >
                <Ionicons name="leaf" size={24} color="white" />
                <Text className="text-white font-semibold mt-2 text-lg">
                  {i18n.t("Crops")}
                </Text>
                <Text className="text-white text-opacity-90 text-sm mt-1">
                  {i18n.t("ManageCrops")}
                </Text>
              </TouchableOpacity>

              {/* Livestock Management */}
              <TouchableOpacity
                className={`${isDark ?"bg-gray-700":"bg-blue-500"} rounded-xl p-4 flex-1 m-1 min-w-[45%]`}
                onPress={() => router.push("/(main)/farms/Livestock")}
              >
                <Ionicons name="paw" size={24} color="white" />
                <Text className="text-white font-semibold mt-2 text-lg">
                  {i18n.t("Livestock")}
                </Text>
                <Text className="text-white text-opacity-90 text-sm mt-1">
                  {i18n.t("ManageLivestock")}
                </Text>
              </TouchableOpacity>

              {/* Disease Scanner */}
              <TouchableOpacity
                className={`${isDark ?"bg-gray-700":"bg-purple-500"} rounded-xl p-4 flex-1 m-1 min-w-[45%]`}
                onPress={() => router.push("/(main)/ImageScan")}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text className="text-white font-semibold mt-2 text-lg">
                  {i18n.t("ScanDisease")}
                </Text>
                <Text className="text-white text-opacity-90 text-sm mt-1">
                  {i18n.t("ScanDisease")}
                </Text>
              </TouchableOpacity>

              {/* Farm Management */}
              <TouchableOpacity
                className={`${isDark ?"bg-gray-700":"bg-orange-500"} rounded-xl p-4 flex-1 m-1 min-w-[45%]`}
                onPress={() => router.push("/(main)/farms/farm")}
              >
                <Ionicons name="business" size={24} color="white" />
                <Text className="text-white font-semibold mt-2 text-lg">
                  {i18n.t("Farm")}
                </Text>
                <Text className="text-white text-opacity-90 text-sm mt-1">
                  {i18n.t("ManageFarm")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Farm Overview - Static without loops */}
          <View className="px-6 mt-6">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>
              {i18n.t("FarmOverview")}
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {/* Total Farms */}
              <View className="w-1/2 pr-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {farms?.length || 0}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("TotalFarms")}
                      </Text>
                    </View>
                    <Ionicons name="business" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>

              {/* Active Crops */}
              <View className="w-1/2 pl-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {crops.length || 0}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("ActiveCrops")}
                      </Text>
                    </View>
                    <Ionicons name="leaf" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>

              {/* Livestock */}
              <View className="w-1/2 pr-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {livestock.length || 0}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("Livestock")}
                      </Text>
                    </View>
                    <Ionicons name="paw" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>

              {/* Total Area */}
              <View className="w-1/2 pl-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {totalArea || 0} acres
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("TotalArea")}
                      </Text>
                    </View>
                    <Ionicons name="map" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Additional Stats - Static without loops */}
          <View className="px-6 mt-2">
            <View className="flex-row flex-wrap justify-between">
              {/* Healthy Animals */}
              <View className="w-1/2 pr-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {healthyLivestocks.length || 0}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("HealthyAnimals")}
                      </Text>
                    </View>
                    <Ionicons name="medkit" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>

              {/* Upcoming Harvests */}
              <View className="w-1/2 pl-2 mb-4">
                <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {unhealthyLivestocks || 0}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                        {i18n.t("DiseasedAnimals")}
                      </Text>
                    </View>
                    <Ionicons name="basket" size={32} color={`${isDark ? "#9ca3af" : "#6b7280"}`} />
                  </View>
                </View>
              </View>

              {/* Pending Tasks
              <View className="w-1/2 pr-2 mb-4">
                <View className={`bg-white rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {statisticsData.pendingTasks}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Pending Tasks
                      </Text>
                    </View>
                    <Ionicons name="alert-circle" size={32} color="#6b7280" />
                  </View>
                </View>
              </View>

              {/* Monthly Revenue */}
              {/* <View className="w-1/2 pl-2 mb-4">
                <View className={`bg-white rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {statisticsData.monthlyRevenue}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Monthly Revenue
                      </Text>
                    </View>
                    <Ionicons name="cash" size={32} color="#6b7280" />
                  </View>
                </View>
                </View> */}
            </View>
          </View>

          {/* Alerts Section - Static without loops */}
          <View className="px-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                {i18n.t("Alerts")}
              </Text>
              <View className={`${isDark ? "bg-gray-700":"bg-red-500"} rounded-full w-2 h-2`}></View>
            </View>
            <View className={`${isDark ? "bg-gray-700":"bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              {/* Alert 1 */}
              <View className={`border-l-4 rounded-r-lg p-3 mb-2 ${isDark ? "bg-gray-400":"bg-yellow-50"} border-l-yellow-400`}>
                <View className="flex-row items-start">
                  <Ionicons
                    name="warning"
                    size={20}
                    className="mr-2 text-yellow-600"
                  />
                  <View className="flex-1">
                    <Text className={`${isDark ? "text-gray-700" : "text-gray-800"} font-medium`}>
                      Pest alert: Army worms detected in maize fields
                    </Text>
                    <Text className={`${isDark ? "text-white-700":"text-gray-500" } text-sm mt-1`}>Today</Text>
                  </View>
                </View>
              </View>

              {/* Alert 2 */}
              <View className={`border-l-4 rounded-r-lg p-3 mb-2 ${isDark ? "bg-gray-300":"bg-blue-50"} border-l-blue-400`}>
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    className="mr-2 text-blue-600"
                  />
                  <View className="flex-1">
                    <Text className={`${isDark ? "text-gray-700" : "text-gray-800"} font-medium`}>
                      Tomatoes ready for harvest in 3 days
                    </Text>
                    <Text className={`${isDark ? "text-white-700":"text-gray-500" } text-sm mt-1`}>
                      Yesterday
                    </Text>
                  </View>
                </View>
              </View>

              {/* Alert 3 */}
              <View className={`border-l-4 rounded-r-lg p-3 mb-2 ${isDark ? "bg-gray-400":"bg-green-50"} border-l-green-400`}>
                <View className="flex-row items-start">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    className="mr-2 text-green-600"
                  />
                  <View className="flex-1">
                    <Text className={`${isDark ? "text-gray-800" : "text-gray-800"} font-medium`}>
                      All livestock vaccinations up to date
                    </Text>
                    <Text className={`${isDark ? "text-white-700" : "text-gray-500"} text-sm mt-1`}>
                      2 days ago
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Activities - Static without loops */}
          <View className="px-6 mt-6 mb-8">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>
              {i18n.t("RecentActivities")}
            </Text>
            <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              {/* Activity 1 */}
            {activities.length == 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Text className={`${isDark ? "text-gray-400" : "text-gray-700"} text-center`}>
                  {i18n.t("NoActivities")}
                </Text>
              </View>
            ) : (
              activities.slice(0,5).map((activity, index) => (
              <View key={index} className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <View className={`${isDark ? "bg-gray-600" : "bg-gray-100"} p-2 rounded-full mr-3`}>
                  <Ionicons name="leaf" size={20} color={isDark ? "#ffffff" : "#4b5563"} />
                </View>
                <View className="flex-1">
                  <Text className={`${isDark ? "text-gray-200" : "text-gray-800"} font-medium`}>
                    {activity.type}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-gray-500"} text-sm`}>
                    {activity.description} • {timeAgo(activity.createdAt)} 
                  </Text>
                </View>
              </View>
              ))
              )}
            </View>
          </View>

          {/* Farm Performance */}
          <View className="px-6 mt-4 mb-8">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>
              Farm Performance
            </Text>
            <View className={`${isDark ? "bg-gray-700" : "bg-white"} rounded-xl p-4 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className={`${isDark ? "text-white" : "text-gray-600"}`}>Crop Health</Text>
                <View className="flex-row items-center">
                  <View className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></View>
                  </View>
                  <Text className="text-green-600 font-medium">85%</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className={`${isDark ? "text-white" : "text-gray-600"}`}>Livestock Health</Text>
                <View className="flex-row items-center">
                  <View className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></View>
                  </View>
                  <Text className="text-green-600 font-medium">92%</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className={`${isDark ? "text-white" : "text-gray-600"}`}>Equipment Status</Text>
                <View className="flex-row items-center">
                  <View className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <View
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></View>
                  </View>
                  <Text className="text-yellow-600 font-medium">75%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips & Recommendations */}
          <View className="px-6 mt-4 mb-8">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>
              {i18n.t("FarmingTips")}
            </Text>
            <View className={`${isDark ? "bg-gray-600" : "bg-blue-50"} rounded-xl p-4 border border-blue-200`}>
              <View className="flex-row items-start">
                <Ionicons
                  name="bulb"
                  size={24}
                  color="#3b82f6"
                  className="mr-3"
                />
                <View className="flex-1">
                  <Text className="text-blue-900 font-semibold text-lg">
                    Seasonal Advice
                  </Text>
                  <Text className="text-blue-900 mt-1">
                    This is a good time to plant maize and beans. Consider
                    rotating your crops to maintain soil health.
                  </Text>
                  <Text className="text-blue-900 text-sm mt-2">
                    Recommended for this week
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
          