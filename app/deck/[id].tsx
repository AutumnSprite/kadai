import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";


export default function DeckCards() {
	const { id } = useLocalSearchParams();

	return (
		<View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
			<Text style={{ fontSize: 24 }}>Cards for deck {id}</Text>
		</View>
	)
}