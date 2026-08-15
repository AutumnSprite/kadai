import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="index" options={{ title: "Decks" }} />
			<Tabs.Screen name="learned" options={{ title: "Learned" }} />
		</Tabs>
	);
}