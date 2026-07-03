import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {isAdmin} from '../utils/helpers';
import {COLORS, FONTS} from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MembersScreen from '../screens/members/MembersScreen';
import MemberDetailScreen from '../screens/members/MemberDetailScreen';
import AddMemberScreen from '../screens/members/AddMemberScreen';
import EditMemberScreen from '../screens/members/EditMemberScreen';
import FamilyTreeScreen from '../screens/tree/FamilyTreeScreen';
import AnnouncementsScreen from '../screens/announcements/AnnouncementsScreen';
import AddAnnouncementScreen from '../screens/announcements/AddAnnouncementScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import BranchMessagesScreen from '../screens/messages/BranchMessagesScreen';
import DirectMessageScreen from '../screens/messages/DirectMessageScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import CompoundManagementScreen from '../screens/admin/CompoundManagementScreen';
import ProgenitorManagementScreen from '../screens/admin/ProgenitorManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOptions = {
  headerStyle: {backgroundColor: COLORS.primary},
  headerTintColor: COLORS.white,
  headerTitleStyle: {fontWeight: '700', fontSize: FONTS.sizes.md},
};

function TabIcon({name, focused}) {
  const icons = {
    Home: '🏠',
    Members: '👥',
    Messages: '💬',
    Announcements: '📢',
    Admin: '⚙️',
  };
  return (
    <Text style={[styles.tabIcon, {opacity: focused ? 1 : 0.55}]}>
      {icons[name] || '●'}
    </Text>
  );
}

// ---- Stack navigators per tab ----

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Family Tree'}} />
    </Stack.Navigator>
  );
}

function MembersStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="MembersList" component={MembersScreen} options={{title: 'Members'}} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} options={{title: 'Member Profile'}} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} options={{title: 'Add Member'}} />
      <Stack.Screen name="EditMember" component={EditMemberScreen} options={{title: 'Edit Member'}} />
      <Stack.Screen name="FamilyTree" component={FamilyTreeScreen} options={{title: 'Family Tree'}} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="MessagesTabs" component={MessagesScreen} options={{title: 'Messages'}} />
      <Stack.Screen name="BranchMessages" component={BranchMessagesScreen} options={{title: 'Branch Messages'}} />
      <Stack.Screen name="DirectMessage" component={DirectMessageScreen} options={{title: 'Direct Message'}} />
    </Stack.Navigator>
  );
}

function AnnouncementsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="AnnouncementsList" component={AnnouncementsScreen} options={{title: 'Announcements'}} />
      <Stack.Screen name="AddAnnouncement" component={AddAnnouncementScreen} options={{title: 'Post Announcement'}} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{title: 'Admin Panel'}} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{title: 'Manage Users'}} />
      <Stack.Screen name="CompoundManagement" component={CompoundManagementScreen} options={{title: 'Manage Compounds'}} />
      <Stack.Screen name="ProgenitorManagement" component={ProgenitorManagementScreen} options={{title: 'Manage Progenitors'}} />
    </Stack.Navigator>
  );
}

// ---- Root tab navigator ----

export default function AppNavigator() {
  const {user} = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({focused}) => <TabIcon name={route.name} focused={focused} />,
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Members" component={MembersStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Announcements" component={AnnouncementsStack} />
      {isAdmin(user) && (
        <Tab.Screen name="Admin" component={AdminStack} />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 4,
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 22,
  },
});
