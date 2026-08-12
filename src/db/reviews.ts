import * as SQLite from "expo-sqlite";

export type Review = {
	id: number;
	card_id: number;
	review_date: string;
	quiz_type: string;
	is_correct: number;
	response_time_ms: number;
};

export async function insertReview(
	db: SQLite.SQLiteDatabase,
	cardId: number,
	quizType: string,
	isCorrect: boolean,
	responseTime: number,
) {
	const reviewDate = new Date().toISOString();
	const result = await db.runAsync(
		"INSERT INTO reviews (card_id, review_date, quiz_type, is_correct, response_time_ms) VALUES (?, ?, ?, ?, ?)",
		cardId,
		reviewDate,
		quizType,
		isCorrect ? 1 : 0,
		responseTime
	);
	return result.lastInsertRowId;
}