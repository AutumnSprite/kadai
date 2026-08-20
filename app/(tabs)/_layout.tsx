import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" options={{ title: "Decks" }} />
			<Tabs.Screen name="learned" options={{ title: "Learned" }} />
			<Tabs.Screen name="review" options={{title: "Review"}} />
		</Tabs>
	);
}