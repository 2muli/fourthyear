import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FarmDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { farm } = route.params || {};

  if (!farm) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Farm not found</Text>
      </View>
    );
  }

  const farmStats = [
    { label: 'Total Crops', value: farm.crops || 8, icon: 'leaf', color: '#4CAF50' },
    { label: 'Total Livestock', value: farm.livestock || 120, icon: 'paw', color: '#FF9800' },
    { label: 'Farm Size', value: farm.size || '50 acres', icon: 'resize', color: '#2196F3' },
    { label: 'Status', value: farm.status || 'Active', icon: 'checkmark-circle', color: farm.status === 'Active' ? '#4CAF50' : '#F44336' },
  ];

  const recentActivities = [
    { id: 1, action: 'Wheat planted', time: '2 days ago', type: 'crop' },
    { id: 2, action: 'Cattle health check', time: '1 week ago', type: 'livestock' },
    { id: 3, action: 'Soil testing completed', time: '2 weeks ago', type: 'maintenance' },
  ];

  const handleEdit = () => {
    navigation.navigate('EditFarm', { farm });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete ${farm.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'Farm deleted successfully');
          },
        },
      ]
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'crop': return 'leaf-outline';
      case 'livestock': return 'paw-outline';
      case 'maintenance': return 'build-outline';
      default: return 'notifications-outline';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'crop': return '#4CAF50';
      case 'livestock': return '#FF9800';
      case 'maintenance': return '#2196F3';
      default: return '#666';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Farm Details</Text>
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
          {/* Farm Header */}
          <View className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-gray-100">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="business" size={32} color="#4CAF50" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-2">{farm.name}</Text>
              <View className={`px-3 py-1 rounded-full mb-2 ${
                farm.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  farm.status === 'Active' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {farm.status}
                </Text>
              </View>
              <Text className="text-gray-600">{farm.location}</Text>
            </View>
          </View>

          {/* Farm Stats */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Farm Overview</Text>
            <View className="flex-row flex-wrap justify-between">
              {farmStats.map((stat, index) => (
                <View key={index} className="w-[48%] items-center mb-4">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{stat.value}</Text>
                  <Text className="text-xs text-gray-600 text-center">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Farm Information */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Farm Information</Text>
            
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="location-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Location</Text>
                <Text className="text-gray-800">{farm.location}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="resize-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Size</Text>
                <Text className="text-gray-800">{farm.size}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="leaf-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Soil Type</Text>
                <Text className="text-gray-800">{farm.soilType || 'Loam'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Established</Text>
                <Text className="text-gray-800">{farm.establishedDate || '2020'}</Text>
              </View>
            </View>
          </View>

          {/* Recent Activities */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">Recent Activities</Text>
              <TouchableOpacity>
                <Text className="text-green-500 font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentActivities.map((activity) => (
              <View key={activity.id} className="flex-row items-center mb-4 last:mb-0">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                >
                  <Ionicons 
                    name={getActivityIcon(activity.type)} 
                    size={20} 
                    color={getActivityColor(activity.type)} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{activity.action}</Text>
                  <Text className="text-xs text-gray-500">{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Crops'    )}
              className="flex-1 bg-green-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">View Crops</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Livestock' )}
              className="flex-1 bg-orange-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">View Animals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}