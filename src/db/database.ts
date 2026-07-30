import * as SQLite from "expo-sqlite";

export async function openDatabase() {
	const db = await SQLite.openDatabaseAsync("kadai.db");
	console.log("database opened");
	return db;
}