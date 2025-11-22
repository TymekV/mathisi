import TabBar from '@/components/TabBar';
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import HomeScreen from '.';
import AddNewScreen from './new';
import ProfileScreen from './profile';

const IndexRoute = () => <HomeScreen />

const AlbumsRoute = () => <AddNewScreen />;

const ProfileRoute = () => <ProfileScreen />;


export default function TabLayout() {

  const [index, setIndex] = useState(0);
  const renderScene = BottomNavigation.SceneMap({
    feed: IndexRoute,
    new: AlbumsRoute,
    profile: ProfileRoute,
  });

  const routes = [
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ];
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
