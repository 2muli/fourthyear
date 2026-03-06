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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/context/AuthContext";
import axios from "axios";
import { API_URL } from "../../../utils/api";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../../src/i18n";
import { useTheme } from "@/context/ThemeContext";

export default function Livestock() {
  const { user, isCheckingAuth, AuthedicatedUser, token } = useAuthStore();
  const [livestock, setLivestock] = useState([]);
  const [farms, setFarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    breed: "",
    quantity: "",
    healthStatus: "Healthy",
    farmId: "",
  });
  const { theme } = useTheme();
  const isDark = theme == "dark";
  const { language } = useLanguage();
  // Options for dropdowns
  const animalTypes = [
    "Cattle",
    "Chicken",
    "Goats",
    "Sheep",
    "Pigs",
    "Rabbits",
    "Fish",
    "Bees",
    "Other",
  ];
  const healthStatusOptions = ["Healthy", "Sick", "Pending", "Quarantined"];

  useEffect(() => {
    i18n.locale = language;
  }, [language]);
  // Fetch farms for farmId selection
  const fetchFarms = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const res = await axios.get(`${API_URL}/farm/farmerfarms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFarms(res.data);
    } catch (error) {
      console.error("Error fetching farms:", error);
      Alert.alert("Error", "Failed to fetch farms");
    }
  };

  // Fetch livestock
  const fetchLivestock = async () => {
    try {
      setLoading(true);
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const res = await axios.get(`${API_URL}/livestock/farmerlivestock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLivestock(res.data);
    } catch (error) {
      console.error("Error fetching livestock:", error);
      Alert.alert(i18n.t("Error"), i18n.t("FailedToFetchLivestock"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    } else if (user) {
      fetchFarms();
      fetchLivestock();
    }
  }, [isCheckingAuth, user]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "",
      breed: "",
      quantity: "",
      healthStatus: "Healthy",
      farmId: "",
    });
    setEditingAnimal(null);
  };

  // Open modal for adding new livestock
  const handleAddLivestock = async () => {
    await fetchFarms(); // Refresh farms list
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing livestock
  const handleEditLivestock = async (animal) => {
    await fetchFarms(); // Refresh farms list
    setFormData({
      ...animal,
      farmId: animal.farmId || "",
    });
    setEditingAnimal(animal);
    setModalVisible(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save livestock (both add and edit)
  const handleSaveLivestock = async () => {
    // Validation
    if (
      !formData.type ||
      !formData.breed ||
      !formData.quantity ||
      !formData.farmId
    ) {
      Alert.alert(i18n.t("Error"), i18n.t("PleaseFillInAllRequiredFields"));
      return;
    }

    try {
      if (!token) {
        Alert.alert(i18n.t("Error"), i18n.t("AuthenticationTokenNotFound"));
        return;
      }

      if (editingAnimal) {
        // Update existing livestock
        await axios.put(`${API_URL}/livestock/${editingAnimal._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert(i18n.t("Success"), i18n.t("LivestockUpdatedSuccessfully"));
      } else {
        // Add new livestock
        await axios.post(`${API_URL}/livestock/${formData.farmId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert(i18n.t("Success"), i18n.t("LivestockAddedSuccessfully"));
      }

      setModalVisible(false);
      resetForm();
      fetchLivestock(); // Refresh the livestock list
    } catch (error) {
      console.error("Error saving livestock:", error);
      Alert.alert(i18n.t("Error"), i18n.t("FailedToSaveLivestock"));
    }
  };

  // Delete livestock with confirmation
  const handleDeleteLivestock = async (animal) => {
    Alert.alert(
      i18n.t("DeleteLivestock"),
      `Are you sure you want to delete ${animal.quantity} ${animal.breed} ${animal.type}?`,
      [
        { text: i18n.t("Cancel"), style: "cancel" },
        {
          text: i18n.t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) {
                Alert.alert(
                  i18n.t("Error"),
                  i18n.t("AuthenticationTokenNotFound"),
                );
                return;
              }

              await axios.delete(`${API_URL}/livestock/${animal._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert(
                i18n.t("Success"),
                i18n.t("LivestockDeletedSuccessfully"),
              );
              fetchLivestock(); // Refresh the livestock list
            } catch (error) {
              console.error("Error deleting livestock:", error);
              Alert.alert(i18n.t("Error"), i18n.t("FailedToDeleteLivestock"));
            }
          },
        },
      ],
    );
  };

  // Calculate totals
  const totalAnimals = livestock.reduce(
    (sum, animal) => sum + parseInt(animal.quantity || 0),
    0,
  );
  const healthyAnimals = livestock.filter(
    (animal) => animal.healthStatus === "Healthy",
  ).length;

  // Render table header
  const renderTableHeader = () => (
    <View className="flex-row bg-blue-600 rounded-t-lg px-3 py-3">
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Type")}
      </Text>
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Breed")}
      </Text>
      <Text className="text-white font-bold flex-1 text-sm">
        {i18n.t("Quantity")}
      </Text>
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Health")}
      </Text>
      <Text className="text-white font-bold flex-1 text-sm">
        {i18n.t("Actions")}
      </Text>
    </View>
  );

  // Render health status badge with colors
  const renderHealthBadge = (status) => {
    const statusColors = {
      Healthy: "bg-green-100 text-green-800",
      Sick: "bg-red-100 text-red-800",
      Vaccinated: "bg-blue-100 text-blue-800",
      "Under Treatment": "bg-yellow-100 text-yellow-800",
      Quarantined: "bg-orange-100 text-orange-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <View
        className={`px-2 py-1 rounded-full ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
      >
        <Text className="text-xs font-medium">{status}</Text>
      </View>
    );
  };

  // Get animal icon based on type
  const getAnimalIcon = (type) => {
    const icons = {
      Cattle: "paw",
      Chicken: "egg",
      Goats: "git-compare",
      Sheep: "cloudy",
      Pigs: "nutrition",
      Rabbits: "ear",
      Fish: "water",
      Bees: "flower",
    };
    return icons[type] || "paw";
  };

  // Render each livestock row
  const renderLivestockRow = ({ item }) => (
    <View className="flex-row bg-white border-b border-gray-200 px-3 py-4 items-center">
      <View className="flex-row items-center flex-2">
        <Ionicons
          name={getAnimalIcon(item.type)}
          size={16}
          color="#4b5563"
          className="mr-2"
        />
        <Text className="font-medium text-gray-800 text-sm">{item.type}</Text>
      </View>
      <Text className="text-gray-600 flex-2 text-sm">{item.breed}</Text>
      <Text className="text-gray-600 flex-1 text-sm font-medium">
        {item.quantity}
      </Text>
      <View className="flex-2">{renderHealthBadge(item.healthStatus)}</View>
      <View className="flex-1 flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleEditLivestock(item)}
          className="bg-blue-100 p-1 rounded"
        >
          <Ionicons name="create-outline" size={16} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteLivestock(item)}
          className="bg-red-100 p-1 rounded"
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render livestock details in card view
  const renderLivestockCard = ({ item }) => (
    <View className="bg-gray-300 rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <Ionicons
            name={getAnimalIcon(item.type)}
            size={24}
            color="#3b82f6"
            className="mr-2"
          />
          <View>
            <Text className="text-lg font-bold text-gray-800">{item.type}</Text>
            <Text className="text-gray-600">{item.breed}</Text>
          </View>
        </View>
        {renderHealthBadge(item.healthStatus)}
      </View>

      <View className="grid grid-cols-2 gap-2 mb-3">
        <View>
          <Text className="text-gray-500 text-sm">{i18n.t("Quantity")}</Text>
          <Text className="text-gray-800 font-semibold">
            {item.quantity} animals
          </Text>
        </View>
      </View>

      <View className="flex-row justify-end space-x-2 mt-2">
        <TouchableOpacity
          onPress={() => handleEditLivestock(item)}
          className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="create-outline" size={16} color="white" />
          <Text className="text-white font-medium ml-1">{i18n.t("Edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteLivestock(item)}
          className="bg-red-600 px-3 py-2 rounded-lg flex-row items-center ml-4"
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text className="text-white font-medium ml-1">
            {i18n.t("Delete")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            {i18n.t("LivestockManagement")}
          </Text>
          <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {i18n.t("ManageLivestock")} and track their health and production
          </Text>
        </View>

        {/* Statistics Cards */}
        <View className="px-4 py-4">
          <View className="flex-row justify-between space-x-3">
            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="paw" size={24} color="#3b82f6" />
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("TotalAnimals")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {totalAnimals}
              </Text>
            </View>

            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="medkit" size={24} color="#10b981" />
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("Healthy")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {healthyAnimals}
              </Text>
            </View>

            <View
              className={`${isDark ? "bg-gray-700" : "bg-white"} flex-1 rounded-lg p-4 shadow-sm border border-gray-200`}
            >
              <View className="flex-row items-center">
                <Ionicons name="business" size={24} color="#8b5cf6" />
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} ml-2`}
                >
                  {i18n.t("Types")}
                </Text>
              </View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"} mt-2`}
              >
                {livestock.length}
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
            {i18n.t("LivestockTypes")}: {livestock.length}
          </Text>

          <TouchableOpacity
            onPress={handleAddLivestock}
            className={`bg-blue-600 px-4 py-2 rounded-lg flex-row items-center ${isDark ? "bg-blue-700" : ""}`}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {i18n.t("AddNewLivestock")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table View for larger screens / Card view for mobile */}
        <View className="flex-1 px-4 py-4">
          {/* Desktop Table View */}
          <View className="hidden md:flex flex-1">
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderTableHeader()}
              <FlatList
                data={livestock}
                renderItem={renderLivestockRow}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>

          {/* Mobile Card View */}
          <View className="flex-1 px-4 py-4">
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator
                  size="large"
                  color={`${isDark ? "#FFF" : "#000"}`}
                />
                <Text className="text-gray-500 mt-2">
                  {i18n.t("Loading")} livestock...
                </Text>
              </View>
            ) : (
              <FlatList
                data={livestock}
                renderItem={renderLivestockCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>

          {/* Empty State */}
          {!loading && livestock.length === 0 && (
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="paw-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4">
                {i18n.t("NoLivestock")}
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {i18n.t("AddFirstLivestock")}
              </Text>
              <TouchableOpacity
                onPress={handleAddLivestock}
                className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">
                  {i18n.t("AddFirstLivestock")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add/Edit Livestock Modal */}
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
                className={` ${isDark ? "bg-gray-300" : "bg-white"} rounded-2xl p-6 max-h-4/5`}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-2xl font-bold text-gray-800 mb-4">
                    {editingAnimal ? i18n.t("EditLivestock") : i18n.t("AddNewLivestock")}
                  </Text>

                  {/* Form Fields */}
                  <View className="space-y-4">
                    {/* Farm Selection */}
                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Select Farm *
                      </Text>
                      <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row space-x-2">
                            {farms.length === 0 ? (
                              <Text className="text-gray-500">
                                No farms available
                              </Text>
                            ) : (
                              farms.map((farm) => (
                                <TouchableOpacity
                                  key={farm._id}
                                  onPress={() =>
                                    handleInputChange("farmId", farm._id)
                                  }
                                  className={`px-3 py-2 rounded-full ${
                                    formData.farmId === farm._id
                                      ? "bg-green-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      formData.farmId === farm._id
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {farm.name}
                                  </Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </View>
                        </ScrollView>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Animal Type *
                      </Text>
                      <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row space-x-2">
                            {animalTypes.map((type) => (
                              <TouchableOpacity
                                key={type}
                                onPress={() => handleInputChange("type", type)}
                                className={`px-3 py-2 rounded-full flex-row items-center ${
                                  formData.type === type
                                    ? "bg-blue-600"
                                    : "bg-gray-200"
                                }`}
                              >
                                <Ionicons
                                  name={getAnimalIcon(type)}
                                  size={16}
                                  color={
                                    formData.type === type ? "white" : "#4b5563"
                                  }
                                  className="mr-1"
                                />
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

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Breed/Variety *
                      </Text>
                      <TextInput
                        value={formData.breed}
                        onChangeText={(text) =>
                          handleInputChange("breed", text)
                        }
                        placeholder="e.g., Friesian, Kienyeji, Galla"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                      />
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1 mr-4">
                        <Text className="text-gray-700 font-medium mb-2">
                          Number of Animals*
                        </Text>
                        <TextInput
                          value={formData.quantity?.toString() || ""}
                          onChangeText={(text) =>
                            handleInputChange("quantity", text)
                          }
                          placeholder="e.g., 12"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 font-medium mb-2">
                        Health Status
                      </Text>
                      <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row space-x-2">
                            {healthStatusOptions.map((status) => (
                              <TouchableOpacity
                                key={status}
                                onPress={() =>
                                  handleInputChange("healthStatus", status)
                                }
                                className={`px-3 py-2 rounded-full ${
                                  formData.healthStatus === status
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-medium ${
                                    formData.healthStatus === status
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {status}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row justify-end space-x-3 mt-6">
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="px-6 py-3 rounded-xl border border-gray-400 mr-4"
                    >
                      <Text className="text-gray-700 font-medium">{i18n.t("Cancel")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSaveLivestock}
                      className="bg-blue-600 px-6 py-3 rounded-xl"
                    >
                      <Text className="text-white font-medium">
                        {editingAnimal ? i18n.t("EditLivestock") : i18n.t("AddLivestock")}
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
