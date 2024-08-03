import dynamic from 'next/dynamic';

const DynamicCalendarView = dynamic(() => import('./_component/CalendarView'), {
  ssr: false,
});

async function CalendarPage() {
  return (
    <div style={{ height: '100%' }}>
      <DynamicCalendarView />
    </div>
  );
}

export default CalendarPage;
