import * as SQLite from "expo-sqlite";
import { Card } from "./cards"

export type LearnedCard = Card & {
	deck_name: string;
	due_date: string;
	interval_days: number;
	reps: number;
}

export async function learnCard(db: SQLite.SQLiteDatabase, cardId: number) {
	const dueDate = new Date();
	dueDate.setDate(dueDate.getDate() + 1);

	await db.runAsync(
		`INSERT INTO card_states (card_id, due_date, interval_days, reps)
		VALUES (?, ?, 1, 0)
		ON CONFLICT(card_id) DO NOTHING`,
		cardId,
		dueDate.toISOString()
	);
}

export async function updateCardState(
	db: SQLite.SQLiteDatabase,
	cardId: number,
	isCorrect: boolean
) {
	const existing = await db.getFirstAsync<{ interval_days: number; reps: number }>(
		"SELECT interval_days, reps FROM card_states WHERE card_id = ?",
		cardId
	);

	let interval = 1;
	let reps = 1;

	if (existing) {
		reps = existing.reps + 1;
		interval = isCorrect ? existing.interval_days * 2 : 1;
	}

	const dueDate = new Date();
	dueDate.setDate(dueDate.getDate() + interval);

	await db.runAsync(
		`INSERT INTO card_states (card_id, due_date, interval_days, reps)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(card_id) DO UPDATE SET
		due_date = excluded.due_date,
		interval_days = excluded.interval_days,
		reps = excluded.reps`,
		cardId,
		dueDate.toISOString(),
		interval,
		reps
	);
}

export async function getLearnedCards(db: SQLite.SQLiteDatabase): Promise<LearnedCard[]> {
	return db.getAllAsync<LearnedCard>(
		`SELECT cards.*, decks.name as deck_name, card_states.due_date, card_states.interval_days, card_states.reps
		FROM card_states
		JOIN cards ON cards.id = card_states.card_id
		JOIN decks ON decks.id = cards.deck_id
		ORDER BY card_states.due_date`
	)
}