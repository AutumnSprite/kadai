import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { openDatabase } from "../../src/db/database";
import { getLearnedCards, LearnedCard } from "../../src/db/cardStates";

export default function Learned() {
	const [cards, setCards] = useState<LearnedCard[]>([]);

	useEffect(() => {
		async function load() {
			const db = await openDatabase();
			setCards(await getLearnedCards(db));
		}
		load();
	}, []);

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
		<Text style={styles.heading}>Learned Cards</Text>
		{cards.map((c) => (
			<View key={c.id} style={styles.row}>
				<Text style={styles.jp}>{c.japanese} — {c.english}</Text>
				<Text style={styles.meta}>{c.deck_name}</Text>
				<Text style={styles.meta}>
					Due: {new Date(c.due_date).toLocaleDateString()} · Interval: {c.interval_days}d · Reps: {c.reps}
				</Text>
			</View>
		))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
	row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
	jp: { fontSize: 18 },
	meta: { fontSize: 14, color: "#666", marginTop: 2 },
});