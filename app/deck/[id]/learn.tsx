import * as SQLite from "expo-sqlite";
import * as Speech from "expo-speech";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";	

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { learnCard } from "../../../src/db/cardStates";
import { colors, spacing } from "../../../src/theme";

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

	function speak() {
		Speech.speak(card.reading, { language: "ja" });
	}

	function flip() {
		const nowFlipped = !flipped;
		setFlipped(nowFlipped);
		if (nowFlipped) speak();
	}

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

			<Pressable style={styles.card} onPress={flip}>
				{!flipped ? (
					<Text style={styles.japanese}>{card.japanese}</Text>
				) : (
					<View style={styles.back}>
						<Text style={styles.reading}>{card.reading}</Text>
						<Text style={styles.english}>{card.english}</Text>
					</View>
				)}
			</Pressable>
			<Pressable style={styles.speakButton} onPress={speak}>
				<Text style={styles.speakText}>🔊 Play</Text>
			</Pressable>
			<Pressable style={styles.nextButton} onPress={nextCard}>
				<Text style={styles.nextButtonText}>Next</Text>
			</Pressable>
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xl, paddingHorizontal: spacing.lg, alignItems: "center" },
	info: { fontSize: 18, color: colors.muted, marginTop: spacing.xl },
	progress: { fontSize: 16, color: colors.muted, marginBottom: spacing.lg },
	card: {
		width: "100%",
		height: 300,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing.lg,
	},
	japanese: { fontSize: 52, color: colors.text },
	back: { alignItems: "center" },
	reading: { fontSize: 28, color: colors.muted, marginBottom: spacing.sm },
	english: { fontSize: 24, color: colors.text },
	nextButton: { backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
	nextButtonText: { color: colors.accentText, fontSize: 18, fontWeight: "600" },
	summary: { flex: 1, backgroundColor: colors.bg },
	heading: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
	row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
	check: { fontSize: 24, marginRight: spacing.md, color: colors.accent },
	rowText: { fontSize: 18, color: colors.text },
	speakButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
	speakText: { fontSize: 16, color: colors.text },
});