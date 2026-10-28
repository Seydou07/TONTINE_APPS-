import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/layouts/TabsClient';
import { Home, Users, History, User, Plus } from 'lucide-react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { colors, typography } from '@venega/design-tokens';

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
          tabBarIcon: ({ color, focused }) => <Home size={24} color={color as string} strokeWidth={focused ? 2.2 : 1.7} />,
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Cercles',
          tabBarIcon: ({ color, focused }) => <Users size={24} color={color as string} strokeWidth={focused ? 2.2 : 1.7} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => <History size={24} color={color as string} strokeWidth={focused ? 2.2 : 1.7} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => <User size={24} color={color as string} strokeWidth={focused ? 2.2 : 1.7} />,
        }}
      />
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

// Depuis expo-router 58, la barre reçoit `emitter` + `navigateToTab` (plus d'objet `navigation`).
function CustomTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routes = state.routes.filter((route: any) => !['create', 'notifications'].includes(route.name));

  const onPressTab = (route: any, isFocused: boolean) => {
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigateToTab(route.key);
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {routes.map((route: any, index: number) => {
        const options = descriptors[route.key]?.options ?? {};
        const label = options.title ?? route.name;
        const isFocused = state.index === state.routes.indexOf(route);
        const color = isFocused ? colors.primary.DEFAULT : colors.subtle;

        return (
          <React.Fragment key={route.key}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => onPressTab(route, isFocused)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              {options.tabBarIcon ? options.tabBarIcon({ color, focused: isFocused, size: 24 }) : null}
              <Text style={[styles.tabLabel, { color }, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
            {index === 1 && (
              <View style={styles.tabItem}>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => router.push('/circles/create')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Créer un cercle"
                >
                  <Plus size={24} color="#FFFFFF" strokeWidth={2.4} />
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
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  createBtn: {
    width: 48,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
});
