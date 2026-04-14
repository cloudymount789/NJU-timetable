import type { CourseReminder } from "@nju/contracts";

export function createReminderDefaults(courseId: string): CourseReminder {
  return {
    courseId,
    leadMinutes: 10,
    channels: ["notification"],
    skipWeekendsAndHolidays: true,
  };
}

export function setReminderLeadMinutes(
  reminder: CourseReminder,
  leadMinutes: CourseReminder["leadMinutes"],
): CourseReminder {
  return { ...reminder, leadMinutes };
}

export function toggleReminderChannel(
  reminder: CourseReminder,
  channel: CourseReminder["channels"][number],
): CourseReminder {
  const hasChannel = reminder.channels.includes(channel);
  return {
    ...reminder,
    channels: hasChannel
      ? reminder.channels.filter((item) => item !== channel)
      : [...reminder.channels, channel],
  };
}

export function setReminderHolidaySkip(reminder: CourseReminder, enabled: boolean): CourseReminder {
  return {
    ...reminder,
    skipWeekendsAndHolidays: enabled,
  };
}
