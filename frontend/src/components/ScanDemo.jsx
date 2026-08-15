import { useEffect, useState } from 'react'

const scanExamples = [
  {
    file: 'scan://checkout-risk.js',
    language: 'Node checkout',
    score: 'B',
    lines: [
      'async function chargeUser(user, cart) {',
      '  const total = cart.items.reduce((sum, item) => sum + item.price, 0)',
      '  if (!user.paymentToken) return null',
      '  const receipt = await gateway.charge(user.paymentToken, total)',
      '  await db.orders.insert({ userId: user.id, receipt })',
      '  return receipt.id',
      '}',
    ],
    warning: 'Empty cart can charge 0 without a guard.',
    note: 'Returns null instead of an explicit payment error.',
  },
  {
    file: 'scan://auth/session.ts',
    language: 'Session guard',
    score: 'C',
    lines: [
      'export async function getSession(req) {',
      '  const token = req.headers.authorization?.replace("Bearer ", "")',
      '  const payload = session.decode(token)',
      '  if (!payload.userId) return undefined',
      '  return users.findById(payload.userId)',
      '}',
    ],
    warning: 'The session payload is decoded without signature verification.',
    note: 'Use verify(), then fail closed when the session is missing.',
  },
  {
    file: 'scan://api/search.py',
    language: 'Search route',
    score: 'D',
    lines: [
      'def search_users(request):',
      '    term = request.GET.get("q", "")',
      '    query = "{ name: /" + term + "/ }"',
      '    users = db.users.find(query)',
      '    return JsonResponse(list(users), safe=False)',
    ],
    warning: 'User input is assembled into a query string.',
    note: 'Parameterize the lookup and cap result size.',
  },
]

export default function ScanDemo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = scanExamples[activeIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % scanExamples.length)
    }, 6200)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="scan-demo" aria-label="Animated code scan with annotations">
      <div className="scan-demo__chrome">
        <span />
        <span />
        <span />
        <strong>{active.file}</strong>
      </div>
      <div className="scan-demo__meta">
        <span>{active.language}</span>
        <span>sample {activeIndex + 1}/3</span>
      </div>
      <pre className="code-window" key={active.file}>
        <code>
          {active.lines.map((line, index) => (
            <span className="code-line" key={`${active.file}-${line}`}>
              <span className="token-muted">{String(index + 1).padStart(2, '0')}</span> {line}
            </span>
          ))}
        </code>
      </pre>
      <div className="scan-line" aria-hidden="true" />
      <div className="annotation annotation--warning">
        <span>Flag</span>
        {active.warning}
      </div>
      <div className="annotation annotation--note">
        <span>Explanation</span>
        {active.note}
      </div>
      <div className="complexity-meter" aria-label={`Complexity score ${active.score}`}>
        <span>Complexity</span>
        <strong>{active.score}</strong>
      </div>
    </div>
  )
}
