import * as SQLite from "expo-sqlite";

export type Deck = {
  id: number;
  name: string;
  chapter_number: number;
};

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

export async function getDecks(db: SQLite.SQLiteDatabase): Promise<Deck[]> {
	const result = await db.getAllAsync<Deck>("SELECT * FROM decks");
	return result;
}

export async function getDeck(db: SQLite.SQLiteDatabase, id: number): Promise<Deck | null> {
  return db.getFirstAsync<Deck>("SELECT * FROM decks WHERE id = ?", id);
}