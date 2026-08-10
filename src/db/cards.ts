import * as SQLite from "expo-sqlite";
import { VocabWord } from "../data/minna-ch1";

export type Card = {
	id: number,
	deck_id: number,
	japanese: string,
	reading: string,
	english: string,
	english_synonyms: string,
}

export async function insertCard(
	db: SQLite.SQLiteDatabase,
	deckId: number,
	japanese: string,
	reading: string,
	english: string,
	synonyms: string[] = [],
) {
	const synonymsJson = JSON.stringify(synonyms);
	const result = await db.runAsync(
		"INSERT INTO cards (deck_id, japanese, reading, english, english_synonyms) VALUES (?, ?, ?, ?, ?)",
		deckId,
		japanese,
		reading,
		english,
		synonymsJson,
	);
	return result.lastInsertRowId;
}

export async function getCards(db: SQLite.SQLiteDatabase, deckId: number): Promise<Card[]> {
	const result = await db.getAllAsync<Card>(
		"SELECT * FROM cards Where deck_id = ?",
		deckId
	);
	return result;
}

export async function seedCards(
	db: SQLite.SQLiteDatabase,
	deckId: number,
	words: VocabWord[]
) {
	for (const word of words) {
		await insertCard(db, deckId, word.japanese, word.reading, word.english);
	}
}