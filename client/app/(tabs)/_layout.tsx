import React from 'react';
import { BottomNavigation } from 'react-native-paper';
import HomeScreen from '.';
import AddNewScreen from './explore';
import ProfileScreen from './profile';

const IndexRoute = () => <HomeScreen/>

const AlbumsRoute = () => <AddNewScreen/>;

const ProfileRoute = () => <ProfileScreen/>;


export default function TabLayout() {
const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'feed', title: 'Feed', focusedIcon: 'home', unfocusedicon: 'home'},
    { key: 'new', title: 'New', focusedIcon: 'camera' },
    { key: 'profile', title: 'Profile', focusedIcon: 'information', unfocusedIcon: 'information-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    feed: IndexRoute,
    new: AlbumsRoute,
    profile : ProfileRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
