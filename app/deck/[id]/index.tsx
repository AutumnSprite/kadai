import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { getDeck } from "../../../src/db/decks";

export default function DeckCards() {
	const { id } = useLocalSearchParams();
	const [cards, setCards] = useState<Card[]>([]);
	const [deckName, setDeckName] = useState("");

	useEffect(() => {
		async function load() {
			const db = await openDatabase();
			const loaded = await getCards(db, Number(id));
			setCards(loaded);
			const deck = await getDeck(db, Number(id));
			if (deck) setDeckName(deck.name);
		}
		load();
	}, [id]);

	return (
		<>
		<Stack.Screen options={{ title: deckName }} />
		<View style={styles.container}>
			<Pressable style={styles.learnButton} onPress={() => router.push(`/deck/${id}/learn`)}>
				<Text style={styles.learnButtonText}>Learn</Text>
			</Pressable>
			<Pressable style={styles.learnButton} onPress={() => router.push(`/deck/${id}/quiz`)}>
				<Text style={styles.learnButtonText}>Quiz</Text>
			</Pressable>
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
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
	card: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
	japanese: { fontSize: 22 },
	reading: { fontSize: 16, color: "#666" },
	english: { fontSize: 16 },
	learnButton: {
		backgroundColor: "#2563eb",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 20,
	},
	learnButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});