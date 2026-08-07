export type RootStackParamList = {
  Welcome: undefined;
  EmailAuth: undefined;
  Home: undefined;
  Settings: undefined;
  GatheringList: undefined;
  FamilyList: { gatheringId: string; gatheringName: string };
  FamilyResults: { gatheringId: string };
  TripList: undefined;
  FriendsGroup: { tripId: string; tripName: string };
  FriendsBalances: { tripId: string };
};
