import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function UserForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Farmer',
    phone: '',
    address: '',
  });

  const roles = ['Farmer', 'Admin', 'Viewer'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Farmer',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        user ? 'User updated successfully' : 'User created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <Text className="text-lg font-bold text-black">
            {user ? 'Edit User' : 'Add User'}
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Form */}
          <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            {/* Name */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter full name"
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Role */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Role *
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setFormData({ ...formData, role })}
                    className={`mx-1 mb-2 px-4 py-2 rounded-lg border ${
                      formData.role === role
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        formData.role === role
                          ? 'text-white font-medium'
                          : 'text-gray-700'
                      }
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <TextInput
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 h-20"
                placeholder="Enter address"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`bg-green-500 rounded-lg py-4 items-center ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {user ? 'Update User' : 'Create User'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Delete Button for Edit Mode */}
          {user && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete User',
                  `Are you sure you want to delete ${user.name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        // Handle delete
                        navigation.goBack();
                        Alert.alert('Success', 'User deleted successfully');
                      },
                    },
                  ]
                );
              }}
              className="bg-red-50 border border-red-200 rounded-lg py-4 items-center mt-4"
            >
              <Text className="text-red-600 font-semibold">Delete User</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}