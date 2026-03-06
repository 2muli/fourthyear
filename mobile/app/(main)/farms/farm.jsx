import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { useAuthStore } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../../src/i18n";
import { API_URL } from "../../../utils/api";
import { useTheme } from "@/context/ThemeContext";

export default function Farm() {
  const { user, isCheckingAuth, AuthedicatedUser, token } = useAuthStore();
  const { language } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme == "dark";
  // Sync i18n with language context
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/farm/farmerfarms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarms(res.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to load farms",
      );
    } finally {
      setLoading(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Mixed Farming",
    size: "",
    sizeUnit: "acres",
    location: "",
    soilType: "Volcanic Loam",
    established: "",
    description: "",
    irrigation: "Rain-fed",
    ownership: "Family Owned",
    employees: "",
  });

  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);

  // Enhanced Options
  const farmTypes = [
    "Mixed Farming",
    "Crop Farming",
    "Dairy",
    "Poultry",
    "Horticulture",
    "Fish Farming",
    "Bee Keeping",
    "Organic Farming",
    "Viticulture",
    "Sericulture",
    "Apiculture",
    "Vermiculture",
  ];

  const sizeUnits = ["acres", "hectares", "square meters"];

  const soilTypes = [
    "Volcanic Loam",
    "Clay Loam",
    "Sandy Loam",
    "Clay",
    "Sandy",
    "Loamy Sand",
    "Peat",
    "Silt",
    "Chalky",
  ];

  const irrigationTypes = [
    "Rain-fed",
    "Drip Irrigation",
    "Sprinkler",
    "Flood Irrigation",
    "Center Pivot",
    "Sub-surface",
    "Manual",
  ];

  const ownershipTypes = [
    "Family Owned",
    "Private Limited",
    "Cooperative",
    "Partnership",
    "Corporate",
    "Community Owned",
  ];

  // Get auth token from your auth store
  const getAuthToken = async () => {
    // Implement based on your auth store structure
    return token || "";
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "Mixed Farming",
      size: "",
      sizeUnit: "acres",
      location: "",
      soilType: "Volcanic Loam",
      established: "",
      description: "",
      irrigation: "Rain-fed",
      ownership: "Family Owned",
      employees: "",
    });
    setEditingFarm(null);
  };

  // Open modal for adding new farm
  const handleAddFarm = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing farm
  const handleEditFarm = (farm) => {
    setFormData({
      name: farm.name || "",
      type: farm.type || "Mixed Farming",
      size: farm.size ? farm.size.toString() : "",
      sizeUnit: farm.sizeUnit || "acres",
      location: farm.location || "",
      soilType: farm.soilType || "Volcanic Loam",
      established: farm.established || "",
      description: farm.description || "",
      irrigation: farm.irrigation || "Rain-fed",
      ownership: farm.ownership || "Family Owned",
      employees: farm.employees ? farm.employees.toString() : "",
    });
    setEditingFarm(farm);
    setModalVisible(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create new farm
  const handleCreateFarm = async () => {
    try {
      // Validation
      if (
        !formData.name ||
        !formData.size ||
        !formData.location ||
        !formData.established ||
        !formData.ownership
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const token = await getAuthToken();
      const farmData = {
        name: formData.name,
        type: formData.type,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
        location: formData.location,
        soilType: formData.soilType,
        established: formData.established,
        description: formData.description,
        irrigation: formData.irrigation,
        ownership: formData.ownership,
        employees: formData.employees
          ? parseInt(formData.employees)
          : undefined,
      };

      const res = await axios.post(`${API_URL}/farm`, farmData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFarms((prev) => [...prev, res.data]);
      Alert.alert("Success", "Farm created successfully");
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create farm",
      );
    }
  };

  // Update farm
  const handleUpdateFarm = async () => {
    try {
      if (
        !formData.name ||
        !formData.size ||
        !formData.location ||
        !formData.established ||
        !formData.ownership
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const token = await getAuthToken();
      const farmData = {
        name: formData.name,
        type: formData.type,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
        location: formData.location,
        soilType: formData.soilType,
        established: formData.established,
        description: formData.description,
        irrigation: formData.irrigation,
        ownership: formData.ownership,
        employees: formData.employees
          ? parseInt(formData.employees)
          : undefined,
      };

      const res = await axios.put(
        `${API_URL}/farm/${editingFarm._id}`,
        farmData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setFarms((prev) =>
        prev.map((farm) => (farm._id === editingFarm._id ? res.data : farm)),
      );
      Alert.alert(i18n.t("Success"), i18n.t("FarmUpdatedSuccessfully"));
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.log(error);
      Alert.alert(
        i18n.t("Error"),
        error.response?.data?.error || i18n.t("FailedToUpdateFarm"),
      );
    }
  };

  // Delete farm with confirmation
  const handleDeleteFarm = async (farm) => {
    Alert.alert(
      i18n.t("DeleteFarm"),
      `Are you sure you want to delete ${farm.name}? This action cannot be undone.`,
      [
        { text: i18n.t("Cancel"), style: "cancel" },
        {
          text: i18n.t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAuthToken();
              await axios.delete(`${API_URL}/farm/${farm._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setFarms((prev) => prev.filter((f) => f._id !== farm._id));
              Alert.alert(i18n.t("Success"), i18n.t("FarmDeletedSuccessfully"));
            } catch (error) {
              console.log(error);
              Alert.alert(
                i18n.t("Error"),
                error.response?.data?.error || i18n.t("FailedToDeleteFarm"),
              );
            }
          },
        },
      ],
    );
  };

  // Save farm (both add and edit)
  const handleSaveFarm = () => {
    if (editingFarm) {
      handleUpdateFarm();
    } else {
      handleCreateFarm();
    }
  };

  // Calculate statistics
  const totalFarms = farms.length;
  const totalArea = farms.reduce(
    (sum, farm) => sum + parseFloat(farm.size || 0),
    0,
  );
  const farmTypesCount = [...new Set(farms.map((farm) => farm.type))].length;
  const totalEmployees = farms.reduce(
    (sum, farm) => sum + parseInt(farm.employees || 0),
    0,
  );

  // Render farm card
  const renderFarmCard = ({ item }) => (
    <View className="bg-gray-300 rounded-xl p-4 mb-4 shadow-lg border border-gray-200">
      {/* Farm Image and Basic Info */}
      <View className="flex-row mb-4">
        <View className="w-20 h-20 bg-green-100 rounded-lg justify-center items-center mr-4">
          <Ionicons name="business" size={32} color="#16a34a" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800 mb-1">
            {item.name || ""}
          </Text>
          <Text className="text-green-600 font-medium mb-1">{item.type || ""}</Text>
          <Text className="text-gray-600 text-sm">
            {item.size || 0} {item.sizeUnit || ""} • {item.location || ""}
          </Text>
        </View>
      </View>

      {/* Farm Details */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2">{item.description || ""}</Text>

        <View className="flex-row flex-wrap mb-2">
          <View className="bg-blue-100 px-2 py-1 rounded-full mr-2 mb-2">
            <Text className="text-blue-800 text-xs">Soil: {item.soilType || ""}</Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded-full mr-2 mb-2">
            <Text className="text-green-800 text-xs">
              Irrigation: {item.irrigation || ""}
            </Text>
          </View>
          <View className="bg-purple-100 px-2 py-1 rounded-full mr-2 mb-2">
            <Text className="text-purple-800 text-xs">{item.ownership || ""}</Text>
          </View>
          {item.employees && (
            <View className="bg-orange-100 px-2 py-1 rounded-full mr-2 mb-2">
              <Text className="text-orange-800 text-xs">
                {item.employees || 0} Employees
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={() => handleEditFarm(item)}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="create-outline" size={16} color="white" />
          <Text className="text-white font-medium ml-1">{i18n.t("Edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteFarm(item)}
          className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center ml-4"
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text className="text-white font-medium ml-1">
            {i18n.t("Delete")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-400"}`}>
        {/* Header */}
        <View
          className={`${isDark ? "bg-gray-700" : "bg-white"} px-4 py-6 shadow-sm`}
        >
          <Text
            className={`text-3xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mb-2`}
          >
            {i18n.t("FarmManagement")}
          </Text>
          <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {i18n.t("ManageFarms")}
          </Text>
        </View>

        {/* Enhanced Statistics Cards */}
        <View className="px-4 py-4">
          <View className="flex-row justify-between space-x-3">
            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="business" size={24} color="#16a34a" />
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("TotalFarms")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {totalFarms}
              </Text>
            </View>

            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="map" size={24} color="#3b82f6" />
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("TotalArea")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {totalArea} acres
              </Text>
            </View>

            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="layers" size={24} color="#8b5cf6" />
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("FarmTypes")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {farmTypesCount}
              </Text>
            </View>

            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="people" size={24} color="#f59e0b" />
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("Employees")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {totalEmployees}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View
          className={`flex-row justify-between items-center px-4 py-4 ${isDark ? "bg-gray-700" : "bg-white"} mt-1 shadow-sm`}
        >
          <Text
            className={`text-lg font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            {i18n.t("TotalFarmsList")}: {farms.length}
          </Text>

          <TouchableOpacity
            onPress={handleAddFarm}
            className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {i18n.t("AddNewFarm")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Farms List */}
        <View className="flex-1 px-4 py-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator
                size="large"
                color={`${isDark ? "#FFF" : "#000"}`}
              />
              <Text className="text-gray-600 mt-2">
                {i18n.t("LoadingFarms")}...
              </Text>
            </View>
          ) : (
            <FlatList
              data={farms}
              renderItem={renderFarmCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {/* Empty State */}
          {!loading && farms.length === 0 && (
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="business-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4">
                {i18n.t("NoFarm")}
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {i18n.t("AddFirstCrop")}
              </Text>
              <TouchableOpacity
                onPress={handleAddFarm}
                className="bg-green-600 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">
                  {i18n.t("AddFirstCrop")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add/Edit Farm Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="flex-1 justify-center bg-black bg-opacity-50 p-4">
              <View
                className={`${isDark ? "bg-gray-300" : "bg-white"} rounded-2xl p-6 max-h-4/5`}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-2xl font-bold text-gray-800 mb-4">
                    {editingFarm ? i18n.t("EditFarm") : i18n.t("AddNewFarm")}
                  </Text>

                  {/* Form Fields */}
                  <View className="space-y-4">
                    {/* Basic Information */}
                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Farm Name *
                      </Text>
                      <TextInput
                        value={formData.name}
                        onChangeText={(text) => handleInputChange("name", text)}
                        placeholder="e.g., Green Valley Farm"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Farm Type
                      </Text>
                      <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row space-x-2">
                            {farmTypes.map((type) => (
                              <TouchableOpacity
                                key={type}
                                onPress={() => handleInputChange("type", type)}
                                className={`px-3 py-2 rounded-full ${
                                  formData.type === type
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-medium ${
                                    formData.type === type
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {type}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-gray-700 font-medium mb-2">
                          Farm Size *
                        </Text>
                        <TextInput
                          value={formData.size}
                          onChangeText={(text) =>
                            handleInputChange("size", text)
                          }
                          placeholder="e.g., 50"
                          keyboardType="numeric"
                          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                        />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-gray-700 font-medium mb-2">
                          Unit
                        </Text>
                        <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View className="flex-row space-x-2">
                              {sizeUnits.map((unit) => (
                                <TouchableOpacity
                                  key={unit}
                                  onPress={() =>
                                    handleInputChange("sizeUnit", unit)
                                  }
                                  className={`px-3 py-2 rounded-full ${
                                    formData.sizeUnit === unit
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      formData.sizeUnit === unit
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {unit}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Location *
                      </Text>
                      <TextInput
                        value={formData.location}
                        onChangeText={(text) =>
                          handleInputChange("location", text)
                        }
                        placeholder="e.g., Kiambu, Kenya"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                      />
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-gray-700 font-medium mb-2">
                          Soil Type
                        </Text>
                        <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View className="flex-row space-x-2">
                              {soilTypes.map((soil) => (
                                <TouchableOpacity
                                  key={soil}
                                  onPress={() =>
                                    handleInputChange("soilType", soil)
                                  }
                                  className={`px-3 py-2 rounded-full ${
                                    formData.soilType === soil
                                      ? "bg-yellow-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      formData.soilType === soil
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {soil}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-gray-700 font-medium mb-2">
                          Established Year *
                        </Text>
                        <TextInput
                          value={formData.established}
                          onChangeText={(text) =>
                            handleInputChange("established", text)
                          }
                          placeholder="e.g., 2015"
                          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                        />
                      </View>
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-gray-700 font-medium mb-2">
                          Irrigation System
                        </Text>
                        <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View className="flex-row space-x-2">
                              {irrigationTypes.map((irrigation) => (
                                <TouchableOpacity
                                  key={irrigation}
                                  onPress={() =>
                                    handleInputChange("irrigation", irrigation)
                                  }
                                  className={`px-3 py-2 rounded-full ${
                                    formData.irrigation === irrigation
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      formData.irrigation === irrigation
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {irrigation}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-gray-700 font-medium mb-2">
                          Ownership Type *
                        </Text>
                        <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View className="flex-row space-x-2">
                              {ownershipTypes.map((ownership) => (
                                <TouchableOpacity
                                  key={ownership}
                                  onPress={() =>
                                    handleInputChange("ownership", ownership)
                                  }
                                  className={`px-3 py-2 rounded-full ${
                                    formData.ownership === ownership
                                      ? "bg-purple-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      formData.ownership === ownership
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {ownership}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                    </View>

                    {/* Business Information */}
                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-gray-700 font-medium mb-2">
                          Employees
                        </Text>
                        <TextInput
                          value={formData.employees}
                          onChangeText={(text) =>
                            handleInputChange("employees", text)
                          }
                          placeholder="e.g., 8"
                          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                          keyboardType="numeric"
                          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                        />
                      </View>
                    </View>
                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Farm Description
                      </Text>
                      <TextInput
                        value={formData.description}
                        onChangeText={(text) =>
                          handleInputChange("description", text)
                        }
                        placeholder="Describe your farm, practices, and specialties..."
                        multiline
                        numberOfLines={3}
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                      />
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row justify-end space-x-3 mt-6">
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="px-6 py-3 rounded-xl border border-gray-400"
                    >
                      <Text className="text-gray-700 font-medium">{i18n.t("Cancel")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSaveFarm}
                      className="bg-green-600 px-6 py-3 rounded-xl ml-4"
                    >
                      <Text className="text-white font-medium">
                        {editingFarm ? i18n.t("EditFarm") : i18n.t("AddFarm")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
