import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen
				name="index"
				options={{
				title: "Decks",
				tabBarIcon: ({ color, size }) => <Ionicons name="albums" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="review"
				options={{
				title: "Review",
				tabBarIcon: ({ color, size }) => <Ionicons name="refresh" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="learned"
				options={{
				title: "Learned",
				tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-done" color={color} size={size} />,
				}}
			/>
		</Tabs>
	);
}