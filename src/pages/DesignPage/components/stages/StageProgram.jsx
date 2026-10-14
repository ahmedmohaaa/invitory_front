import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import Switch from '../Switch/Switch';
import { to24, from24 } from '../../utils/time';
import './StageProgram.css';

const COPY = {
  ar: {
    title: 'برنامج الحفل',
    desc: 'فعّل برنامج الحفل وأضف فعالياتك بترتيبها — اسم الفعالية ووقتها بالساعة والدقيقة، وينعكس البرنامج فوراً في الصفحة الثالثة.',
    visibleToggle: 'إظهار الفعاليات',
    visibleHint: 'عند الإيقاف يُخفى بوكس البرنامج بالكامل من الدعوة.',
    eventName: 'اسم الفعالية',
    eventNamePh: 'مثال: استقبال الضيوف',
    timeLabel: 'الوقت',
    hour: 'الساعة',
    minute: 'الدقيقة',
    period: 'الفترة',
    am: 'صباحاً',
    pm: 'مساءً',
    addEvent: 'إضافة فعالية أخرى',
    remove: 'إزالة',
    maxNote: 'يمكن إضافة حتى 10 فعاليات.',
    missingName: 'أدخل اسم الفعالية ليظهر في البرنامج.',
    hiddenNote: 'البرنامج مخفي حالياً من الدعوة.',
  },
  en: {
    title: 'Event Program',
    desc: 'Enable the program and add your events in order — name and time down to the minute; the program reflects instantly on page three.',
    visibleToggle: 'Show events',
    visibleHint: 'When off, the program box is hidden from the invitation entirely.',
    eventName: 'Event name',
    eventNamePh: 'e.g. Guests reception',
    timeLabel: 'Time',
    hour: 'Hour',
    minute: 'Minute',
    period: 'Period',
    am: 'AM',
    pm: 'PM',
    addEvent: 'Add another event',
    remove: 'Remove',
    maxNote: 'Up to 10 events can be added.',
    missingName: 'Enter the event name so it appears in the program.',
    hiddenNote: 'The program is currently hidden from the invitation.',
  },
};

const MAX_EVENTS = 10;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** 🎪 الخطوة 8 — برنامج الحفل */
export default function StageProgram() {
  const { lang } = useLanguage();
  const { state, update, push, remove } = useDesign();
  const c = COPY[lang];

  const program = state.program || { visible: true, events: [] };
  const events = program.events || [];

  /* تعديل جزء من الوقت (ساعة/دقيقة/فترة) مع تحويل فوري لصيغة HH:MM المخزنة */
  const setTime = (i, part, value) => {
    const cur = from24(events[i].time);
    update(`program.events.${i}.time`, to24(
      part === 'hour12' ? value : cur.hour12,
      part === 'minute' ? value : cur.minute,
      part === 'period' ? value : cur.period,
    ));
  };

  return (
    <section className="pg fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      <Switch
        checked={!!program.visible}
        onChange={(v) => update('program.visible', v)}
        label={c.visibleToggle}
        hint={c.visibleHint}
      />

      {!program.visible && <p className="pg-hint pg-hint--warn">{c.hiddenNote}</p>}

      {program.visible && (
        <>
          {events.map((ev, i) => {
            const t = from24(ev.time);
            return (
              <div className="pg-card" key={i}>
                <div className="pg-card__head">
                  <span className="pg-card__index" aria-hidden="true">{i + 1}</span>
                  <p className="pg-card__title">{c.eventName} {i + 1}</p>
                  {events.length > 1 && (
                    <button type="button" className="pg-remove" onClick={() => remove('program.events', i)}>
                      {c.remove}
                    </button>
                  )}
                </div>

                <label className="pg-label">{c.eventName}</label>
                <input
                  type="text"
                  maxLength={60}
                  className={`pg-input ${!ev.name ? 'is-missing' : ''}`}
                  value={ev.name || ''}
                  placeholder={c.eventNamePh}
                  onChange={(e) => update(`program.events.${i}.name`, e.target.value)}
                />
                {!ev.name && <p className="pg-hint pg-hint--warn">{c.missingName}</p>}

                <label className="pg-label">{c.timeLabel}</label>
                <div className="pg-time">
                  <select
                    className="pg-select"
                    value={t.hour12}
                    onChange={(e) => setTime(i, 'hour12', Number(e.target.value))}
                    aria-label={c.hour}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select>
                  <span className="pg-time__sep" aria-hidden="true">:</span>
                  <select
                    className="pg-select"
                    value={t.minute}
                    onChange={(e) => setTime(i, 'minute', Number(e.target.value))}
                    aria-label={c.minute}
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                  <select
                    className="pg-select pg-select--period"
                    value={t.period}
                    onChange={(e) => setTime(i, 'period', e.target.value)}
                    aria-label={c.period}
                  >
                    <option value="AM">{c.am}</option>
                    <option value="PM">{c.pm}</option>
                  </select>
                </div>
              </div>
            );
          })}

          {events.length < MAX_EVENTS ? (
            <button
              type="button"
              className="pg-add"
              onClick={() => push('program.events', { name: '', time: '20:00' })}
            >
              + {c.addEvent}
            </button>
          ) : (
            <p className="pg-hint">{c.maxNote}</p>
          )}
        </>
      )}
    </section>
  );
}