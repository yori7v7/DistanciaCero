import { Calendar, Heart, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import siteConfig from '../data/siteConfig.json'

interface CounterStat {
  id: number
  icon: ReactNode
  value: number
  label: string
  hint: string
}

function parseLocalDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`)
}

function getTodayOnly(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function differenceInCalendarDays(fromDate: Date, toDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / msPerDay))
}

function differenceInDaysInclusive(fromDate: Date, toDate: Date): number {
  if (toDate < fromDate) return 0
  return differenceInCalendarDays(fromDate, toDate) + 1
}

function differenceInMonths(fromDate: Date, toDate: Date): number {
  if (toDate < fromDate) return 0
  let months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth())
  if (toDate.getDate() < fromDate.getDate()) months -= 1
  return Math.max(0, months)
}

function CounterSection() {
  const today = getTodayOnly()
  const metDate = parseLocalDate(siteConfig.dates.metDate)
  const storyStartDate = parseLocalDate(siteConfig.dates.relationshipStartDate)
  const nextMeetingDate = parseLocalDate(siteConfig.dates.nextMeetingDate)

  const stats: CounterStat[] = [
    { id: 1, icon: <Sparkles size={20} />, value: differenceInCalendarDays(metDate, today),
      label: siteConfig.dates.metLabel, hint: 'Desde el día en que todo empezó.' },
    { id: 2, icon: <Heart size={20} />, value: differenceInDaysInclusive(storyStartDate, today),
      label: siteConfig.dates.storyLabel, hint: 'Desde que decidieron ser oficiales.' },
    { id: 3, icon: <Calendar size={20} />, value: differenceInMonths(storyStartDate, today),
      label: 'Meses de historia', hint: 'Cada mes, un capítulo más para nosotros.' },
    { id: 4, icon: <Calendar size={20} />, value: differenceInCalendarDays(today, nextMeetingDate),
      label: siteConfig.dates.nextMeetingLabel, hint: 'Para ese día especial que ya vive en el calendario.' }
  ]

  return (
    <section className="section" id="contador">
      <div className="section-title fade-up">
        <span>Tiempo</span>
        <h2>Contadores del universo</h2>
        <p>Pequeñas formas de medir todo lo que empezó, todo lo que somos y todo lo que viene.</p>
      </div>

      <div className="counter-grid">
        {stats.map((stat) => (
          <article className="counter-card fade-up" key={stat.id}>
            <div className="counter-icon">{stat.icon}</div>
            <h3>{stat.value}</h3>
            <span>{stat.label}</span>
            <p>{stat.hint}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CounterSection
