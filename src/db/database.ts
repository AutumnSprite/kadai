import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDatabase() {
	//await SQLite.deleteDatabaseAsync("kadai.db");#
	if (dbInstance) return dbInstance;
	dbInstance = await SQLite.openDatabaseAsync("kadai.db");
	
	await dbInstance.execAsync(`
		CREATE TABLE IF NOT EXISTS decks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			chapter_number INTEGER NOT NULL
		);
	`);

	await dbInstance.execAsync(`
		CREATE TABLE IF NOT EXISTS cards (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			deck_id INTEGER NOT NULL,
			japanese TEXT NOT NULL,
			reading TEXT NOT NULL,
			english TEXT NOT NULL,
			english_synonyms TEXT,
			FOREIGN KEY (deck_id) REFERENCES decks(id)
		);
	`);

	await dbInstance.execAsync(`
		CREATE TABLE IF NOT EXISTS reviews (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			card_id INTEGER NOT NULL,
			review_date TEXT NOT NULL,
			quiz_type TEXT NOT NULL,
			is_correct INTEGER NOT NULL,
			response_time_ms INTEGER NOT NULL,
			FOREIGN KEY (card_id) REFERENCES cards(id)
		);
	`);

	await dbInstance.execAsync(`
		CREATE TABLE IF NOT EXISTS card_states (
			card_id INTEGER PRIMARY KEY,
			due_date TEXT NOT NULL,
			interval_days INTEGER NOT NULL,
			reps INTEGER NOT NULL,
			FOREIGN KEY (card_id) REFERENCES cards(id)
		);
	`);

	console.log("database ready: decks, cards, reviews");
	return dbInstance;
}