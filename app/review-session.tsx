import * as SQLite from "expo-sqlite";
import * as Speech from "expo-speech";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { router, Stack } from "expo-router";

import { openDatabase } from "../src/db/database";
import { getDueCards, reviewCard, LearnedCard, Grade } from "../src/db/cardStates";
import { colors, spacing } from "../src/theme";

export default function ReviewSession() {
	const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
	const [cards, setCards] = useState<LearnedCard[]>([]);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

	useEffect(() => {
		async function load() {
			const database = await openDatabase();
			setDb(database);
			setCards(await getDueCards(database));
			setIndex(0);
			setFlipped(false);
		}
		load();
	}, [])

	if (cards.length === 0 || index >= cards.length) {
		return (
		<View style={styles.container}>
			<Text style={styles.done}>Review complete 🎉</Text>
			<Pressable style={styles.button} onPress={() => router.back()}>
			<Text style={styles.buttonText}>Done</Text>
			</Pressable>
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
	
	async function grade(g: Grade) {
		if (db) await reviewCard(db, card.id, g);
		setFlipped(false);
		setIndex(index + 1);
	}

	return (
		<>
		<Stack.Screen options={{ title: "Review"}}/>
		<View style={styles.container}>
		<Text style={styles.progress}>{index + 1} / {cards.length}</Text>
		<Pressable style={styles.card} onPress={flip}>
			{!flipped ? (
			<Text style={styles.japanese}>{card.japanese}</Text>
			) : (
			<View>
				<Text style={styles.reading}>{card.reading}</Text>
				<Text style={styles.english}>{card.english}</Text>
			</View>
			)}
		</Pressable>

		<Pressable style={styles.speakButton} onPress={speak}>
			<Text style={styles.speakText}>🔊 Play</Text>
		</Pressable>
		{flipped && (
			<View style={styles.grades}>
				<Pressable style={[styles.grade, { backgroundColor: colors.again }]} onPress={() => grade("again")}><Text style={styles.gradeText}>Again</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: colors.hard }]} onPress={() => grade("hard")}><Text style={styles.gradeText}>Hard</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: colors.good }]} onPress={() => grade("good")}><Text style={styles.gradeText}>Good</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: colors.easy }]} onPress={() => grade("easy")}><Text style={styles.gradeText}>Easy</Text></Pressable>
			</View>
		)}
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg, paddingTop: 40, paddingHorizontal: spacing.lg, alignItems: "center" },
	done: { fontSize: 24, color: colors.text, marginTop: 80, marginBottom: spacing.lg },
	progress: { fontSize: 16, color: colors.muted, marginBottom: spacing.lg },
	card: { width: "100%", height: 280, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: spacing.lg },
	japanese: { fontSize: 52, color: colors.text },
	reading: { fontSize: 28, color: colors.muted, textAlign: "center", marginBottom: 8 },
	english: { fontSize: 24, color: colors.text, textAlign: "center" },
	grades: { flexDirection: "row", gap: spacing.sm },
	grade: { flex: 1, paddingVertical: 16, borderRadius: 10, alignItems: "center" },
	gradeText: { color: colors.accentText, fontSize: 15, fontWeight: "600" },
	button: { backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
	buttonText: { color: colors.accentText, fontSize: 18, fontWeight: "600" },
	speakButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
	speakText: { fontSize: 16, color: colors.text },
});