import { StyleSheet, Text, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { openDatabase } from "../../src/db/database";
import { getCards, Card } from "../../src/db/cards";

export default function DeckCards() {
	const { id } = useLocalSearchParams();
	const [cards, setCards] = useState<Card[]>([]);

	useEffect(() => {
		async function load() {
			const db = await openDatabase();
			const loaded = await getCards(db, Number(id));
			setCards(loaded);
		}
		load();
	}, [id]);

	return (
		<View style={styles.container}>
		<Text style={styles.heading}>Cards</Text>
		<FlatList
			data={cards}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => (
				<View style={styles.card}>
					<Text style={styles.japanese}>{item.japanese}</Text>
					<Text style={styles.reading}>{item.reading}</Text>
					<Text style={styles.english}>{item.english}</Text>
				</View>
			)}
		/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
	heading: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
	card: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
	japanese: { fontSize: 22 },
	reading: { fontSize: 16, color: "#666" },
	english: { fontSize: 16 },
});