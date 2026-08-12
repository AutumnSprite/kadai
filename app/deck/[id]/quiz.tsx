import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";
import { insertReview } from "../../../src/db/reviews";

export default function Quiz() {
	const { id } = useLocalSearchParams();
	const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
	const [cards, setCards] = useState<Card[]>([]);
	const [index, setIndex] = useState(0);
	const [options, setOptions] = useState<string[]>([]);

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
		if (db) await insertReview(db, card.id, "mc_jp_en", isCorrect, responseTime);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.japanese}>{cards[index].japanese}</Text>
			{options.map((option) => {
				let bg = "#f3f4f6";
				if (answered) {
					if (option === cards[index].english) bg = "#bbf7d0";
					else if (option === answered) bg = "#fecaca";
				}
				return (
					<Pressable key={option} onPress={() => handleAnswer(option)} style={[styles.option, { backgroundColor: bg }]}>
						<Text style={styles.optionText}>{option}</Text>
					</Pressable>
				);
			})}
			{answered && (
				<Pressable style={styles.next} onPress={() => setIndex((i) => (i + 1) % cards.length)}>
					<Text style={styles.nextText}>Next</Text>
				</Pressable>
			)}
		</View>
	);
}

function shuffle<T>(array: T[]): T[] {
 	return [...array].sort(() => Math.random() - 0.5);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 60, alignItems: "center" },
	japanese: { fontSize: 48 },
	option: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, minWidth: 200 },
	optionText: { fontSize: 20, textAlign: "center" },
	next: { backgroundColor: "#2563eb", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, marginTop: 20 },
	nextText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});