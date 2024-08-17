import { loadCalendars } from 'loader';
import dynamic from 'next/dynamic';

const DynamicCalendarView = dynamic(
  () =>
    import('./_component/CalendarWrapper').then((mod) => mod.CalendarWrapper),
  {
    ssr: false,
  }
);

async function CalendarPage() {
  const calendars = await loadCalendars();
  return (
    <div
      style={{
        height: 'auto',
        width: '100%',
        paddingInline: 'var(--lotta-spacing)',
      }}
    >
      <DynamicCalendarView calendars={calendars} />
    </div>
  );
}

export default CalendarPage;
