import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

import { API_URL } from "@/utils/api";
import { useAuthStore } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "../../../src/i18n";

export default function Activities() {
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    activityDate: "",
    description: "",
  });

  const typeOptions = [
    "Planting",
    "Harvesting",
    "Irrigation",
    "Fertilizing",
    "Pruning",
    "Weeding",
    "Pest Control",
    "Disease Management",
    "Other",
  ];

  /* ================= i18n ================= */
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  /* ================= HELPERS ================= */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ================= FETCH ================= */
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/activity/farmer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(res.data || []);
    } catch {
      Alert.alert(i18n.t("Error"), "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  /* ================= MODAL ================= */
  const openAddModal = () => {
    setEditingActivity(null);
    setFormData({ type: "", activityDate: "", description: "" });
    setModalVisible(true);
  };

  const openEditModal = (activity) => {
    setEditingActivity(activity);
    setFormData({
      type: activity.type,
      activityDate: activity.activityDate.slice(0, 10),
      description: activity.description,
    });
    setModalVisible(true);
  };

  /* ================= SAVE ================= */
  const saveActivity = async () => {
    if (!formData.type || !formData.activityDate) {
      Alert.alert(i18n.t("Error"), "Please fill required fields");
      return;
    }

    try {
      if (editingActivity) {
        await axios.put(
          `${API_URL}/activity/update/${editingActivity._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(`${API_URL}/activity`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setModalVisible(false);
      fetchActivities();
    } catch {
      Alert.alert(i18n.t("Error"), "Failed to save activity");
    }
  };

  /* ================= DELETE ================= */
  const deleteActivity = (id) => {
    Alert.alert(i18n.t("Confirm"), "Delete this activity?", [
      { text: i18n.t("Cancel"), style: "cancel" },
      {
        text: i18n.t("Delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/activity/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert(i18n.t("Success"), "Activity deleted successfully");
            setActivities((prev) => prev.filter((a) => a._id !== id));
          } catch (error) {
            console.log(error);
            Alert.alert(i18n.t("Error"), "Delete failed");
          }
        },
      },
    ]);
  };

  /* ================= DATE PICKER ================= */
  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange(
        "activityDate",
        selectedDate.toISOString().split("T")[0],
      );
    }
  };

  /* ================= RENDER ================= */
  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-green-600"}`}>
      {/* HEADER */}
      <View className={`${isDark ? "bg-gray-800" : "bg-white"} px-4 py-6`}>
        <Text
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          {i18n.t("FarmActivitiesManagement")}
        </Text>
        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {i18n.t("Manageallfarmactivities")}
        </Text>
      </View>

      {/* ACTION BAR */}
      <View
        className={`flex-row justify-between items-center px-4 py-4 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {i18n.t("TotalActivities")}: {activities.length}
        </Text>

        <TouchableOpacity
          onPress={openAddModal}
          className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            {i18n.t("AddActivity")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <View className="flex-1 px-4 py-4">
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : activities.length === 0 ? (
          <Text className="text-center text-gray-500 mt-6">
            {i18n.t("Noactivitiesfound")}
          </Text>
        ) : (
          <ScrollView>
            {activities.map((activity) => (
              <View
                key={activity._id}
                className={`rounded-xl p-4 mb-4 ${
                  isDark ? "bg-gray-700" : "bg-white"
                }`}
              >
                <Text className="bg-green-600 text-white px-3 py-1 rounded-full self-start mb-2">
                  {activity.type}
                </Text>

                <Text className={`${isDark ? "text-white" : "text-gray-800"}`}>
                  {new Date(activity.activityDate).toDateString()}
                </Text>

                <Text
                  className={`mt-1 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {activity.description}
                </Text>

                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity onPress={() => openEditModal(activity)}
                  className="bg-blue-500 px-4 py-2 rounded-lg">
                    <Text className="text-white">{i18n.t("Edit")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteActivity(activity._id)}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white">{i18n.t("Delete")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50 justify-center p-4">
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6`}
            >
              <ScrollView>
                <Text
                  className={`text-2xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {editingActivity
                    ? i18n.t("EditActivity")
                    : i18n.t("AddActivity")}
                </Text>

                {/* ACTIVITY TYPE */}
                <Text className="text-gray-700 font-medium mb-2">
                  Activity Type *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2 mb-4">
                    {typeOptions.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => handleInputChange("type", type)}
                        className={`px-4 py-2 rounded-full ${
                          formData.type === type
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`${
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

                {/* DATE */}
                <Text className="text-gray-700 font-medium mb-2">
                  Activity Date *
                </Text>
                <View className="flex-row items-center mb-4">
                  <TextInput
                    editable={false}
                    value={formData.activityDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9c9595"
                    className="flex-1 bg-gray-100 text-gray-600 rounded-xl px-4 py-3 border border-gray-300"
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="ml-2 p-3 bg-green-600 rounded-xl"
                  >
                    <Ionicons name="calendar" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* DESCRIPTION */}
                <Text className="text-gray-700 font-medium mb-2">
                  Activity Description
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Description i.e Planted maize"
                  placeholderTextColor="#9c9595"
                  value={formData.description}
                  onChangeText={(text) =>
                    handleInputChange("description", text)
                  }
                  className="bg-gray-100 text-gray-600 rounded-xl px-4 py-3 border border-gray-300 mb-6"
                />

                {/* ACTIONS */}
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="px-6 py-3 rounded-xl border border-gray-400"
                  >
                    <Text>{i18n.t("Cancel")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={saveActivity}
                    className="bg-green-600 px-6 py-3 rounded-xl ml-4"
                  >
                    <Text className="text-white font-medium">
                      {i18n.t("Save")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.activityDate || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}