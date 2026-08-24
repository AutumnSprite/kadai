import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { learnCard } from "../../../src/db/cardStates";

export default function Learn() {
	const { id } = useLocalSearchParams();
	const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
	const [cards, setCards] = useState<Card[]>([]);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [showSummary, setShowSummary] = useState(false);

	useEffect(() => {
		async function load() {
			const database = await openDatabase();
			setDb(database);
			const loaded = await getCards(database, Number(id));
			setCards(loaded);
			setSelected(new Set(loaded.map((c) => c.id)));
		}
		load();
	}, [id]);

	if (cards.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.info}>No cards in this deck yet.</Text>
			</View>
		);
	}

	const card = cards[index];

	function nextCard() {
		setFlipped(false);
		if (index + 1 >= cards.length){
			setShowSummary(true);
		} else {
			setIndex(index + 1);
		}
	}

	function toggle(cardId: number) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(cardId)) next.delete(cardId);
			else next.add(cardId);
			return next;
		});
	}

	async function finish() {
		for (const cardId of selected) {
			if (db) await learnCard(db, cardId);
		}
		router.back();
	}

	if (showSummary) {
		return (
			<>
			<Stack.Screen options={{ title: "Learn" }} />
			<ScrollView style={styles.summary} contentContainerStyle={{ padding: 20 }}>
			<Text style={styles.heading}>Select words to learn</Text>
			{cards.map((c) => (
				<Pressable key={c.id} style={styles.row} onPress={() => toggle(c.id)}>
				<Text style={styles.check}>{selected.has(c.id) ? "☑" : "☐"}</Text>
				<Text style={styles.rowText}>{c.japanese} — {c.english}</Text>
				</Pressable>
			))}
			<Pressable style={styles.nextButton} onPress={finish}>
				<Text style={styles.nextButtonText}>Learn selected ({selected.size})</Text>
			</Pressable>
			</ScrollView>
			</>
		);
	}

	return (
		<>
		<Stack.Screen options={{ title: "Learn" }} />
		<View style={styles.container}>
			<Text style={styles.progress}>
				{index + 1} / {cards.length}
			</Text>

			<Pressable style={styles.card} onPress={() => setFlipped(!flipped)}>
				{!flipped ? (
					<Text style={styles.japanese}>{card.japanese}</Text>
				) : (
					<View style={styles.back}>
						<Text style={styles.reading}>{card.reading}</Text>
						<Text style={styles.english}>{card.english}</Text>
					</View>
				)}
			</Pressable>

			<Pressable style={styles.nextButton} onPress={nextCard}>
				<Text style={styles.nextButtonText}>Next</Text>
			</Pressable>
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", paddingTop: 40, paddingHorizontal: 20, alignItems: "center" },
	info: { fontSize: 18, marginTop: 40 },
	progress: { fontSize: 16, color: "#666", marginBottom: 20 },
	card: {
		width: "100%",
		height: 300,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 30,
	},
	japanese: { fontSize: 48 },
	back: { alignItems: "center" },
	reading: { fontSize: 28, color: "#666", marginBottom: 12 },
	english: { fontSize: 24 },
	nextButton: { backgroundColor: "#2563eb", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8 },
	nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
	summary: { flex: 1, backgroundColor: "#fff" },
	heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
	row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
	check: { fontSize: 24, marginRight: 12 },
	rowText: { fontSize: 18 },
});