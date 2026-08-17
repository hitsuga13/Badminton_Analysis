<template>
  <q-page class="dashboard-page">
    <div class="content-wrap">
      <header class="dashboard-header">
        <div>
          <h1>Post-Match Analytics</h1>
          <p>{{ dashboardSummary.subtitle }}</p>
        </div>

        <div class="match-card">
          <label class="dashboard-match-select">
            <span>Match</span>
            <select
              v-model="selectedMatchId"
              :disabled="dashboardMatches.length === 0"
              @change="selectDashboardMatch"
            >
              <option v-if="dashboardMatches.length === 0" value="">Static sample dashboard</option>
              <option
                v-for="matchReport in dashboardMatches"
                :key="matchReport.match.id"
                :value="matchReport.match.id"
              >
                {{ matchOptionLabel(matchReport) }}
              </option>
            </select>
          </label>
          <button class="secondary-action" type="button" @click="exportReport">
            Export Report
          </button>
          <div class="matchup">
            <div class="player player--right">
              <strong>{{ dashboardSummary.playerA }}</strong>
              <span :class="dashboardSummary.playerALabel === 'Leader' && 'winner'">
                {{ dashboardSummary.playerALabel }}
              </span>
            </div>
            <div class="versus">VS</div>
            <div class="player">
              <strong>{{ dashboardSummary.playerB }}</strong>
              <span :class="dashboardSummary.playerBLabel === 'Leader' && 'winner'">
                {{ dashboardSummary.playerBLabel }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section class="stats-grid">
        <article v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-label">
            <q-icon :name="stat.icon" size="20px" />
            <span>{{ stat.label }}</span>
          </div>
          <strong>{{ stat.value }}</strong>
          <small>{{ stat.sub }}</small>
        </article>
      </section>

      <section class="analytics-grid">
        <article v-if="settings.analytics.shotFrequency" class="panel panel--wide">
          <div class="panel-head">
            <h2>Shot Frequency & Distribution</h2>
            <p>Comparison of shot types used during the match.</p>
          </div>
          <VChart class="chart chart--bar" :option="shotFrequencyOptions" />
        </article>

        <article v-if="settings.analytics.radar" class="panel">
          <div class="panel-head">
            <h2>Performance Radar</h2>
            <p>Multi-dimensional analysis.</p>
          </div>
          <div class="radar-chart-shell" @mouseleave="hoveredRadarMetric = null">
            <VChart class="chart chart--radar" :option="performanceRadarOptions" />
            <button
              v-for="(metric, index) in radarData"
              :key="metric.subject"
              class="radar-hover-point"
              type="button"
              :style="getRadarPointStyle(index)"
              :aria-label="`${metric.subject} values`"
              @mouseenter="hoveredRadarMetric = metric"
              @focus="hoveredRadarMetric = metric"
              @blur="hoveredRadarMetric = null"
            />

            <div
              v-if="hoveredRadarMetric"
              class="radar-metric-tooltip"
              :style="getRadarTooltipStyle(hoveredRadarMetric)"
            >
              <span>{{ hoveredRadarMetric.subject }}</span>
              <div>
                <strong>{{ shortPlayerName(dashboardSummary.playerA) }}</strong>
                <em>{{ hoveredRadarMetric.playerA }}</em>
              </div>
              <div>
                <strong>{{ shortPlayerName(dashboardSummary.playerB) }}</strong>
                <em>{{ hoveredRadarMetric.playerB }}</em>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section v-if="settings.analytics.insights" class="insight-grid">
        <article v-for="insight in insights" :key="insight.title" class="insight-card">
          <div class="insight-icon">
            <q-icon :name="insight.icon" size="26px" />
          </div>
          <div>
            <span>{{ insight.player }}</span>
            <h3>{{ insight.title }}</h3>
            <p>{{ insight.description }}</p>
          </div>
        </article>
      </section>

      <section v-if="notationReport?.analysis" class="panel ai-summary-panel">
        <div class="panel-head">
          <h2>AI Coach Summary</h2>
          <p v-if="notationReport.analysis.status === 'generating'">Preparing coaching analysis…</p>
          <p v-else-if="notationReport.analysis.status === 'unavailable'">
            AI summary is unavailable.
          </p>
          <p v-else>Generated automatically when the match ended.</p>
        </div>
        <p v-if="notationReport.analysis.status === 'ready'" class="ai-summary-text">
          {{ notationReport.analysis.summary }}
        </p>
        <p v-else-if="notationReport.analysis.status === 'unavailable'" class="ai-summary-text">
          {{ notationReport.analysis.summary }}
        </p>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { BarChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { loadSettings } from '@/data/settings'

use([
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  RadarChart,
  RadarComponent,
  TooltipComponent,
])

const chartTextColor = '#a1a1aa'
const borderColor = '#27272a'
const primaryColor = '#dfff00'
const secondarySeriesColor = '#71717a'
const cardColor = '#141416'
const foregroundColor = '#fafafa'
const notationStorageKey = 'akp-shuttletrace:last-match-notation'
const legacyNotationStorageKey = `court${'sense'}:last-match-notation`
const historyStorageKey = 'akp-shuttletrace:match-history'
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const hoveredRadarMetric = ref(null)
const notationReport = ref(null)
const dashboardMatches = ref([])
const selectedMatchId = ref('')
const settings = loadSettings()

const dashboardSummary = computed(() => buildDashboardSummary(notationReport.value))
const stats = computed(() => buildStats(notationReport.value))
const shotData = computed(() => buildShotData(notationReport.value))
const radarData = computed(() => buildRadarData(notationReport.value))
const insights = computed(() => buildInsights(notationReport.value))

onMounted(() => {
  refreshDashboardMatches()
  window.addEventListener('akp-ai-summary-ready', refreshDashboardMatches)
})

onUnmounted(() => window.removeEventListener('akp-ai-summary-ready', refreshDashboardMatches))

function refreshDashboardMatches() {
  const currentMatchId = selectedMatchId.value
  dashboardMatches.value = loadDashboardMatches()
  notationReport.value =
    dashboardMatches.value.find((matchReport) => matchReport.match.id === currentMatchId) ??
    dashboardMatches.value[0] ??
    getStoredNotationReport()
  selectedMatchId.value = notationReport.value?.match?.id ?? ''
}

const shotFrequencyOptions = computed(() => ({
  backgroundColor: 'transparent',
  color: [primaryColor, secondarySeriesColor],
  grid: {
    top: 28,
    right: 18,
    bottom: 32,
    left: 36,
    containLabel: true,
  },
  legend: {
    top: 0,
    right: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
      color: chartTextColor,
      fontFamily: 'Inter',
      fontSize: 12,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(255,255,255,0.04)',
      },
    },
    backgroundColor: cardColor,
    borderColor,
    textStyle: {
      color: foregroundColor,
      fontFamily: 'Inter',
    },
  },
  xAxis: {
    type: 'category',
    data: shotData.value.map((shot) => shot.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: chartTextColor,
      fontFamily: 'Inter',
      fontSize: 12,
    },
  },
  yAxis: {
    type: 'value',
    splitNumber: 4,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: chartTextColor,
      fontFamily: 'Inter',
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: borderColor,
        type: 'dashed',
      },
    },
  },
  series: [
    {
      name: shortPlayerName(dashboardSummary.value.playerA),
      type: 'bar',
      data: shotData.value.map((shot) => shot.playerA),
      barMaxWidth: 28,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        focus: 'series',
      },
    },
    {
      name: shortPlayerName(dashboardSummary.value.playerB),
      type: 'bar',
      data: shotData.value.map((shot) => shot.playerB),
      barMaxWidth: 28,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        focus: 'series',
      },
    },
  ],
}))

const performanceRadarOptions = computed(() => ({
  backgroundColor: 'transparent',
  color: [primaryColor, secondarySeriesColor],
  legend: {
    bottom: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
      color: chartTextColor,
      fontFamily: 'Inter',
      fontSize: 12,
    },
  },
  tooltip: {
    show: false,
  },
  radar: {
    center: ['50%', '46%'],
    radius: '68%',
    splitNumber: 4,
    indicator: radarData.value.map((item) => ({
      name: item.subject,
      max: 100,
    })),
    axisName: {
      color: chartTextColor,
      fontFamily: 'Inter',
      fontSize: 11,
    },
    axisLine: {
      lineStyle: {
        color: borderColor,
      },
    },
    splitLine: {
      lineStyle: {
        color: borderColor,
      },
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(255,255,255,0.015)', 'rgba(255,255,255,0.035)'],
      },
    },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          name: shortPlayerName(dashboardSummary.value.playerA),
          value: radarData.value.map((item) => item.playerA),
          areaStyle: {
            color: 'rgba(223, 255, 0, 0.28)',
          },
          lineStyle: {
            width: 2,
          },
          symbol: 'circle',
          symbolSize: 4,
        },
        {
          name: shortPlayerName(dashboardSummary.value.playerB),
          value: radarData.value.map((item) => item.playerB),
          areaStyle: {
            color: 'rgba(113, 113, 122, 0.22)',
          },
          lineStyle: {
            width: 2,
          },
          symbol: 'circle',
          symbolSize: 4,
        },
      ],
    },
  ],
}))

function getRadarPointStyle(index) {
  const points = [
    { left: '50%', top: '13%' },
    { left: '82%', top: '29%' },
    { left: '82%', top: '62%' },
    { left: '50%', top: '78%' },
    { left: '18%', top: '62%' },
    { left: '18%', top: '29%' },
  ]

  return points[index] ?? points[0]
}

function getRadarTooltipStyle(metric) {
  const index = radarData.value.findIndex((item) => item.subject === metric.subject)
  const points = [
    { left: '50%', top: '10%', transform: 'translateX(-50%)' },
    { right: '12px', top: '24%', transform: 'none' },
    { right: '12px', top: '56%', transform: 'none' },
    { left: '50%', bottom: '8px', transform: 'translateX(-50%)' },
    { left: '12px', top: '56%', transform: 'none' },
    { left: '12px', top: '24%', transform: 'none' },
  ]

  return points[index] ?? points[0]
}

function buildDashboardSummary(report) {
  const playerA = report?.match?.playerA ?? 'No recorded match'
  const playerB = report?.match?.playerB ?? 'No recorded match'
  const winnerCounts = countRallyWinners(report)
  const status = report?.match?.status ?? 'Static Dashboard Report'
  const hasNotation = hasLiveData(report)

  return {
    playerA,
    playerB,
    subtitle: hasNotation
      ? `${statusLabel(status)} - ${report.match.totalShots ?? 0} recorded actions`
      : 'Record a Live Match to populate analytics.',
    playerALabel: winnerCounts.A > winnerCounts.B ? 'Leader' : 'Player A',
    playerBLabel: winnerCounts.B > winnerCounts.A ? 'Leader' : 'Player B',
  }
}

function buildStats(report) {
  if (!hasLiveData(report)) {
    return [
      { icon: 'monitor_heart', label: 'Total Rallies', value: '0', sub: 'No recorded match' },
      { icon: 'gps_fixed', label: 'Longest Rally', value: '0', sub: 'No recorded match' },
      { icon: 'trending_up', label: 'Attack Ratio (A)', value: '0%', sub: 'No recorded match' },
      { icon: 'timeline', label: 'Total Actions', value: '0', sub: 'No recorded match' },
    ]
  }

  const notation = report.notation ?? []
  const rallyOutcomes = report.rallyOutcomes ?? []
  const rallyCount = Math.max(
    report.match?.totalRallies ?? rallyOutcomes.length,
    rallyOutcomes.length,
  )
  const avgShots = rallyCount > 0 ? notation.length / rallyCount : 0
  const longestRally = Math.max(0, ...rallyOutcomes.map((outcome) => outcome.shots ?? 0))
  const playerAShots = notation.filter((action) => action.player === 'A')
  const playerAAttacks = playerAShots.filter(
    (action) => shotCategory(action.shot) === 'attack',
  ).length
  const attackRatio =
    playerAShots.length > 0 ? Math.round((playerAAttacks / playerAShots.length) * 100) : 0

  return [
    {
      icon: 'monitor_heart',
      label: 'Total Rallies',
      value: String(rallyCount),
      sub: `Avg ${avgShots.toFixed(1)} shots/rally`,
    },
    {
      icon: 'gps_fixed',
      label: 'Longest Rally',
      value: String(longestRally),
      sub: 'Shots from live notation',
    },
    {
      icon: 'trending_up',
      label: 'Attack Ratio (A)',
      value: `${attackRatio}%`,
      sub: `${playerAAttacks} attack shots recorded`,
    },
    {
      icon: 'timeline',
      label: 'Total Actions',
      value: String(notation.length),
      sub: 'Recorded live notation',
    },
  ]
}

function buildShotData(report) {
  const shotNames = ['Smash', 'Clear', 'Drop', 'Net Shot', 'Drive', 'Lift', 'Serve']
  return shotNames.map((name) => ({
    name,
    playerA: countShots(report?.notation, 'A', name),
    playerB: countShots(report?.notation, 'B', name),
  }))
}

function buildRadarData(report) {
  const notation = report?.notation ?? []
  const rallyOutcomes = report?.rallyOutcomes ?? []
  const longestRally = Math.max(1, ...rallyOutcomes.map((outcome) => outcome.shots ?? 0))

  return [
    {
      subject: 'Attack',
      playerA: percentageByCategory(notation, 'A', 'attack'),
      playerB: percentageByCategory(notation, 'B', 'attack'),
    },
    {
      subject: 'Defence',
      playerA: percentageByCategory(notation, 'A', 'defense'),
      playerB: percentageByCategory(notation, 'B', 'defense'),
    },
    {
      subject: 'Net Play',
      playerA: percentageByShot(notation, 'A', 'Net Shot'),
      playerB: percentageByShot(notation, 'B', 'Net Shot'),
    },
    {
      subject: 'Speed',
      playerA: playerPaceScore(notation, 'A', longestRally),
      playerB: playerPaceScore(notation, 'B', longestRally),
    },
    {
      subject: 'Stamina',
      playerA: playerVolumeScore(notation, 'A'),
      playerB: playerVolumeScore(notation, 'B'),
    },
  ]
}

function buildInsights(report) {
  if (!hasLiveData(report)) return []

  const summary = buildDashboardSummary(report)
  const playerAShots = report.notation.filter((action) => action.player === 'A').length
  const playerBShots = report.notation.filter((action) => action.player === 'B').length
  const playerAAttack = percentageByCategory(report.notation, 'A', 'attack')
  const playerBDefense = percentageByCategory(report.notation, 'B', 'defense')

  return [
    {
      icon: 'bolt',
      player: summary.playerA,
      title: `${shortPlayerName(summary.playerA)} Shot Profile`,
      description: `${playerAShots} actions recorded with ${playerAAttack}% attack usage from live notation.`,
    },
    {
      icon: 'shield',
      player: summary.playerB,
      title: `${shortPlayerName(summary.playerB)} Response Profile`,
      description: `${playerBShots} actions recorded with ${playerBDefense}% defensive usage from live notation.`,
    },
  ]
}

function exportReport() {
  const csv = buildCsvReport(notationReport.value)

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `akp-shuttletrace-match-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function selectDashboardMatch() {
  notationReport.value =
    dashboardMatches.value.find((matchReport) => matchReport.match.id === selectedMatchId.value) ??
    null
  hoveredRadarMetric.value = null
}

function loadDashboardMatches() {
  if (typeof window === 'undefined') return []

  const history = normalizeReports(
    parseStoredJson(
      window.localStorage.getItem(historyStorageKey) ??
        window.localStorage.getItem(legacyHistoryStorageKey),
      [],
    ),
  )
  const latest = getStoredNotationReport()
  const reportsById = new Map()

  history.forEach((report) => {
    reportsById.set(report.match.id, report)
  })

  if (latest?.match) {
    const normalizedLatest = normalizeReports([latest])[0]
    reportsById.set(normalizedLatest.match.id, normalizedLatest)
  }

  return [...reportsById.values()].sort(
    (a, b) => new Date(b.match.savedAt ?? 0) - new Date(a.match.savedAt ?? 0),
  )
}

function normalizeReports(reports) {
  return reports
    .filter((report) => report?.match)
    .map((report) => ({
      ...report,
      match: {
        ...report.match,
        id: report.match.id ?? `legacy-${report.match.savedAt ?? report.match.playerA}`,
      },
      notation: report.notation ?? [],
      rallyOutcomes: report.rallyOutcomes ?? [],
    }))
}

function parseStoredJson(rawValue, fallback) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function getStoredNotationReport() {
  if (typeof window === 'undefined') return null

  const rawReport =
    window.localStorage.getItem(notationStorageKey) ??
    window.localStorage.getItem(legacyNotationStorageKey)
  return parseStoredJson(rawReport, null)
}

function matchOptionLabel(matchReport) {
  const date = matchReport.match.savedAt
    ? formatMatchDate(matchReport.match.savedAt)
    : 'Unknown date'
  return `${date} - ${matchReport.match.playerA} vs ${matchReport.match.playerB}`
}

function formatMatchDate(value) {
  return new Intl.DateTimeFormat('en-MY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function hasLiveData(report) {
  return Boolean(report?.match && Array.isArray(report.notation) && report.notation.length > 0)
}

function statusLabel(status) {
  const labels = {
    ended: 'Match Ended',
    live: 'Live Match',
    'coin-flip': 'Coin Flip Complete',
  }

  return labels[status] ?? status
}

function shortPlayerName(name) {
  return name?.split(' ')[0] ?? 'Player'
}

function shotCategory(shot) {
  const categories = {
    Smash: 'attack',
    Drive: 'attack',
    Clear: 'neutral',
    Drop: 'neutral',
    Lift: 'defense',
    'Net Shot': 'neutral',
    Serve: 'neutral',
  }

  return categories[shot] ?? 'neutral'
}

function countShots(notation = [], player, shot) {
  return notation.filter((action) => action.player === player && action.shot === shot).length
}

function playerActions(notation = [], player) {
  return notation.filter((action) => action.player === player)
}

function percentageByCategory(notation, player, category) {
  const actions = playerActions(notation, player)
  if (actions.length === 0) return 0

  const matching = actions.filter((action) => shotCategory(action.shot) === category).length
  return Math.round((matching / actions.length) * 100)
}

function percentageByShot(notation, player, shot) {
  const actions = playerActions(notation, player)
  if (actions.length === 0) return 0

  return Math.round((countShots(notation, player, shot) / actions.length) * 100)
}

function playerPaceScore(notation, player, longestRally) {
  const rallyNumbers = new Set(playerActions(notation, player).map((action) => action.rallyNumber))
  if (rallyNumbers.size === 0) return 0

  const average = playerActions(notation, player).length / rallyNumbers.size
  return clampScore(Math.round((average / longestRally) * 100))
}

function playerVolumeScore(notation, player) {
  const totalShots = notation.length
  if (totalShots === 0) return 0

  return clampScore(Math.round((playerActions(notation, player).length / totalShots) * 100))
}

function countRallyWinners(report) {
  const counts = { A: 0, B: 0 }

  ;(report?.rallyOutcomes ?? []).forEach((outcome) => {
    if (outcome.winner === 'A') counts.A += 1
    if (outcome.winner === 'B') counts.B += 1
    if (outcome.winner) return
    if (outcome.outcome === `Winner: ${report?.match?.playerA}`) counts.A += 1
    if (outcome.outcome === `Winner: ${report?.match?.playerB}`) counts.B += 1
  })

  return counts
}

function clampScore(value) {
  return Math.max(0, Math.min(value, 100))
}

function buildCsvReport(notationReport) {
  const rows = [
    ['AKP ShuttleTrace Match Report'],
    ['Exported At', new Date().toISOString()],
    [],
    ['Match Summary'],
    ['Player A', notationReport?.match?.playerA ?? 'Viktor Axelsen'],
    ['Player B', notationReport?.match?.playerB ?? 'Lee Zii Jia'],
    ['Status', notationReport?.match?.status ?? 'Static Dashboard Report'],
    ['Total Rallies', notationReport?.match?.totalRallies ?? 114],
    ['Total Shots', notationReport?.match?.totalShots ?? totalStaticShots()],
    ['Current Rally Timer', notationReport?.match?.currentRallyDurationLabel ?? '00:00'],
    ['First Server', notationReport?.match?.firstServer ?? 'Not recorded'],
    ['First Server Code', notationReport?.match?.firstServerCode ?? ''],
    ['Active Player', notationReport?.match?.activePlayer ?? 'Not recorded'],
    ['Active Player Code', notationReport?.match?.activePlayerCode ?? ''],
    [],
    ['Recorded Notation'],
    ['Sequence', 'Rally Number', 'Player Code', 'Player Name', 'Shot Type', 'Timestamp'],
  ]

  const notationRows = notationReport?.notation ?? []

  if (notationRows.length === 0) {
    rows.push(['No recorded notation found. Record a Live Match first to export notation data.'])
  } else {
    notationRows.forEach((action, index) => {
      rows.push([
        action.sequence ?? index + 1,
        action.rallyNumber,
        action.player,
        action.playerName,
        action.shot,
        action.timestamp,
      ])
    })
  }

  rows.push(
    [],
    ['Rally Outcomes'],
    [
      'Rally Number',
      'Outcome',
      'Shots In Rally',
      'Duration',
      'Duration (ms)',
      'Started At',
      'Ended At',
    ],
  )

  const outcomeRows = notationReport?.rallyOutcomes ?? []
  if (outcomeRows.length === 0) {
    rows.push(['No rally outcomes recorded.'])
  } else {
    outcomeRows.forEach((outcome) => {
      rows.push([
        outcome.rallyNumber,
        outcome.outcome,
        outcome.shots,
        outcome.durationLabel,
        outcome.durationMs,
        outcome.startedAt,
        outcome.endedAt,
      ])
    })
  }

  rows.push(
    [],
    ['Shot Frequency Dashboard Data'],
    ['Shot Type', dashboardSummary.value.playerA, dashboardSummary.value.playerB],
    ...shotData.value.map((shot) => [shot.name, shot.playerA, shot.playerB]),
    [],
    ['Performance Radar Dashboard Data'],
    ['Metric', dashboardSummary.value.playerA, dashboardSummary.value.playerB],
    ...radarData.value.map((metric) => [metric.subject, metric.playerA, metric.playerB]),
    [],
    ['Insights'],
    ['Player', 'Title', 'Description'],
    ...insights.value.map((insight) => [insight.player, insight.title, insight.description]),
  )

  return rows.map(toCsvRow).join('\r\n')
}

function totalStaticShots() {
  return 0
}

function toCsvRow(row) {
  return row.map(toCsvCell).join(',')
}

function toCsvCell(value) {
  const stringValue = value === null || value === undefined ? '' : String(value)
  return `"${stringValue.replaceAll('"', '""')}"`
}
</script>
