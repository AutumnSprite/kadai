import { StyleSheet, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { openDatabase } from "../../../src/db/database";
import { getCards, Card } from "../../../src/db/cards";

export default function Learn() {
	const { id } = useLocalSearchParams();
	const [cards, setCards] = useState<Card[]>([]);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

	useEffect(() => {
		async function load() {
			const db = await openDatabase();
			const loaded = await getCards(db, Number(id));
			setCards(loaded);
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
		setIndex((i) => (i + 1) % cards.length);
	}

	return (
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
});