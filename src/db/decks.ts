import * as SQLite from "expo-sqlite";

export async function insertDeck(
	db: SQLite.SQLiteDatabase,
	name: string,
	chapterNumber: number
) {
	const result = await db.runAsync(
		"INSERT INTO decks (name, chapter_number) VALUES (?, ?)",
		name,
		chapterNumber
	);
	return result.lastInsertRowId;
}

export async function getDecks(db: SQLite.SQLiteDatabase) {
	const result = await db.getAllAsync("SELECT * FROM decks");
	return result;
}