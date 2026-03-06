import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mockCrops = [
  { id: 1, name: 'Wheat', variety: 'HD-2967', plantingDate: '2024-01-15', harvestDate: '2024-04-20', status: 'Growing', farm: 'Green Valley Farm' },
  { id: 2, name: 'Rice', variety: 'Pusa Basmati', plantingDate: '2024-02-01', harvestDate: '2024-06-15', status: 'Planted', farm: 'Sunrise Fields' },
  { id: 3, name: 'Corn', variety: 'Sweet Corn', plantingDate: '2024-01-20', harvestDate: '2024-04-30', status: 'Harvested', farm: 'Green Valley Farm' },
];

export default function CropList() {
  const navigation = useNavigation();
  const [crops, setCrops] = useState(mockCrops);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planted': return 'bg-blue-100 text-blue-800';
      case 'Growing': return 'bg-green-100 text-green-800';
      case 'Harvested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteCrop = (cropId, cropName) => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${cropName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCrop(cropId) },
      ]
    );
  };

  const deleteCrop = (cropId) => {
    const updatedCrops = crops.filter(crop => crop.id !== cropId);
    setCrops(updatedCrops);
    Alert.alert('Success', 'Crop deleted successfully');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Manage Crops</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddCrop')}
            className="p-2"
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {crops.map((crop) => (
          <View key={crop.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800 mr-2">
                    {crop.name}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(crop.status)}`}>
                    <Text className="text-xs font-medium">{crop.status}</Text>
                  </View>
                </View>
                
                <Text className="text-gray-600 text-sm mb-1">Variety: {crop.variety}</Text>
                <Text className="text-gray-600 text-sm mb-1">Farm: {crop.farm}</Text>
                
                <View className="flex-row space-x-4 mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text className="text-gray-600 text-sm ml-1">Planted: {crop.plantingDate}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={14} color="#666" />
                    <Text className="text-gray-600 text-sm ml-1">Harvest: {crop.harvestDate}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditCrop', { crop })}
                  className="p-2 bg-blue-50 rounded-lg"
                >
                  <Ionicons name="create-outline" size={18} color="#2196F3" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleDeleteCrop(crop.id, crop.name)}
                  className="p-2 bg-red-50 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}