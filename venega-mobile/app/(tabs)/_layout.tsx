import { Tabs } from 'expo-router';
import { Home, Users, History, User, Plus } from 'lucide-react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Home size={22} color={color} fill={focused ? color : 'transparent'} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Cercles',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Users size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <History size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();
  const routes = state.routes.filter((route: any) => !['create', 'notifications'].includes(route.name));

  const onPressTab = (route: any) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const renderTab = (route: any) => {
    const { options } = descriptors[route.key];
    const label = options.title ?? route.name;
    const isFocused = state.index === state.routes.indexOf(route);
    const color = isFocused ? '#36E395' : 'rgba(255, 255, 255, 0.55)';

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabItem}
        onPress={() => onPressTab(route)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          {options.tabBarIcon
            ? options.tabBarIcon({ color, focused: isFocused, size: 22 })
            : null}
        </View>
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.tabBar}>
        {routes.slice(0, 2).map((route: any) => renderTab(route))}

        <TouchableOpacity
          style={styles.fabContainer}
          activeOpacity={0.88}
          onPress={() => router.push('/circles/create')}
        >
          <View style={styles.fabCircle}>
            <Plus size={26} color="#074B36" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>

        {routes.slice(2).map((route: any) => renderTab(route))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07473E',
    borderRadius: 32,
    height: 68,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    padding: 2,
  },
  tabLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 10.5,
    letterSpacing: -0.2,
  },
  fabContainer: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#36E395',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#36E395',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -28,
  },
});
