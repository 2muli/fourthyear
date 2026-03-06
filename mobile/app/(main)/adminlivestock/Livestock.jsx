import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mockFarms = ['Green Valley Farm', 'Sunrise Fields', 'Mountain View Ranch'];
const animalTypes = ['Dairy Cattle', 'Beef Cattle', 'Poultry', 'Goats', 'Sheep', 'Pigs', 'Fish'];
const healthStatuses = ['Healthy', 'Vaccinated', 'Sick', 'Under Treatment', 'Quarantined'];

export default function LivestockForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { livestock } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    breed: '',
    farm: '',
    count: '',
    healthStatus: 'Healthy',
    notes: '',
  });

  useEffect(() => {
    if (livestock) {
      setFormData({
        type: livestock.type || '',
        breed: livestock.breed || '',
        farm: livestock.farm || '',
        count: livestock.count?.toString() || '',
        healthStatus: livestock.health || 'Healthy',
        notes: livestock.notes || '',
      });
    }
  }, [livestock]);

  const handleSubmit = async () => {
    if (!formData.type || !formData.breed || !formData.farm || !formData.count) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Alert.alert(
      'Success',
      livestock ? 'Livestock updated successfully' : 'Livestock created successfully',
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
            {livestock ? 'Edit Livestock' : 'Add Livestock'}
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Animal Type *</Text>
            <View className="flex-row flex-wrap -mx-1">
              {animalTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, type })}
                  className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                    formData.type === type
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={formData.type === type ? 'text-white font-medium' : 'text-gray-700'}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Breed *</Text>
            <TextInput
              value={formData.breed}
              onChangeText={(text) => setFormData({ ...formData, breed: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Enter breed"
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

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Count *</Text>
            <TextInput
              value={formData.count}
              onChangeText={(text) => setFormData({ ...formData, count: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Number of animals"
              keyboardType="numeric"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Health Status</Text>
            <View className="flex-row flex-wrap -mx-1">
              {healthStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormData({ ...formData, healthStatus: status })}
                  className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                    formData.healthStatus === status
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={formData.healthStatus === status ? 'text-white font-medium' : 'text-gray-700'}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                {livestock ? 'Update Livestock' : 'Create Livestock'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}