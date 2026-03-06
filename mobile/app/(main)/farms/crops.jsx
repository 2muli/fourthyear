import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import axios from "axios";
import { API_URL } from "../../../utils/api";
import { useAuthStore } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../../src/i18n";
import { useTheme } from "@/context/ThemeContext";

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, isCheckingAuth, AuthedicatedUser, token } = useAuthStore();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme == "dark";

  // Sync i18n with language context
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const [editingCrop, setEditingCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    plantingDate: "",
    status: "Planted",
    farmId: "",
  });

  // Add these state variables at the top of your component with other states
  const [showPlantingDatePicker, setShowPlantingDatePicker] = useState(false);

  // Add these date change handlers
  const handlePlantingDateChange = (_, selectedDate) => {
    setShowPlantingDatePicker(false);
    if (selectedDate) {
      handleInputChange(
        "plantingDate",
        selectedDate.toISOString().split("T")[0],
      );
    }
  };
  // Status options
  const statusOptions = [
    "Planted",
    "Growing",
    "Flowering",
    "Harvested",
    "Failed",
  ];
  const unitOptions = ["kg", "tons", "bags", "crates"];

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
  useEffect(() => {
    AuthedicatedUser();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.replace("/Login");
    }
  }, [isCheckingAuth, user]);

  // Fetch crops
  const fetchCrops = async () => {
    try {
      setLoading(true);
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const res = await axios.get(`${API_URL}/crop/farmercrops`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCrops(res.data);
    } catch (error) {
      console.error("Error fetching crops:", error);
      Alert.alert("Error", "Failed to fetch crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
    fetchCrops();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      variety: "",
      plantingDate: "",
      status: "Planted",
      farmId: "",
    });
    setEditingCrop(null);
  };

  // Open modal for adding new crop
  const handleAddCrop = async () => {
    await fetchFarms(); // Refresh farms list
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing crop
  const handleEditCrop = async (crop) => {
    await fetchFarms(); // Refresh farms list
    setFormData({
      ...crop,
      farmId: crop.farmId || "", // Ensure farmId is set
    });
    setEditingCrop(crop);
    setModalVisible(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save crop (both add and edit)
  const handleSaveCrop = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.variety ||
      !formData.plantingDate ||
      !formData.farmId
    ) {
      Alert.alert(
        i18n.t("Error"),
        "Please fill in all required fields including farm selection",
      );
      return;
    }

    try {
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      if (editingCrop) {
        // Update existing crop
        await axios.put(`${API_URL}/crop/update/${editingCrop._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert(i18n.t("Success"), "Crop updated successfully");
      } else {
        // Add new crop
        await axios.post(
          `${API_URL}/crop/addcrop/${formData.farmId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Alert.alert("Success", "Crop added successfully");
      }

      setModalVisible(false);
      resetForm();
      fetchCrops()
    } catch (error) {
      console.error(
        "Error saving crop:",
        error.message || error.response?.data || error,
      );
      Alert.alert(
        i18n.t("Error"),
        `Failed to ${editingCrop ? i18n.t("update") : i18n.t("add")} crop`,
      );
    }
  };

  // Delete crop with confirmation
  const handleDeleteCrop = async (crop) => {
    Alert.alert(
      i18n.t("DeleteCrop"),
      `Are you sure you want to delete ${crop.name} - ${crop.variety}?`,
      [
        { text: i18n.t("Cancel"), style: "cancel" },
        {
          text: i18n.t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) {
                Alert.alert("Error", "Authentication token not found");
                return;
              }

              await axios.delete(`${API_URL}/crop/delete/${crop._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert(i18n.t("Success"), "Crop deleted successfully");
              fetchCrops(); // Refresh the crops list
            } catch (error) {
              console.error("Error deleting crop:", error);
              Alert.alert(i18n.t("Error"), "Failed to delete crop");
            }
          },
        },
      ],
    );
  };

  // Render table header
  const renderTableHeader = () => (
    <View className="flex-row bg-green-600 rounded-t-lg px-3 py-3">
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Name")}
      </Text>
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Variety")}
      </Text>
      <Text className="text-white font-bold flex-2 text-sm">
        {i18n.t("Status")}
      </Text>
      <Text className="text-white font-bold flex-1 text-sm">
        {i18n.t("Actions")}
      </Text>
    </View>
  );

  // Render status badge with colors
  const renderStatusBadge = (status) => {
    const statusColors = {
      Planted: "bg-blue-100 text-blue-800",
      Growing: "bg-green-100 text-green-800",
      Flowering: "bg-purple-100 text-purple-800",
      Harvested: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };

    return (
      <View className={`px-2 py-1 rounded-full ${statusColors[status]}`}>
        <Text className="text-xs font-medium">{status}</Text>
      </View>
    );
  };

  // Render each crop row
  const renderCropRow = ({ item }) => (
    <View className="flex-row bg-green-600 border-b border-gray-200 px-3 py-4 items-center">
      <Text className="font-medium text-gray-800 flex-2 text-sm">
        {item.name}
      </Text>
      <Text className="text-gray-600 flex-2 text-sm">{item.variety}</Text>
      <View className="flex-2">{renderStatusBadge(item.status)}</View>
      <View className="flex-1 flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleEditCrop(item)}
          className="bg-blue-100 p-1 rounded"
        >
          <Ionicons name="create-outline" size={16} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCrop(item)}
          className="bg-red-100 p-1 rounded"
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render crop details in card view
  const renderCropCard = ({ item }) => (
    <View
      className={`bg-gray-300 rounded-lg p-4 mb-3 shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text
          className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
        >
          {item.name}
        </Text>
        {renderStatusBadge(item.status)}
      </View>

      <Text className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-1`}>
        Variety: {item.variety}
      </Text>
      <Text className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-1`}>
        Planted: {new Date(item.plantingDate).toLocaleDateString()}
      </Text>

      <View className="flex-row justify-end space-x-2 mt-2">
        <TouchableOpacity
          onPress={() => handleEditCrop(item)}
          className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center mr-4"
        >
          <Ionicons name="create-outline" size={16} color="white" />
          <Text className="text-white font-medium ml-1">{i18n.t("Edit")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteCrop(item)}
          className="bg-red-600 px-3 py-2 rounded-lg flex-row items-center"
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
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-600"}`}>
      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} px-4 py-6 shadow-sm`}
      >
        <Text
          className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
        >
          {i18n.t("CropsManagement")}
        </Text>
        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {i18n.t("ManageCrops")}
        </Text>
      </View>

      {/* Action Bar */}
      <View
        className={`flex-row justify-between items-center px-4 py-4 ${isDark ? "bg-gray-800" : "bg-white"} mt-1 shadow-sm`}
      >
        <Text
          className={`text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {i18n.t("TotalCrops")}: {crops.length}
        </Text>

        <TouchableOpacity
          onPress={handleAddCrop}
          className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            {i18n.t("AddCrop")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table View for larger screens / Card view for mobile */}
      <View className="flex-1 px-4 py-4">
        {/* Desktop Table View */}
        <View className="hidden md:flex flex-1">
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}
          >
            {renderTableHeader()}
            <FlatList
              data={crops}
              renderItem={renderCropRow}
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
                {i18n.t("Loading")} crops...
              </Text>
            </View>
          ) : (
            <FlatList
              data={crops}
              renderItem={renderCropCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Empty State */}
        {!loading && crops.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons
              name="leaf-outline"
              size={64}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} text-lg mt-4`}
            >
              {i18n.t("NoCrops")}
            </Text>
            <Text
              className={`${isDark ? "text-gray-500" : "text-gray-400"} text-center mt-2`}
            >
              {i18n.t("AddFirstCrop")}
            </Text>
            <TouchableOpacity
              onPress={handleAddCrop}
              className={`${isDark ? "bg-green-600" : "bg-green-700"} px-6 py-3 rounded-lg mt-4`}
            >
              <Text className="text-white font-semibold">
                {i18n.t("AddFirstCrop")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add/Edit Crop Modal */}
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
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-white-200" : "text-gray-800"} mb-4`}
                >
                  {editingCrop ? i18n.t("EditCrop") : i18n.t("AddNewCrop")}
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
                          {farms.length == 0 ? (
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
                                className={`px-3 py-1 rounded-full ${
                                  formData.farmId === farm._id
                                    ? "bg-green-600"
                                    : isDark
                                      ? "bg-gray-600"
                                      : "bg-gray-200"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-medium ${
                                    formData.farmId === farm._id
                                      ? "text-white"
                                      : isDark
                                        ? "text-gray-300"
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
                      Crop Name *
                    </Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                      placeholder="e.g., Maize, Tomato, Beans"
                      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                      className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">
                      Variety *
                    </Text>
                    <TextInput
                      value={formData.variety}
                      onChangeText={(text) =>
                        handleInputChange("variety", text)
                      }
                      placeholder="e.g., DH02, Roma, Rosecoco"
                      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                      className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300"
                    />
                  </View>

                  <View className="flex-row space-x-3 mt-4 mb-4">
                    <View className="flex-1">
                      <Text className="text-gray-700 font-medium mb-2">
                        Planting Date *
                      </Text>
                      <View className="flex-row items-center">
                        <TextInput
                          value={
                            formData.plantingDate
                              ? new Date(formData.plantingDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChangeText={(text) =>
                            handleInputChange("plantingDate", text)
                          }
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 border border-gray-300 flex-1"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPlantingDatePicker(true)}
                          className="ml-2 p-3 bg-green-600 rounded-xl active:opacity-80"
                        >
                          <Ionicons name="calendar" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row space-x-3 mt-4 mb-4">
                    <View className="flex-1">
                      <Text className="text-gray-700 font-medium mb-2">
                        Status
                      </Text>
                      <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row space-x-2">
                            {statusOptions.map((status) => (
                              <TouchableOpacity
                                key={status}
                                onPress={() =>
                                  handleInputChange("status", status)
                                }
                                className={`px-3 py-1 rounded-full ${
                                  formData.status === status
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-medium ${
                                    formData.status === status
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
                    onPress={handleSaveCrop}
                    className="bg-green-600 px-6 py-3 rounded-xl ml-4"
                  >
                    <Text className="text-white font-medium">
                      {editingCrop ? i18n.t("EditCrop") : i18n.t("AddCrop")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker */}
      {showPlantingDatePicker && (
        <DateTimePicker
          value={new Date(formData.plantingDate || new Date())}
          mode="date"
          display="default"
          onChange={handlePlantingDateChange}
        />
      )}
    </View>
  );
}
