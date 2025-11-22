import TabBar from '@/components/TabBar';
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='index'
        options={
          {
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              focused ?
                <Entypo name="home" size={24} color={color} />
                :
                <AntDesign name="home" size={24} color={color} />
            ),
          }
        }
      />
      <Tabs.Screen
        name='new'
        options={
          {
            title: "New",
            tabBarIcon: ({ color, focused }) => (
              focused ?
                <FontAwesome name="camera" size={24} color={color} />
                :
                <AntDesign name="camera" size={24} color={color} />
            ),
          }
        }
      />
      <Tabs.Screen
        name='profile'
        options={
          {
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              focused ?
                <FontAwesome name="user" size={24} color={color} />
                :
                <FontAwesome name="user-o" size={24} color={color} />
            ),
          }
        }
      />
    </Tabs>
  );
}
