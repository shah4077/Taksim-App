import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useSessionStore } from '../state/useSessionStore';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';

import { LoginScreen } from '../screens/LoginScreen';
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
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
            <Stack.Screen
              name="GatheringList"
              component={GatheringListScreen}
              options={{ title: t('gatherings.title') }}
            />
            <Stack.Screen
              name="FamilyList"
              component={FamilyListScreen}
              options={({ route }) => ({ title: route.params.gatheringName })}
            />
            <Stack.Screen
              name="FamilyResults"
              component={FamilyResultsScreen}
              options={{ title: t('family.resultsTitle') }}
            />
            <Stack.Screen name="TripList" component={TripListScreen} options={{ title: t('trips.title') }} />
            <Stack.Screen
              name="FriendsGroup"
              component={FriendsGroupScreen}
              options={({ route }) => ({ title: route.params.tripName })}
            />
            <Stack.Screen
              name="FriendsBalances"
              component={FriendsBalancesScreen}
              options={{ title: t('balances.title') }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
