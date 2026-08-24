import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { router, Stack } from "expo-router";

import { openDatabase } from "../src/db/database";
import { getDueCards, reviewCard, LearnedCard, Grade } from "../src/db/cardStates";

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
		<Pressable style={styles.card} onPress={() => setFlipped(!flipped)}>
			{!flipped ? (
			<Text style={styles.japanese}>{card.japanese}</Text>
			) : (
			<View>
				<Text style={styles.reading}>{card.reading}</Text>
				<Text style={styles.english}>{card.english}</Text>
			</View>
			)}
		</Pressable>

		{flipped && (
			<View style={styles.grades}>
				<Pressable style={[styles.grade, { backgroundColor: "#fecaca" }]} onPress={() => grade("again")}><Text>Again</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: "#fed7aa" }]} onPress={() => grade("hard")}><Text>Hard</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: "#bbf7d0" }]} onPress={() => grade("good")}><Text>Good</Text></Pressable>
				<Pressable style={[styles.grade, { backgroundColor: "#bfdbfe" }]} onPress={() => grade("easy")}><Text>Easy</Text></Pressable>
			</View>
		)}
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", paddingTop: 40, paddingHorizontal: 20, alignItems: "center" },
	done: { fontSize: 24, marginTop: 80, marginBottom: 24 },
	progress: { fontSize: 16, color: "#666", marginBottom: 20 },
	card: { width: "100%", height: 280, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 24 },
	japanese: { fontSize: 48 },
	reading: { fontSize: 28, color: "#666", textAlign: "center", marginBottom: 8 },
	english: { fontSize: 24, textAlign: "center" },
	grades: { flexDirection: "row", gap: 8 },
	grade: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8 },
	button: { backgroundColor: "#2563eb", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8 },
	buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});