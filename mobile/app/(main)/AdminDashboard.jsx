import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const {theme}=useTheme();
  const isDark= theme == "dark";

  // Sample data
  const statsData = [
    { label: 'Total Farms', value: '24', icon: 'business', color: '#4CAF50' },
    { label: 'Active Users', value: '156', icon: 'people', color: '#2196F3' },
    { label: 'Crops Monitored', value: '18', icon: 'leaf', color: '#8BC34A' },
    { label: 'Revenue', value: '$12.4K', icon: 'trending-up', color: '#FF9800' },
  ];

  const recentActivities = [
    { id: 1, action: 'New farm registered', time: '2 min ago', type: 'farm' },
    { id: 2, action: 'Crop scan completed', time: '15 min ago', type: 'scan' },
    { id: 3, action: 'Weather alert sent', time: '1 hour ago', type: 'weather' },
    { id: 4, action: 'User subscription renewed', time: '2 hours ago', type: 'payment' },
  ];

  const quickActions = [
    { title: 'Manage Users', icon: 'people-outline', screen: 'users/Users' },
    { title: 'Farm Analytics', icon: 'analytics-outline', screen: 'adminfarms/Farmers' },
    { title: 'Crop Database', icon: 'leaf-outline', screen: 'admincrops/Crops' },
    { title: 'System Settings', icon: 'settings-outline', screen: 'setting' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'farm': return 'business';
      case 'scan': return 'camera';
      case 'weather': return 'partly-sunny';
      case 'payment': return 'card';
      default: return 'notifications';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'farm': return '#4CAF50';
      case 'scan': return '#2196F3';
      case 'weather': return '#FF9800';
      case 'payment': return '#9C27B0';
      default: return '#666';
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#1f2937" : "#fff"} />
      
      {/* Header */}
      <View className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-5 pt-16 pb-5`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Welcome Admin</Text>
            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          <TouchableOpacity className="p-2 relative">
            <Ionicons name="notifications-outline" size={24} color={isDark ? "#fff" : "#000"} />
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="px-5 py-6">
          <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>Overview</Text>
          <View className="flex-row flex-wrap justify-between">
            {statsData.map((stat, index) => (
              <View 
                key={index} 
                className={`w-[48%] ${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-4 shadow-sm items-center`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-1`}>{stat.value}</Text>
                <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} text-center`}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 py-2">
          <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                className={`w-[48%] ${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-5 mb-4 shadow-sm items-center`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View className="mb-3">
                  <Ionicons name={action.icon} size={28} color="#4CAF50" />
                </View>
                <Text className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"} text-center`}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View className="px-5 py-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Recent Activities</Text>
            <TouchableOpacity>
              <Text className="text-green-500 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>
          <View 
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-sm overflow-hidden`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            {recentActivities.map((activity) => (
              <View 
                key={activity.id} 
                className={`flex-row items-center px-4 py-4 ${isDark ? "border-gray-700" : "border-gray-100"} border-b last:border-b-0`}
              >
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
                  <Text className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-1`}>
                    {activity.action}
                  </Text>
                  <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{activity.time}</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="ellipsis-vertical" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* System Status */}
        <View className="px-5 py-6">
          <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}>System Status</Text>
          <View 
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 shadow-sm`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            {/* API Server */}
            <View className={`flex-row items-center justify-between py-3 ${isDark ? "border-gray-700" : "border-gray-100"} border-b`}>
              <View className="flex-row items-center">
                <Ionicons name="server" size={20} color="#4CAF50" />
                <Text className={`text-sm ${isDark ? "text-white" : "text-gray-800"} ml-3`}>API Server</Text>
              </View>
              <View className="bg-green-50 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-green-700">Online</Text>
              </View>
            </View>

            {/* Weather Service */}
            <View className={`flex-row items-center justify-between py-3 ${isDark ? "border-gray-700" : "border-gray-100"} border-b`}>
              <View className="flex-row items-center">
                <Ionicons name="cloud" size={20} color="#2196F3" />
                <Text className={`text-sm ${isDark ? "text-white" : "text-gray-800"} ml-3`}>Weather Service</Text>
              </View>
              <View className="bg-green-50 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-green-700">Online</Text>
              </View>
            </View>

            {/* AI Scanner */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons name="camera" size={20} color="#FF9800" />
                <Text className={`text-sm ${isDark ? "text-white" : "text-gray-800"} ml-3`}>AI Scanner</Text>
              </View>
              <View className="bg-orange-50 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-orange-700">Maintenance</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}