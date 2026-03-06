import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mockLivestock = [
  { id: 1, type: 'Dairy Cattle', breed: 'Holstein', count: 50, farm: 'Green Valley Farm', health: 'Healthy' },
  { id: 2, type: 'Poultry', breed: 'Rhode Island Red', count: 200, farm: 'Sunrise Fields', health: 'Vaccinated' },
  { id: 3, type: 'Goats', breed: 'Boer', count: 30, farm: 'Mountain View Ranch', health: 'Healthy' },
];

export default function LivestockList() {
  const navigation = useNavigation();
  const [livestock, setLivestock] = useState(mockLivestock);

  const getHealthColor = (health) => {
    switch (health) {
      case 'Healthy': return 'bg-green-100 text-green-800';
      case 'Vaccinated': return 'bg-blue-100 text-blue-800';
      case 'Sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteLivestock = (id, type) => {
    Alert.alert(
      'Delete Livestock',
      `Are you sure you want to delete ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLivestock(id) },
      ]
    );
  };

  const deleteLivestock = (id) => {
    const updated = livestock.filter(item => item.id !== id);
    setLivestock(updated);
    Alert.alert('Success', 'Livestock record deleted successfully');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Manage Livestock</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddLivestock')}
            className="p-2"
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {livestock.map((item) => (
          <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800 mr-2">
                    {item.type}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${getHealthColor(item.health)}`}>
                    <Text className="text-xs font-medium">{item.health}</Text>
                  </View>
                </View>
                
                <Text className="text-gray-600 text-sm mb-1">Breed: {item.breed}</Text>
                <Text className="text-gray-600 text-sm mb-1">Farm: {item.farm}</Text>
                
                <View className="flex-row items-center mt-2">
                  <Ionicons name="paw-outline" size={14} color="#666" />
                  <Text className="text-gray-600 text-sm ml-1">{item.count} animals</Text>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditLivestock', { livestock: item })}
                  className="p-2 bg-blue-50 rounded-lg"
                >
                  <Ionicons name="create-outline" size={18} color="#2196F3" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleDeleteLivestock(item.id, item.type)}
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