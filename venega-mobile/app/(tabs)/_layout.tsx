import { Tabs } from 'expo-router';
import { Home, Users, Activity, User, Plus } from 'lucide-react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
          tabBarIcon: ({ color, focused }) => (
            <Home size={21} color={color as string} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Cercles',
          tabBarIcon: ({ color, focused }) => (
            <Users size={21} color={color as string} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Activité',
          tabBarIcon: ({ color, focused }) => (
            <Activity size={21} color={color as string} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <User size={21} color={color as string} strokeWidth={focused ? 2.3 : 1.8} />
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

  return (
    <View style={styles.tabBar}>
      {routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === state.routes.indexOf(route);
        const color = isFocused ? '#0B6E4F' : '#94A3B8';

        return (
          <React.Fragment key={route.key}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => onPressTab(route)}
              activeOpacity={0.7}
            >
              {options.tabBarIcon ? options.tabBarIcon({ color, focused: isFocused, size: 21 }) : null}
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
            {index === 1 && (
              <View style={styles.createTabItem}>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => navigation.navigate('create')}
                  activeOpacity={0.85}
                >
                  <Plus size={26} color="#FFFFFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F4',
    paddingTop: 8,
    paddingBottom: 22,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  createTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D9A441',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -26,
    shadowColor: '#D9A441',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  tabLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 10.5,
  },
});
