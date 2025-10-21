import React, { useMemo, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
  


export default function UpcomingEvents() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Sample events keyed by yyyy-mm-dd
  const sampleEvents: Record<string, string[]> = {
    [formatKey(new Date())]: ["Today's event: Standup meeting"],
    [formatKey(new Date(new Date().getFullYear(), new Date().getMonth(), 10))]: [
      "Team retrospective",
      "Release deploy",
    ],
  };

  const monthMatrix = useMemo(() => buildMonthMatrix(currentMonth), [currentMonth]);

  function prevMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }
  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }
  function selectDate(d: Date) {
    setSelectedDate(d);
  }

  const selectedKey = formatKey(selectedDate);
  const eventsForSelected = sampleEvents[selectedKey] ?? [];

  const monthLabel = currentMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysRow}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
          <Text key={wd} style={styles.weekdayText}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthMatrix.map((row, rIdx) => (
          <View key={rIdx} style={styles.weekRow}>
            {row.map((day, cIdx) => {
              if (!day) {
                return <View key={cIdx} style={styles.dayCell} />;
              }
              const isSelected =
                day.getFullYear() === selectedDate.getFullYear() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getDate() === selectedDate.getDate();
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              return (
                <TouchableOpacity
                  key={cIdx}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.outsideMonthDay,
                    isSelected && styles.selectedDay,
                  ]}
                  onPress={() => selectDate(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      !isCurrentMonth && styles.outsideMonthDayText,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsHeader}>
          Events for {selectedDate.toDateString()}
        </Text>
        {eventsForSelected.length === 0 ? (
          <Text style={styles.noEventsText}>No events</Text>
        ) : (
          <FlatList
            data={eventsForSelected}
            keyExtractor={(item, i) => item + i}
            renderItem={({ item }) => <Text style={styles.eventItem}>• {item}</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* Helpers */

function buildMonthMatrix(refDate: Date): (Date | null)[][] {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // We'll render 6 rows of 7 days (common calendar layout)
  const matrix: (Date | null)[][] = [];
  let cur = 1 - startDay; // could be negative -> previous month's days

  for (let week = 0; week < 6; week++) {
    const row: (Date | null)[] = [];
    for (let d = 0; d < 7; d++, cur++) {
      const date = new Date(year, month, cur);
      row.push(date);
    }
    matrix.push(row);
  }
  return matrix;
}

function formatKey(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* Styles */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  navText: { fontSize: 28 },
  monthText: { fontSize: 18, fontWeight: "600" },

  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  weekdayText: { width: "14.28%", textAlign: "center", fontWeight: "600" },

  grid: { borderRadius: 8 },
  weekRow: { flexDirection: "row" },
  dayCell: {
    width: "14.28%",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 14 },
  outsideMonthDay: { opacity: 0.4 },
  outsideMonthDayText: { color: "#888" },
  selectedDay: {
    backgroundColor: "#007AFF",
    borderRadius: 24,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayText: { color: "white", fontWeight: "700" },

  eventsContainer: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderColor: "#eee" },
  eventsHeader: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  noEventsText: { color: "#777" },
  eventItem: { paddingVertical: 4, fontSize: 14 },
});
  