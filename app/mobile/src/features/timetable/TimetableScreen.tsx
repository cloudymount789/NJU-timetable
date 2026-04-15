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
import { formatMonthNum, formatSlashDate, getTeachingWeekDays, isSameDay } from "@/utils/weekCalendar";
import type { Course } from "@nju/contracts";
import { filterCoursesForGrid } from "@nju/domain";

const ROW_H = 52;
const LEFT_COL = 48;
const MONTH_COL_W = 38;

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
  const { tokens, appearance, fonts } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const timetables = useAppStore((s) => s.state.timetables);
  const selectedId = useAppStore((s) => s.state.selectedTimetableId);
  const weekIndex = useAppStore((s) => s.state.currentWeekIndex);
  const courses = useAppStore((s) => s.state.courses);
  const hideWeekend = useAppStore((s) => s.state.settings.hideWeekend);
  const hideEmpty = useAppStore((s) => s.state.settings.hideEmptyRows);
  const semesterStart = useAppStore((s) => s.state.settings.semesterStartDate);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [timetableOpen, setTimetableOpen] = React.useState(false);

  const selectedTimetable = timetables.find((t) => t.id === selectedId) ?? timetables[0];
  const timetableCourses = courses.filter((c) => c.timetableId === selectedTimetable?.id);
  const visibleCourses = filterCoursesForGrid(timetableCourses, weekIndex);

  const dayList = React.useMemo(
    () => (hideWeekend ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]),
    [hideWeekend],
  );

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

  const weekDays = React.useMemo(
    () => getTeachingWeekDays(semesterStart, weekIndex),
    [semesterStart, weekIndex],
  );

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const gridHeight = periods.length * ROW_H;
  const contentW = Math.max(320, width) - 40;
  const gridCanvasW = contentW - LEFT_COL;
  const dayColW = gridCanvasW / dayList.length;

  const openMenu = (): void => {
    setMenuOpen((v) => !v);
    setTimetableOpen(false);
  };

  const monthLabel = formatMonthNum(weekDays[0] ?? today);

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <View style={[styles.appHeader, { paddingTop: insets.top + 10, paddingHorizontal: 16 }]}>
        <View style={styles.headerRow1}>
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
            <Text
              style={[
                styles.heroTitle,
                { color: tokens.text, fontFamily: fonts.bold },
              ]}
              numberOfLines={1}
            >
              {selectedTimetable?.name ?? "我的课表"}
            </Text>
            <Ionicons
              color={tokens.textSecondary}
              name={timetableOpen ? "chevron-up" : "chevron-down"}
              size={16}
            />
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

        <View style={styles.weekSubtitleRow}>
          <Pressable hitSlop={8} onPress={() => setCurrentWeekIndex(Math.max(1, weekIndex - 1))}>
            <Ionicons color={tokens.textMuted} name="chevron-back" size={18} />
          </Pressable>
          <Text
            style={[
              styles.weekSubtitle,
              { color: tokens.textSecondary, fontFamily: fonts.regular },
            ]}
          >
            第 {weekIndex} 周
          </Text>
          <Pressable hitSlop={8} onPress={() => setCurrentWeekIndex(weekIndex + 1)}>
            <Ionicons color={tokens.textMuted} name="chevron-forward" size={18} />
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={menuOpen}>
        <Pressable onPress={() => setMenuOpen(false)} style={styles.menuBackdrop}>
          <View style={[styles.menuCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <MenuRow
              color={tokens.text}
              label="导入课表"
              onPress={() => {
                setMenuOpen(false);
                router.push("/import");
              }}
            />
            <MenuRow
              color={tokens.text}
              label="界面修改"
              onPress={() => {
                setMenuOpen(false);
                router.push("/settings");
              }}
            />
            <MenuRow
              color={tokens.text}
              label="全部课程"
              onPress={() => {
                setMenuOpen(false);
                router.push("/courses");
              }}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal animationType="fade" transparent visible={timetableOpen}>
        <Pressable onPress={() => setTimetableOpen(false)} style={styles.menuBackdrop}>
          <View style={[styles.menuCardWide, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            {timetables.map((tt) => (
              <Pressable
                key={tt.id}
                onPress={() => {
                  selectTimetable(tt.id);
                  setTimetableOpen(false);
                }}
                style={styles.ttRow}
              >
                <Text
                  style={{
                    color: tokens.text,
                    fontWeight: tt.id === selectedId ? "800" : "500",
                    fontFamily: fonts.semibold,
                  }}
                >
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

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentW, alignSelf: "center" }}>
          <View style={[styles.dayStrip, { width: contentW }]}>
            <BlurView
              intensity={appearance === "dark" ? 28 : 22}
              style={StyleSheet.absoluteFill}
              tint={appearance === "dark" ? "dark" : "light"}
            />
            <View style={[styles.dayStripFill, { backgroundColor: tokens.glass }]} />
            <View style={styles.dayStripRow}>
              <View style={{ width: MONTH_COL_W, alignItems: "center", gap: 2 }}>
                <Text style={[styles.monthSmall, { color: tokens.textSecondary, fontFamily: fonts.semibold }]}>
                  {monthLabel}
                </Text>
                <Text
                  style={[styles.weekTiny, { color: tokens.textSecondary, fontFamily: fonts.regular }]}
                >
                  第{weekIndex}周
                </Text>
              </View>
              {dayList.map((d) => {
                const date = weekDays[d - 1];
                const isToday = date ? isSameDay(date, today) : false;
                return (
                  <View
                    key={d}
                    style={[
                      styles.dayHeadCell,
                      {
                        flex: 1,
                        borderColor: isToday ? tokens.accent : "transparent",
                        backgroundColor: isToday ? tokens.chrome : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayTiny,
                        { color: tokens.textSecondary, fontFamily: fonts.regular },
                      ]}
                    >
                      周{WEEK_LABELS[d - 1]}
                    </Text>
                    <Text
                      style={[
                        styles.dateSmall,
                        {
                          color: isToday ? tokens.accent : tokens.text,
                          fontFamily: fonts.semibold,
                          fontWeight: isToday ? "700" : "600",
                        },
                      ]}
                    >
                      {date ? formatSlashDate(date) : "—"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.scheduleBody, { width: contentW, minHeight: gridHeight }]}>
            <View
              style={[
                styles.timeCol,
                {
                  width: LEFT_COL,
                  borderRightColor: tokens.border,
                  height: gridHeight,
                },
              ]}
            >
              <BlurView
                intensity={appearance === "dark" ? 24 : 18}
                style={StyleSheet.absoluteFill}
                tint={appearance === "dark" ? "dark" : "light"}
              />
              <View style={[styles.timeColFill, { backgroundColor: tokens.glass }]} />
              {periods.map((p) => (
                <View
                  key={p.index}
                  style={[
                    styles.timeCell,
                    {
                      height: ROW_H,
                      borderBottomColor: tokens.divider,
                    },
                  ]}
                >
                  <Text style={[styles.periodNum, { color: tokens.text, fontFamily: fonts.bold }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.periodTime, { color: tokens.textSecondary, fontFamily: fonts.regular }]}>
                    {p.start}
                  </Text>
                  <Text style={[styles.periodTime, { color: tokens.textSecondary, fontFamily: fonts.regular }]}>
                    {p.end}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ width: gridCanvasW, height: gridHeight, position: "relative" }}>
              {dayList.map((day, colIndex) => {
                const dayCourses = visibleCourses.filter((c) => c.weekday === day);
                const lanes = assignLanes(dayCourses);
                const minPeriod = periods[0]?.index ?? 1;
                const maxPeriod = periods[periods.length - 1]?.index ?? 12;
                const date = weekDays[day - 1];
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayCol,
                      {
                        left: colIndex * dayColW,
                        width: dayColW,
                        height: gridHeight,
                        borderRightColor: tokens.gridLine,
                      },
                    ]}
                  >
                    {periods.map((p) => (
                      <View
                        key={p.index}
                        style={[styles.gridCell, { height: ROW_H, borderBottomColor: tokens.divider }]}
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
                                    borderColor: tokens.courseRing,
                                  },
                                ]}
                              >
                                <BlurView
                                  intensity={26}
                                  style={StyleSheet.absoluteFill}
                                  tint={appearance === "dark" ? "dark" : "light"}
                                />
                                <View
                                  style={[
                                    styles.courseInner,
                                    {
                                      borderColor: tokens.courseRing,
                                      backgroundColor: paint.fill,
                                    },
                                  ]}
                                >
                                  <Text
                                    numberOfLines={2}
                                    style={[
                                      styles.courseTitle,
                                      { color: tokens.courseTitle, fontFamily: fonts.bold },
                                    ]}
                                  >
                                    {course.title}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.courseSub,
                                      { color: tokens.courseSubtitle, fontFamily: fonts.regular },
                                    ]}
                                  >
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

function MenuRow(props: { label: string; color: string; onPress: () => void }): React.JSX.Element {
  return (
    <Pressable onPress={props.onPress} style={styles.menuRow}>
      <Text style={[styles.menuRowText, { color: props.color }]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  appHeader: {
    gap: 6,
    paddingBottom: 12,
  },
  headerRow1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    gap: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    maxWidth: "72%",
  },
  weekSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  weekSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    minWidth: 80,
    textAlign: "center",
  },
  dayStrip: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    minHeight: 56,
  },
  dayStripFill: {
    ...StyleSheet.absoluteFillObject,
  },
  dayStripRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 2,
  },
  monthSmall: {
    fontSize: 12,
    fontWeight: "600",
  },
  weekTiny: {
    fontSize: 10,
    fontWeight: "400",
  },
  dayHeadCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  weekdayTiny: {
    fontSize: 10,
    fontWeight: "400",
  },
  dateSmall: {
    fontSize: 11,
  },
  scheduleBody: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    overflow: "hidden",
  },
  timeCol: {
    borderRightWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  timeColFill: {
    ...StyleSheet.absoluteFillObject,
  },
  timeCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
  },
  periodNum: {
    fontSize: 16,
    fontWeight: "700",
  },
  periodTime: {
    fontSize: 9,
    fontWeight: "400",
  },
  dayCol: {
    position: "absolute",
    top: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  gridCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  courseAbs: {
    position: "absolute",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  courseInner: {
    flex: 1,
    padding: 6,
    justifyContent: "flex-start",
  },
  courseTitle: {
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
  },
  courseSub: {
    fontSize: 8,
    marginTop: 1,
    lineHeight: 10,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,20,25,0.25)",
    paddingTop: 120,
    paddingHorizontal: 24,
    alignItems: "flex-end",
  },
  menuCard: {
    alignSelf: "flex-end",
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  menuCardWide: {
    alignSelf: "stretch",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  menuRow: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: "400",
  },
  ttRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});
