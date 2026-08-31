import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { getDeck } from "../../../src/db/decks";
import { colors, spacing } from "../../../src/theme";

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
			<View style={styles.buttonRow}>
				<Pressable style={styles.actionButton} onPress={() => router.push(`/deck/${id}/learn`)}>
					<Text style={styles.actionButtonText}>Learn</Text>
				</Pressable>
				<Pressable style={styles.actionButton} onPress={() => router.push(`/deck/${id}/quiz`)}>
					<Text style={styles.actionButtonText}>Quiz</Text>
				</Pressable>
			</View>
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
	container: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.lg, paddingHorizontal: spacing.lg },
	buttonRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
	actionButton: { flex: 1, backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
	actionButtonText: { color: colors.accentText, fontSize: 18, fontWeight: "600" },
	card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
	japanese: { fontSize: 22, color: colors.text },
	reading: { fontSize: 15, color: colors.muted, marginTop: 2 },
	english: { fontSize: 16, color: colors.text, marginTop: 2 },
});