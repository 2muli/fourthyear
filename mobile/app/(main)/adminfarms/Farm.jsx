import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FarmForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { farm } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    soilType: 'Loam',
    description: '',
  });

  const soilTypes = ['Loam', 'Clay', 'Sandy', 'Silt', 'Peat'];

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        location: farm.location || '',
        size: farm.size || '',
        soilType: farm.soilType || 'Loam',
        description: farm.description || '',
      });
    }
  }, [farm]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.location.trim() || !formData.size.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Alert.alert(
      'Success',
      farm ? 'Farm updated successfully' : 'Farm created successfully',
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
            {farm ? 'Edit Farm' : 'Add Farm'}
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Farm Name *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Enter farm name"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Location *</Text>
            <TextInput
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Enter location"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Size *</Text>
            <TextInput
              value={formData.size}
              onChangeText={(text) => setFormData({ ...formData, size: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., 50 acres"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Soil Type</Text>
            <View className="flex-row flex-wrap -mx-1">
              {soilTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, soilType: type })}
                  className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                    formData.soilType === type
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={formData.soilType === type ? 'text-white font-medium' : 'text-gray-700'}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 h-24"
              placeholder="Enter farm description"
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
                {farm ? 'Update Farm' : 'Create Farm'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}