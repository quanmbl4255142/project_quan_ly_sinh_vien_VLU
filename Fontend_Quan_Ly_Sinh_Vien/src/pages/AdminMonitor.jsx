import React, { useEffect, useState } from 'react'
import { getAdminMetrics } from '../api'

export default function AdminMonitor(){
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    let timer

    const fetchMetrics = async () => {
      try{
        const data = await getAdminMetrics()
        if(isMounted) setMetrics(data)
        setError('')
      }catch(err){
        if(isMounted) setError(err?.data?.error || 'Không lấy được metrics')
      }
    }

    fetchMetrics()
    timer = setInterval(fetchMetrics, 5000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  )

  const Stat = ({label, value}) => (
    <div className="p-4 rounded-lg bg-gray-50">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">👁️‍🗨️ Monitoring</h2>
        <p className="text-gray-500">Các chỉ số runtime cơ bản (tự cập nhật mỗi 5 giây)</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {!metrics ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Stat label="Requests (15m)" value={metrics.totals.requests_15m} />
            <Stat label="Active users (15m)" value={metrics.totals.active_users_15m} />
            <Stat label="Generated at" value={new Date(metrics.generated_at*1000).toLocaleTimeString()} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Section title="Last 1 minute">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Requests" value={metrics.last_1m.requests} />
                <Stat label="Errors" value={metrics.last_1m.errors} />
                <Stat label="Avg ms" value={metrics.last_1m.avg_response_ms.toFixed(1)} />
                <Stat label="p95 ms" value={metrics.last_1m.p95_response_ms.toFixed(1)} />
              </div>
            </Section>

            <Section title="Last 5 minutes">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Requests" value={metrics.last_5m.requests} />
                <Stat label="Errors" value={metrics.last_5m.errors} />
                <Stat label="Avg ms" value={metrics.last_5m.avg_response_ms.toFixed(1)} />
                <Stat label="p95 ms" value={metrics.last_5m.p95_response_ms.toFixed(1)} />
              </div>
            </Section>
          </div>

          <Section title="Status codes (15m)">
            <div className="flex flex-wrap gap-3">
              {Object.entries(metrics.totals.by_status_15m).map(([code, count]) => (
                <div key={code} className="px-4 py-2 rounded-lg bg-gray-50 border text-sm">
                  <span className="font-semibold">{code}</span>: {count}
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  )
}


