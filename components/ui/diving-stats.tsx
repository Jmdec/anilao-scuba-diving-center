interface DivingStatsProps {
  stats: {
    label: string
    value: string
    icon: string
  }[]
}

export function DivingStats({ stats }: DivingStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-cyan-200">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-cyan-800">{stat.value}</div>
          <div className="text-sm text-cyan-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
