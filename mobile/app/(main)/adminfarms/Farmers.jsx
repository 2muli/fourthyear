import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mockFarms = [
  { id: 1, name: 'Green Valley Farm', location: 'New Delhi', size: '50 acres', crops: 8, livestock: 120, status: 'Active' },
  { id: 2, name: 'Sunrise Fields', location: 'Punjab', size: '25 acres', crops: 5, livestock: 80, status: 'Active' },
  { id: 3, name: 'Mountain View Ranch', location: 'Himachal', size: '100 acres', crops: 12, livestock: 200, status: 'Inactive' },
];

export default function FarmList() {
  const navigation = useNavigation();
  const [farms, setFarms] = useState(mockFarms);
  const [loading, setLoading] = useState(false);

  const handleDeleteFarm = (farmId, farmName) => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete ${farmName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFarm(farmId),
        },
      ]
    );
  };

  const deleteFarm = async (farmId) => {
    const updatedFarms = farms.filter(farm => farm.id !== farmId);
    setFarms(updatedFarms);
    Alert.alert('Success', 'Farm deleted successfully');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Manage Farms</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddFarm')}
            className="p-2"
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {farms.map((farm) => (
          <TouchableOpacity
            key={farm.id}
            onPress={() => navigation.navigate('FarmDetails', { farm })}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800 mr-2">
                    {farm.name}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${
                    farm.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      farm.status === 'Active' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {farm.status}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-1">
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text className="text-gray-600 text-sm ml-2">{farm.location}</Text>
                </View>
                
                <View className="flex-row items-center mb-1">
                  <Ionicons name="resize-outline" size={16} color="#666" />
                  <Text className="text-gray-600 text-sm ml-2">{farm.size}</Text>
                </View>
                
                <View className="flex-row space-x-4 mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="leaf-outline" size={14} color="#4CAF50" />
                    <Text className="text-gray-600 text-sm ml-1">{farm.crops} Crops</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="paw-outline" size={14} color="#FF9800" />
                    <Text className="text-gray-600 text-sm ml-1">{farm.livestock} Animals</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditFarm', { farm })}
                  className="p-2 bg-blue-50 rounded-lg"
                >
                  <Ionicons name="create-outline" size={18} color="#2196F3" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleDeleteFarm(farm.id, farm.name)}
                  className="p-2 bg-red-50 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}