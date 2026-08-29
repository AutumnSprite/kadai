import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";

import { rescheduleCard } from "../../src/db/cardStates";
import { openDatabase } from "../../src/db/database";
import { getLearnedCard, LearnedCard } from "../../src/db/cardStates";
import { colors, spacing } from "../../src/theme";

export default function CardModal() {
	const { id } = useLocalSearchParams();
	const [card, setCard] = useState<LearnedCard | null>(null);
	const [days, setDays] = useState("");

	useEffect(() => {
		async function load() {
			const db = await openDatabase();
			setCard(await getLearnedCard(db, Number(id)));
		}
		load();
	}, [id]);

	async function reschedule(intervalDays: number) {
		const db = await openDatabase();
		await rescheduleCard(db, Number(id), intervalDays);
		router.back();
	}

	return (
		<Pressable style={styles.backdrop} onPress={() => router.back()}>
			<Pressable style={styles.card} onPress={() => {}}>
				{card && (
				<>
					<Text style={styles.japanese}>{card.japanese}</Text>
					<Text style={styles.reading}>{card.reading}</Text>
					<Text style={styles.english}>{card.english}</Text>
					<Text style={styles.meta}>
						Due {new Date(card.due_date).toLocaleDateString()} · {card.interval_days}d · {card.reps} reps
					</Text>

					<View style={styles.buttons}>
						<Pressable style={styles.btn} onPress={() => reschedule(0)}><Text style={styles.btnText}>Due now</Text></Pressable>
						<Pressable style={styles.btn} onPress={() => reschedule(1)}><Text style={styles.btnText}>In 1 day</Text></Pressable>
						<Pressable style={styles.btn} onPress={() => reschedule(7)}><Text style={styles.btnText}>In 7 days</Text></Pressable>
					</View>

					<View style={styles.manualRow}>
						<TextInput
							style={styles.input}
							value={days}
							onChangeText={setDays}
							placeholder="Days"
							placeholderTextColor={colors.muted}
							keyboardType="number-pad"
						/>
						<Pressable style={styles.setBtn} onPress={() => reschedule(Number(days) || 0)}>
							<Text style={styles.btnText}>Set</Text>
						</Pressable>
					</View>
				</>
				)}
			</Pressable>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
	card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, width: "85%", alignItems: "center" },
	japanese: { fontSize: 48, color: colors.text },
	reading: { fontSize: 24, color: colors.muted, marginTop: spacing.sm },
	english: { fontSize: 22, color: colors.text, marginTop: spacing.sm },
	meta: { fontSize: 14, color: colors.muted, marginTop: spacing.md },
	buttons: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
	btn: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
	btnText: { color: colors.accentText, fontWeight: "600" },
	manualRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, alignItems: "center" },
	input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, width: 80, textAlign: "center", color: colors.text },
	setBtn: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
});