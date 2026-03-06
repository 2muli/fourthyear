import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CropDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { crop } = route.params || {};

  if (!crop) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Crop not found</Text>
      </View>
    );
  }

  const cropStats = [
    { label: 'Growth Stage', value: getGrowthStage(crop.plantingDate), icon: 'trending-up', color: '#4CAF50' },
    { label: 'Days Since Planting', value: getDaysSince(crop.plantingDate), icon: 'calendar', color: '#2196F3' },
    { label: 'Estimated Yield', value: '5.2 tons', icon: 'stats-chart', color: '#FF9800' },
    { label: 'Health', value: 'Excellent', icon: 'heart', color: '#E91E63' },
  ];

  const tasks = [
    { id: 1, task: 'Apply fertilizer', due: 'Tomorrow', completed: false },
    { id: 2, task: 'Weed control', due: 'In 3 days', completed: false },
    { id: 3, task: 'Irrigation', due: 'Today', completed: true },
  ];

  function getGrowthStage(plantingDate) {
    const planted = new Date(plantingDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return 'Seedling';
    if (diffDays < 60) return 'Vegetative';
    if (diffDays < 90) return 'Flowering';
    return 'Maturity';
  }

  function getDaysSince(plantingDate) {
    const planted = new Date(plantingDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleEdit = () => {
    navigation.navigate('EditCrop', { crop });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${crop.name} - ${crop.variety}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'Crop deleted successfully');
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
          <Text className="text-lg font-bold text-black">Crop Details</Text>
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
          {/* Crop Header */}
          <View className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-gray-100">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="leaf" size={32} color="#4CAF50" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">{crop.name}</Text>
              <Text className="text-gray-600 mb-3">{crop.variety}</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 text-sm font-medium">{cropStats[0].value}</Text>
              </View>
            </View>
          </View>

          {/* Crop Stats */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Crop Overview</Text>
            <View className="flex-row flex-wrap justify-between">
              {cropStats.map((stat, index) => (
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

          {/* Crop Information */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Crop Information</Text>
            
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="business-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Farm</Text>
                <Text className="text-gray-800">{crop.farm}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Planting Date</Text>
                <Text className="text-gray-800">{crop.plantingDate}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="calendar" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Expected Harvest</Text>
                <Text className="text-gray-800">{crop.harvestDate}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="resize-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Area</Text>
                <Text className="text-gray-800">{crop.area || '10 acres'}</Text>
              </View>
            </View>
          </View>

          {/* Upcoming Tasks */}
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">Upcoming Tasks</Text>
              <TouchableOpacity>
                <Text className="text-green-500 font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            
            {tasks.map((task) => (
              <View key={task.id} className="flex-row items-center mb-4 last:mb-0">
                <TouchableOpacity className="mr-3">
                  <Ionicons 
                    name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={task.completed ? "#4CAF50" : "#666"} 
                  />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.task}
                  </Text>
                  <Text className="text-xs text-gray-500">Due: {task.due}</Text>
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
              <Text className="text-white font-semibold">Edit Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Info', 'Weather data would be shown here')}
              className="flex-1 bg-orange-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">Weather</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}