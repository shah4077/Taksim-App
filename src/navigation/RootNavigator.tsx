import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useSessionStore } from '../state/useSessionStore';
import { colors } from '../theme/colors';
import { BrandHeader } from '../components/BrandHeader';
import { HeaderMenuButton, HeaderProfileButton } from '../components/HeaderButtons';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { EmailAuthScreen } from '../screens/EmailAuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GatheringListScreen } from '../screens/family/GatheringListScreen';
import { FamilyListScreen } from '../screens/family/FamilyListScreen';
import { FamilyResultsScreen } from '../screens/family/FamilyResultsScreen';
import { TripListScreen } from '../screens/friends/TripListScreen';
import { FriendsGroupScreen } from '../screens/friends/FriendsGroupScreen';
import { FriendsBalancesScreen } from '../screens/friends/FriendsBalancesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const user = useSessionStore((s) => s.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitle: () => <BrandHeader />,
          headerTitleAlign: 'center',
          headerRight: () => <HeaderProfileButton />,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="EmailAuth"
              component={EmailAuthScreen}
              options={{ headerTitle: '', headerRight: () => null }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerLeft: () => <HeaderMenuButton /> }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="GatheringList" component={GatheringListScreen} />
            <Stack.Screen name="FamilyList" component={FamilyListScreen} />
            <Stack.Screen name="FamilyResults" component={FamilyResultsScreen} />
            <Stack.Screen name="TripList" component={TripListScreen} />
            <Stack.Screen name="FriendsGroup" component={FriendsGroupScreen} />
            <Stack.Screen name="FriendsBalances" component={FriendsBalancesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
