import * as SQLite from "expo-sqlite";

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

export async function getCards(db: SQLite.SQLiteDatabase, deckId: number) {
	const result = await db.getAllAsync(
		"SELECT * FROM cards Where deck_id = ?",
		deckId
	);
	return result;
}