import { StyleSheet, Text, View, ScrollView, TextInput, Pressable } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { openDatabase } from "../../src/db/database";
import { getLearnedCards, LearnedCard } from "../../src/db/cardStates";

export default function Learned() {
	const [cards, setCards] = useState<LearnedCard[]>([]);
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<"due" | "reps">("due");

	useFocusEffect(
		useCallback(() => {
			async function load() {
				const db = await openDatabase();
				setCards(await getLearnedCards(db));
			}
			load();
		}, [])
	);

	const filtered = cards.filter((c) => 
		c.japanese.includes(query) ||
		c.english.toLowerCase().includes(query.toLowerCase()) ||
		c.reading.includes(query)
	);

	const sorted = [...filtered].sort((a, b) => {
		if (sort === "reps") return b.reps - a.reps;
		return a.due_date.localeCompare(b.due_date);
	});

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
		<Text style={styles.heading}>Learned Cards</Text>
		<TextInput style={styles.search} value={query} onChangeText={setQuery}/>
		<View style={styles.sortRow}>
			<Pressable onPress={() => setSort("due")} style={styles.sortBtn}>
				<Text style={sort === "due" ? styles.sortActive : styles.sortText}>Due date</Text>
			</Pressable>
			<Pressable onPress={() => setSort("reps")} style={styles.sortBtn}>
				<Text style={sort === "reps" ? styles.sortActive : styles.sortText}>Reps</Text>
			</Pressable>
		</View>
		{sorted.map((c) => (
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
	search: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 16 },
	sortRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
	sortBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: "#f3f4f6" },
	sortText: { color: "#666" },
	sortActive: { color: "#2563eb", fontWeight: "600" },
});