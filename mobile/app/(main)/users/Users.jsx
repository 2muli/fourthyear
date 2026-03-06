import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Mock data - replace with your API calls
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Farmer', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-10' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Farmer', status: 'Inactive', joinDate: '2024-01-20' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Viewer', status: 'Active', joinDate: '2024-01-25' },
];

export default function UserList() {
  const navigation = useNavigation();
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(userId),
        },
      ]
    );
  };

  const deleteUser = async (userId) => {
    try {
      // Simulate API call
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    );
    setUsers(updatedUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-600 mt-4">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 pt-16 pb-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Manage Users</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddUser')}
            className="p-2"
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Search and Filter Section */}
          <View className="flex-row mb-4 space-x-3">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2">
              <Text className="text-gray-500">Search users...</Text>
            </View>
            <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg">
              <Ionicons name="filter" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Users List */}
          {users.map((user) => (
            <View
              key={user.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-800 mr-2">
                      {user.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        user.status === 'Active'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          user.status === 'Active'
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}
                      >
                        {user.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="mail-outline" size={16} color="#666" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {user.email}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {user.role}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text className="text-gray-600 text-sm ml-2">
                      Joined {user.joinDate}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditUser', { user })}
                    className="p-2 bg-blue-50 rounded-lg"
                  >
                    <Ionicons name="create-outline" size={18} color="#2196F3" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => toggleUserStatus(user.id)}
                    className={`p-2 rounded-lg ${
                      user.status === 'Active' ? 'bg-orange-50' : 'bg-green-50'
                    }`}
                  >
                    <Ionicons
                      name={user.status === 'Active' ? 'pause-outline' : 'play-outline'}
                      size={18}
                      color={user.status === 'Active' ? '#FF9800' : '#4CAF50'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDeleteUser(user.id, user.name)}
                    className="p-2 bg-red-50 rounded-lg"
                  >
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {users.length === 0 && (
            <View className="items-center py-10">
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text className="text-gray-500 text-lg mt-4">No users found</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddUser')}
                className="bg-green-500 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">Add First User</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}