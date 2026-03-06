import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function UserDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params || {};

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">User not found</Text>
      </View>
    );
  }

  const handleEdit = () => {
    navigation.navigate('EditUser', { user });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'User deleted successfully');
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
          <Text className="text-lg font-bold text-black">User Details</Text>
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
          {/* Profile Header */}
          <View className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-gray-100 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-green-600">
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {user.name}
            </Text>
            <View className={`px-3 py-1 rounded-full mb-3 ${
              user.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`text-sm font-medium ${
                user.status === 'Active' ? 'text-green-800' : 'text-red-800'
              }`}>
                {user.status}
              </Text>
            </View>
            <Text className="text-gray-600">{user.role}</Text>
          </View>

          {/* User Information */}
          <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              User Information
            </Text>

            {/* Email */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="mail-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Email</Text>
                <Text className="text-gray-800">{user.email}</Text>
              </View>
            </View>

            {/* Role */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="person-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Role</Text>
                <Text className="text-gray-800">{user.role}</Text>
              </View>
            </View>

            {/* Join Date */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Join Date</Text>
                <Text className="text-gray-800">{user.joinDate}</Text>
              </View>
            </View>

            {/* Last Active */}
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Last Active</Text>
                <Text className="text-gray-800">2 hours ago</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-5">
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 bg-blue-500 rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">Edit User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Status Change',
                  `Are you sure you want to ${
                    user.status === 'Active' ? 'deactivate' : 'activate'
                  } this user?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                      onPress: () => {
                        Alert.alert(
                          'Success',
                          `User ${user.status === 'Active' ? 'deactivated' : 'activated'} successfully`
                        );
                      },
                    },
                  ]
                );
              }}
              className={`flex-1 rounded-lg py-4 items-center ${
                user.status === 'Active'
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
            >
              <Text className="text-white font-semibold">
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}