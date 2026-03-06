import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mockFarms = ['Green Valley Farm', 'Sunrise Fields', 'Mountain View Ranch'];
const cropTypes = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Vegetables', 'Fruits'];

export default function CropForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { crop } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    farm: '',
    plantingDate: '',
    harvestDate: '',
    area: '',
    notes: '',
  });

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || '',
        variety: crop.variety || '',
        farm: crop.farm || '',
        plantingDate: crop.plantingDate || '',
        harvestDate: crop.harvestDate || '',
        area: crop.area || '',
        notes: crop.notes || '',
      });
    }
  }, [crop]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.variety || !formData.farm || !formData.plantingDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Alert.alert(
      'Success',
      crop ? 'Crop updated successfully' : 'Crop created successfully',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">
            {crop ? 'Edit Crop' : 'Add Crop'}
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Crop Type *</Text>
            <View className="flex-row flex-wrap -mx-1">
              {cropTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, name: type })}
                  className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                    formData.name === type
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={formData.name === type ? 'text-white font-medium' : 'text-gray-700'}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Variety *</Text>
            <TextInput
              value={formData.variety}
              onChangeText={(text) => setFormData({ ...formData, variety: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Enter crop variety"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Farm *</Text>
            <View className="flex-row flex-wrap -mx-1">
              {mockFarms.map((farm) => (
                <TouchableOpacity
                  key={farm}
                  onPress={() => setFormData({ ...formData, farm })}
                  className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                    formData.farm === farm
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={formData.farm === farm ? 'text-white font-medium' : 'text-gray-700'}>
                    {farm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row space-x-3 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Planting Date *</Text>
              <TextInput
                value={formData.plantingDate}
                onChangeText={(text) => setFormData({ ...formData, plantingDate: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Harvest Date</Text>
              <TextInput
                value={formData.harvestDate}
                onChangeText={(text) => setFormData({ ...formData, harvestDate: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Area</Text>
            <TextInput
              value={formData.area}
              onChangeText={(text) => setFormData({ ...formData, area: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., 10 acres"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Notes</Text>
            <TextInput
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 h-20"
              placeholder="Additional notes..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-green-500 rounded-lg py-4 items-center ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                {crop ? 'Update Crop' : 'Create Crop'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}