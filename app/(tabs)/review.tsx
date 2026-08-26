import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";

import { openDatabase } from "../../src/db/database";
import { getDueCards } from "../../src/db/cardStates";
import { colors, spacing } from "../../src/theme";

export default function Review() {
	const [dueCount, setDueCount] = useState(0);

	useFocusEffect(
		useCallback(() => {
		async function load() {
			const db = await openDatabase();
			const due = await getDueCards(db);
			setDueCount(due.length);
		}
		load();
		}, [])
	);

	return (
		<View style={styles.container}>
		<Text style={styles.count}>{dueCount}</Text>
		<Text style={styles.label}>cards due</Text>

		<Pressable
			style={[styles.button, dueCount === 0 && styles.disabled]}
			onPress={() => dueCount > 0 && router.push("/review-session")}
		>
			<Text style={styles.buttonText}>Start Review</Text>
		</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
	count: { fontSize: 88, fontWeight: "700", color: colors.text },
	label: { fontSize: 18, color: colors.muted, marginBottom: spacing.xl },
	button: { backgroundColor: colors.accent, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
	disabled: { backgroundColor: colors.border },
	buttonText: { color: colors.accentText, fontSize: 20, fontWeight: "600" },
});