import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, router } from "expo-router";

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { insertReview } from "../../../src/db/reviews";
import { colors, spacing } from "../../../src/theme";

export default function Quiz() {
	const { id } = useLocalSearchParams();
	const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
	const [cards, setCards] = useState<Card[]>([]);
	const [index, setIndex] = useState(0);
	const [options, setOptions] = useState<string[]>([]);
	const [results, setResults] = useState<{ card: Card; chosen: string; correct: boolean }[]>([]);
	const [done, setDone] = useState(false)

	const [answered, setAnswered] = useState<string | null>(null);
	const [startTime, setStartTime] = useState(0);	

	useEffect(() => {
		async function load() {
			const database = await openDatabase();
			setDb(database);
			setCards(await getCards(database, Number(id)));
		}
		load();
	}, [id]);

	useEffect(() => {
		if (cards.length === 0) return;
		const card = cards[index];
		const others = cards.filter((c) => c.id !== card.id)
		const distractors = shuffle(others).slice(0, 3).map((c) => c.english);
		setOptions(shuffle([card.english, ...distractors]))
		setAnswered(null);
		setStartTime(Date.now());
	}, [cards, index])

	if (cards.length === 0) return <Text>No cards</Text>;

	async function handleAnswer(choice: string) {
		if (answered) return;
		setAnswered(choice);
		const card = cards[index];
		const isCorrect = choice === card.english;
		const responseTime = Date.now() - startTime;
		setResults((r) => [...r, { card, chosen: choice, correct: isCorrect }]);
		if (db) await insertReview(db, card.id, "mc_jp_en", isCorrect, responseTime);
	}

	function nextPage() {
		if (index + 1 >= cards.length) {
			setDone(true);
		} else {
			setIndex(index + 1);
		}
	}

	if (done) {
		const correctCount = results.filter((r) => r.correct).length;
		return (
			<>
			<Stack.Screen options={{ title: "Results" }} />
			<ScrollView style={styles.resultsContainer} contentContainerStyle={{ padding: spacing.lg }}>
				<Text style={styles.resultBig}>{correctCount} / {cards.length}</Text>
				<Text style={styles.resultLabel}>correct</Text>

				{results.map((r, i) => (
					<View key={i} style={[styles.resultRow, { borderLeftColor: r.correct ? colors.good : colors.again }]}>
						<Text style={styles.resultJp}>{r.card.japanese} — {r.card.english}</Text>
						{!r.correct && (
						<Text style={styles.resultChosen}>You chose: {r.chosen}</Text>
						)}
					</View>
				))}

				<Pressable style={styles.doneButton} onPress={() => router.back()}>
					<Text style={styles.nextText}>Done</Text>
				</Pressable>
			</ScrollView>
			</>
		);
	}

	return (
		<>
		<Stack.Screen options={{ title: "Quiz"}}/>
		<View style={styles.container}>
			<Text style={styles.japanese}>{cards[index].japanese}</Text>
			{options.map((option) => {
				let bg = colors.surface;
				if (answered) {
					if (option === cards[index].english) bg = colors.good;
					else if (option === answered) bg = colors.again;
				}
				return (
					<Pressable key={option} onPress={() => handleAnswer(option)} style={[styles.option, { backgroundColor: bg }]}>
						<Text style={[styles.optionText, answered && (option === cards[index].english || option === answered) ? { color: "#fff" } : null]}>{option}</Text>
					</Pressable>
				);
			})}
			{answered && (
				<Pressable style={styles.next} onPress={() => nextPage()}>
					<Text style={styles.nextText}>Next</Text>
				</Pressable>
			)}
		</View>
		</>
	);
}

function shuffle<T>(array: T[]): T[] {
 	return [...array].sort(() => Math.random() - 0.5);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60, paddingHorizontal: spacing.lg, alignItems: "center" },
	japanese: { fontSize: 52, color: colors.text, marginBottom: spacing.xl },
	option: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 10, marginVertical: 6, width: "100%", borderWidth: 1, borderColor: colors.border },
	optionText: { fontSize: 20, textAlign: "center", color: colors.text },
	next: { backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginTop: spacing.lg },
	nextText: { color: colors.accentText, fontSize: 18, fontWeight: "600" },
	resultRow: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, marginBottom: spacing.sm },
	resultJp: { fontSize: 18, color: colors.text },
	resultChosen: { fontSize: 14, color: colors.again, marginTop: 4 },
	resultBig: { fontSize: 64, fontWeight: "700", color: colors.text, textAlign: "center", marginTop: spacing.lg },
	resultLabel: { fontSize: 20, color: colors.muted, textAlign: "center", marginBottom: spacing.lg },
	resultsContainer: { flex: 1, backgroundColor: colors.bg },
	doneButton: { backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginTop: spacing.lg, alignSelf: "center" },
});