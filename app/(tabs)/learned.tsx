import { StyleSheet, Text, View, ScrollView, TextInput, Pressable } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";

import { openDatabase } from "../../src/db/database";
import { getLearnedCards, LearnedCard } from "../../src/db/cardStates";
import { colors, spacing } from "../../src/theme";

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
		<ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: 60 }}>
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
			<Pressable key={c.id} style={styles.row} onPress={() => router.push(`/card/${c.id}`)}>
				<Text style={styles.jp}>{c.japanese} — {c.english}</Text>
				<Text style={styles.meta}>{c.deck_name}</Text>
				<Text style={styles.meta}>
					Due: {new Date(c.due_date).toLocaleDateString()} · Interval: {c.interval_days}d · Reps: {c.reps}
				</Text>
			</Pressable>
		))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg },
	heading: { fontSize: 28, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
	row: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
	jp: { fontSize: 18, color: colors.text },
	meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
	search: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: spacing.md, fontSize: 16, color: colors.text },
	sortRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
	sortBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
	sortText: { color: colors.muted },
	sortActive: { color: colors.accent, fontWeight: "600" },
});