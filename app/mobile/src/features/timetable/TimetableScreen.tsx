import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CapsuleButton } from "@/components/CapsuleButton";
import { DEFAULT_PERIODS } from "@/constants/periods";
import {
  addSecondaryTimetable,
  selectTimetable,
  setCurrentWeekIndex,
} from "@/state/actions";
import { useAppStore } from "@/state/store";
import { resolveCoursePaint } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeContext";
import type { Course } from "@nju/contracts";
import { filterCoursesForGrid } from "@nju/domain";

const ROW_H = 54;
const LEFT_COL = 52;
const HEADER_H = 36;

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function overlaps(a: Course, b: Course): boolean {
  return a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod;
}

function assignLanes(courses: Course[]): Course[][] {
  const sorted = [...courses].sort(
    (x, y) => x.startPeriod - y.startPeriod || x.endPeriod - y.endPeriod,
  );
  const lanes: Course[][] = [];
  sorted.forEach((course) => {
    let placed = false;
    for (const lane of lanes) {
      const last = lane[lane.length - 1];
      if (!last || !overlaps(last, course)) {
        lane.push(course);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([course]);
    }
  });
  return lanes;
}

export function TimetableScreen(): React.JSX.Element {
  const { tokens, appearance } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const timetables = useAppStore((s) => s.state.timetables);
  const selectedId = useAppStore((s) => s.state.selectedTimetableId);
  const weekIndex = useAppStore((s) => s.state.currentWeekIndex);
  const courses = useAppStore((s) => s.state.courses);
  const hideWeekend = useAppStore((s) => s.state.settings.hideWeekend);
  const hideEmpty = useAppStore((s) => s.state.settings.hideEmptyRows);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [timetableOpen, setTimetableOpen] = React.useState(false);

  const selectedTimetable = timetables.find((t) => t.id === selectedId) ?? timetables[0];
  const timetableCourses = courses.filter((c) => c.timetableId === selectedTimetable?.id);
  const visibleCourses = filterCoursesForGrid(timetableCourses, weekIndex);

  const dayIndexes = hideWeekend ? ([1, 2, 3, 4, 5] as const) : ([1, 2, 3, 4, 5, 6, 7] as const);

  const periods = React.useMemo(() => {
    if (!hideEmpty) {
      return DEFAULT_PERIODS;
    }
    const used = new Set<number>();
    visibleCourses.forEach((c) => {
      for (let p = c.startPeriod; p <= c.endPeriod; p += 1) {
        used.add(p);
      }
    });
    return DEFAULT_PERIODS.filter((p) => used.has(p.index));
  }, [hideEmpty, visibleCourses]);

  const gridHeight = periods.length * ROW_H;
  const gridWidth = Math.max(320, width) - 16;
  const dayColW = (gridWidth - LEFT_COL) / dayIndexes.length;

  const openMenu = (): void => {
    setMenuOpen((v) => !v);
    setTimetableOpen(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityLabel="Open actions menu"
            hitSlop={8}
            onPress={openMenu}
            style={styles.iconBtn}
          >
            <Ionicons color={tokens.text} name={menuOpen ? "close" : "add"} size={22} />
          </Pressable>

          <Pressable
            onPress={() => {
              setTimetableOpen((v) => !v);
              setMenuOpen(false);
            }}
            style={styles.titlePress}
          >
            <Text style={[styles.title, { color: tokens.text }]} numberOfLines={1}>
              {selectedTimetable?.name ?? "课表"}
            </Text>
            <Ionicons color={tokens.textSecondary} name={timetableOpen ? "chevron-up" : "chevron-down"} size={16} />
          </Pressable>

          <Pressable
            accessibilityLabel="Open settings"
            hitSlop={8}
            onPress={() => router.push("/settings")}
            style={styles.iconBtn}
          >
            <Ionicons color={tokens.text} name="settings-outline" size={20} />
          </Pressable>
        </View>

        <View style={styles.subRow}>
          <Text style={[styles.month, { color: tokens.textSecondary }]}>四月 · 教学周</Text>
          <View style={styles.weekNav}>
            <Pressable
              hitSlop={8}
              onPress={() => setCurrentWeekIndex(Math.max(1, weekIndex - 1))}
              style={styles.iconBtn}
            >
              <Ionicons color={tokens.text} name="chevron-back" size={18} />
            </Pressable>
            <Text style={[styles.weekLabel, { color: tokens.accent }]}>第 {weekIndex} 周</Text>
            <Pressable
              hitSlop={8}
              onPress={() => setCurrentWeekIndex(weekIndex + 1)}
              style={styles.iconBtn}
            >
              <Ionicons color={tokens.text} name="chevron-forward" size={18} />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={menuOpen}>
        <Pressable onPress={() => setMenuOpen(false)} style={styles.menuBackdrop}>
          <View style={[styles.menuCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <MenuRow label="导入课表" onPress={() => { setMenuOpen(false); router.push("/import"); }} />
            <MenuRow label="界面修改" onPress={() => { setMenuOpen(false); router.push("/settings"); }} />
            <MenuRow label="全部课程" onPress={() => { setMenuOpen(false); router.push("/courses"); }} />
          </View>
        </Pressable>
      </Modal>

      <Modal animationType="fade" transparent visible={timetableOpen}>
        <Pressable onPress={() => setTimetableOpen(false)} style={styles.menuBackdrop}>
          <View style={[styles.menuCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            {timetables.map((tt) => (
              <Pressable
                key={tt.id}
                onPress={() => {
                  selectTimetable(tt.id);
                  setTimetableOpen(false);
                }}
                style={styles.ttRow}
              >
                <Text style={{ color: tokens.text, fontWeight: tt.id === selectedId ? "800" : "500" }}>
                  {tt.name}
                </Text>
                {tt.isPrimary ? (
                  <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>主课表</Text>
                ) : null}
              </Pressable>
            ))}
            <CapsuleButton
              label="新建课表（示例）"
              onPress={() => {
                addSecondaryTimetable(`课表 ${timetables.length + 1}`);
                setTimetableOpen(false);
              }}
              variant="secondary"
            />
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: insets.bottom + 24 }}>
        <View style={[styles.gridWrap, { borderColor: tokens.border, width: gridWidth }]}>
          <View style={[styles.headerRow, { height: HEADER_H }]}>
            <View style={[styles.corner, { width: LEFT_COL, borderColor: tokens.border }]} />
            {dayIndexes.map((d) => (
              <View
                key={d}
                style={[
                  styles.dayHead,
                  { width: dayColW, borderColor: tokens.border },
                ]}
              >
                <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>周{WEEK_LABELS[d - 1]}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ width: LEFT_COL }}>
              {periods.map((p) => (
                <View
                  key={p.index}
                  style={[
                    styles.leftCell,
                    { height: ROW_H, borderColor: tokens.border },
                  ]}
                >
                  <Text style={{ color: tokens.text, fontWeight: "700", fontSize: 12 }}>{p.label}</Text>
                  <Text style={{ color: tokens.textSecondary, fontSize: 10 }}>
                    {`${p.start}\n${p.end}`}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
              {dayIndexes.map((day) => {
                const dayCourses = visibleCourses.filter((c) => c.weekday === day);
                const lanes = assignLanes(dayCourses);
                const minPeriod = periods[0]?.index ?? 1;
                const maxPeriod = periods[periods.length - 1]?.index ?? 12;
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayCol,
                      { width: dayColW, height: gridHeight, borderColor: tokens.border },
                    ]}
                  >
                    {periods.map((p) => (
                      <View
                        key={p.index}
                        style={[
                          styles.gridCell,
                          { height: ROW_H, borderColor: tokens.border },
                        ]}
                      />
                    ))}

                    {lanes.map((lane, laneIndex) => {
                      const laneW = 100 / Math.max(lanes.length, 1);
                      const leftPct = laneIndex * laneW;
                      return lane
                        .filter((c) => c.endPeriod >= minPeriod && c.startPeriod <= maxPeriod)
                        .map((course) => {
                          const top = (Math.max(course.startPeriod, minPeriod) - minPeriod) * ROW_H;
                          const bottomPeriod = Math.min(course.endPeriod, maxPeriod);
                          const span = bottomPeriod - Math.max(course.startPeriod, minPeriod) + 1;
                          const h = span * ROW_H - 4;
                          const paint = resolveCoursePaint(course.colorToken, appearance);

                          return (
                            <Link
                              asChild
                              href={`/courses/${course.id}`}
                              key={`${course.id}-lane-${laneIndex}`}
                            >
                              <Pressable
                                style={[
                                  styles.courseAbs,
                                  {
                                    top: top + 2,
                                    height: Math.max(h, ROW_H - 6),
                                    left: `${leftPct}%`,
                                    width: `${laneW}%`,
                                    borderColor: tokens.glassBorder,
                                  },
                                ]}
                              >
                                <BlurView
                                  intensity={28}
                                  style={StyleSheet.absoluteFill}
                                  tint={appearance === "dark" ? "dark" : "light"}
                                />
                                <View
                                  style={[
                                    styles.courseInner,
                                    {
                                      borderColor: tokens.glassBorder,
                                      backgroundColor:
                                        appearance === "dark"
                                          ? "rgba(255,255,255,0.06)"
                                          : "rgba(255,255,255,0.38)",
                                    },
                                  ]}
                                >
                                  <Text numberOfLines={2} style={[styles.courseTitle, { color: paint.text }]}>
                                    {course.title}
                                  </Text>
                                  <Text numberOfLines={1} style={[styles.courseSub, { color: paint.text }]}>
                                    {course.classroom ?? "教室待定"}
                                  </Text>
                                </View>
                              </Pressable>
                            </Link>
                          );
                        });
                    })}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuRow(props: { label: string; onPress: () => void }): React.JSX.Element {
  return (
    <Pressable onPress={props.onPress} style={{ paddingVertical: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: 10,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  titlePress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 6,
  },
  month: { fontSize: 13 },
  weekNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  weekLabel: { fontWeight: "800" },
  gridWrap: {
    alignSelf: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    overflow: "hidden",
  },
  headerRow: { flexDirection: "row" },
  corner: { borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  dayHead: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  leftCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  dayCol: {
    borderRightWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },
  gridCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  courseAbs: {
    position: "absolute",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  courseInner: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  courseTitle: { fontSize: 12, fontWeight: "800" },
  courseSub: { fontSize: 11, marginTop: 2, opacity: 0.78 },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,20,25,0.25)",
    paddingTop: 120,
    paddingHorizontal: 24,
    alignItems: "flex-end",
  },
  menuCard: {
    alignSelf: "stretch",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  ttRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});
