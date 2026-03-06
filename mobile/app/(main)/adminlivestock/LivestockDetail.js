import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function LivestockDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { livestock } = route.params || {};

  if (!livestock) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Livestock not found</Text>
      </View>
    );
  }

  const livestockStats = [
    { label: 'Total Animals', value: livestock.count, icon: 'paw', color: '#FF9800' },
    { label: 'Health Status', value: livestock.health, icon: 'medkit', color: getHealthColor(livestock.health) },
    { label: 'Average Weight', value: '450 kg', icon: 'speedometer', color: '#2196F3' },
    { label: 'Feed Required', value: '25 kg/day', icon: 'nutrition', color: '#4CAF50' },
  ];

  const healthRecords = [
    { id: 1, date: '2024-01-15', type: 'Vaccination', vet: 'Dr. Sharma', status: 'Completed' },
    { id: 2, date: '2024-01-10', type: 'Health Check', vet: 'Dr. Patel', status: 'Completed' },
    { id: 3, date: '2024-01-25', type: 'Deworming', vet: 'Scheduled', status: 'Pending' },
  ];

  function getHealthColor(health) {
    switch (health) {
      case 'Healthy': return '#4CAF50';
      case 'Vaccinated': return '#2196F3';
      case 'Sick': return '#F44336';
      case 'Under Treatment': return '#FF9800';
      default: return '#666';
    }
  }

  function getHealthIcon(health) {
    switch (health) {
      case 'Healthy': return 'heart';
      case 'Vaccinated': return 'shield-checkmark';
      case 'Sick': return 'medical';
      case 'Under Treatment': return 'bandage';
      default: return 'help';
    }
  }

  const handleEdit = () => {
    navigation.navigate('EditLivestock', { livestock });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Livestock',
      `Are you sure you want to delete ${livestock.type} - ${livestock.breed}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'Livestock record deleted successfully');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Livestock Details</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={handleEdit} className="p-2">
              <Ionicons name="create-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Ionicons name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Livestock Header */}
          <View className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-gray-100">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="paw" size={32} color="#FF9800" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">{livestock.type}</Text>
              <Text className="text-gray-600 mb-3">{livestock.breed}</Text>
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${getHealthColor(livestock.health)}20` }}
              >
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getHealthIcon(livestock.health)} 
                    size={16} 
                    color={getHealthColor(livestock.health)} 
                  />
                  <Text 
                    className="ml-1 text-sm font-medium"
                    style={{ color: getHealthColor(livestock.health) }}
                  >
                    {livestock.health}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Livestock Stats */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Livestock Overview</Text>
            <View className="flex-row flex-wrap justify-between">
              {livestockStats.map((stat, index) => (
                <View key={index} className="w-[48%] items-center mb-4">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text className="text-lg font-bold text-gray-800 text-center">{stat.value}</Text>
                  <Text className="text-xs text-gray-600 text-center">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Livestock Information */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Livestock Information</Text>
            
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="business-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Farm</Text>
                <Text className="text-gray-800">{livestock.farm}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="paw-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Breed</Text>
                <Text className="text-gray-800">{livestock.breed}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="people-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Total Animals</Text>
                <Text className="text-gray-800">{livestock.count}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="medkit-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Health Status</Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getHealthIcon(livestock.health)} 
                    size={16} 
                    color={getHealthColor(livestock.health)} 
                  />
                  <Text 
                    className="ml-1 font-medium"
                    style={{ color: getHealthColor(livestock.health) }}
                  >
                    {livestock.health}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Health Records */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">Health Records</Text>
              <TouchableOpacity>
                <Text className="text-green-500 font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            
            {healthRecords.map((record) => (
              <View key={record.id} className="flex-row items-center mb-4 last:mb-0">
                <View 
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    record.status === 'Completed' ? 'bg-green-100' : 'bg-orange-100'
                  }`}
                >
                  <Ionicons 
                    name="medical" 
                    size={20} 
                    color={record.status === 'Completed' ? '#4CAF50' : '#FF9800'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{record.type}</Text>
                  <Text className="text-xs text-gray-500">
                    {record.date} • {record.vet}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                  record.status === 'Completed' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    record.status === 'Completed' ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    {record.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 bg-blue-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">Edit Record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Info', 'Add new health record')}
              className="flex-1 bg-green-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">Health Check</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}