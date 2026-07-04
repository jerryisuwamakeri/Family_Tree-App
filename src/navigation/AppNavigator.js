import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {isAdmin} from '../utils/helpers';
import {COLORS, FONTS, RADIUS, SHADOWS} from '../utils/theme';
import Icon from '../components/Icon';

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
  headerShadowVisible: false,
  headerTintColor: COLORS.white,
  headerTitleAlign: 'center',
  headerTitleStyle: {fontWeight: '800', fontSize: FONTS.sizes.md, color: COLORS.white},
};

function TabIcon({name, focused}) {
  const icons = {
    Home: 'home',
    Members: 'people',
    Messages: 'chatbubbles',
    Announcements: 'megaphone',
    Admin: 'settings',
  };
  const base = icons[name] || 'ellipse';
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Icon
        name={focused ? base : `${base}-outline`}
        size={22}
        color={focused ? COLORS.primaryDeep : COLORS.textLight}
      />
    </View>
  );
}

// ---- Stack navigators per tab ----

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
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
        tabBarActiveTintColor: COLORS.primaryDeep,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
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
    paddingTop: 8,
    paddingBottom: 10,
    height: 68,
    ...SHADOWS.md,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  tabIconWrap: {
    width: 46,
    height: 30,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
  },
});
