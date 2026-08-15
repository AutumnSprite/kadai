import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';

import { useEffect, useState } from "react";

import { openDatabase } from "../../src/db/database";
import { insertDeck, getDecks, Deck } from "../../src/db/decks";
import { seedCards } from "../../src/db/cards";
import { minnaChapter1 } from "../../src/data/minna-ch1";


export default function Home() {
	const [decks, setDecks] = useState<Deck[]>([]);

	useEffect(() => {
		async function init() {
			const db = await openDatabase();
			//await db.execAsync("DELETE FROM decks; DELETE FROM cards;");

			const existing = await getDecks(db);
			if (existing.length === 0) {
				const ch1Id = await insertDeck(db, "Minna no Nihongo Chapter 1", 1);
				await insertDeck(db, "Minna no Nihongo Chapter 2", 2);
				await seedCards(db, ch1Id, minnaChapter1);
			}

			// load decks into state → triggers re-render
			const loaded = await getDecks(db);
			setDecks(loaded);
		}
		init();
	}, []);
	
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Decks</Text>
			<FlatList
				data={decks}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<Pressable onPress={() => router.push(`/deck/${item.id}`)}>
						<Text style={styles.deck}>{item.name}</Text>
					</Pressable>
				)}
			/>
			<StatusBar style='auto' />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: 60,
		paddingHorizontal: 20,
	},
	heading: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	deck: {
		fontSize: 18,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
