import Link from 'next/link'
import { questions, getTopicStats } from '@/data/questions'

export default function HomePage() {
  const stats = getTopicStats()
  const totalQuestions = questions.length
  const topics = Object.entries(stats).sort((a, b) => b[1] - a[1])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Führerschein Theorie</h1>
        <p className="text-blue-100 mb-6 text-lg">
          Lerne alle Prüfungsfragen für den Führerschein Klasse B – mit Quiz-Modus und Fortschrittstracking.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/fragen"
            className="bg-white text-blue-800 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Alle Fragen lernen
          </Link>
          <Link
            href="/quiz"
            className="bg-blue-600 border border-blue-400 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-500 transition-colors"
          >
            Quiz starten
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Fragen gesamt" value={String(totalQuestions)} icon="📋" />
        <StatCard label="Themengebiete" value={String(topics.length)} icon="📚" />
        <StatCard label="Max. Fehlerpunkte" value="10" icon="⚠️" />
        <StatCard label="Fragen im Test" value="30" icon="✍️" />
      </div>

      {/* Topics */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Themengebiete</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics.map(([topic, count]) => (
          <Link
            key={topic}
            href={`/fragen?topic=${encodeURIComponent(topic)}`}
            className="bg-white rounded-xl shadow p-4 hover:shadow-md hover:border-blue-300 border border-transparent transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{topic}</span>
              <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                {count} Fragen
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">ℹ️ Prüfungsformat</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Prüfung besteht aus 30 Fragen (Grundstoff + Zusatzstoff)</li>
          <li>• Maximal 10 Fehlerpunkte erlaubt</li>
          <li>• Fragen mit 2–5 Fehlerpunkten gewichtet</li>
          <li>• Eine Frage mit 5 Fehlerpunkten direkt falsch = sofort durchgefallen</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
