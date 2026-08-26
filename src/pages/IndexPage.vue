<template>
  <q-page :class="['dashboard-page', isTrainingReport && 'dashboard-page--training']">
    <div class="content-wrap">
      <header class="dashboard-header">
        <div>
          <h1>{{ dashboardTitle }}</h1>
          <p>{{ dashboardSummary.subtitle }}</p>
        </div>

        <div class="match-card">
          <label class="dashboard-match-select">
            <span>{{ isTrainingReport ? 'Session' : 'Match' }}</span>
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
          <div v-if="isTrainingReport" class="training-dashboard-hero">
            <div>
              <span>Drill</span>
              <strong>{{ notationReport.training?.shot ?? dashboardSummary.playerB }}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{{ notationReport.training?.accuracy ?? 0 }}%</strong>
            </div>
          </div>
          <div v-else class="matchup">
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
        <article
          v-if="settings.analytics.shotFrequency"
          :class="['panel', isTrainingReport ? 'panel--wide' : 'panel--wide']"
        >
          <div class="panel-head">
            <h2>
              {{
                isTrainingReport ? 'Training Result Distribution' : 'Shot Frequency & Distribution'
              }}
            </h2>
            <p>
              {{
                isTrainingReport
                  ? 'Successful and unsuccessful repetitions from this drill.'
                  : 'Comparison of shot types used during the match.'
              }}
            </p>
          </div>
          <VChart class="chart chart--bar" :option="shotFrequencyOptions" />
        </article>

        <article v-if="settings.analytics.radar && !isTrainingReport" class="panel">
          <div class="panel-head">
            <h2>Performance Radar</h2>
            <p>Multi-dimensional analysis.</p>
            <div v-if="selectedRadarMetric" class="radar-selected-summary">
              <span>{{ selectedRadarMetric.subject }}</span>
              <div>
                <strong>{{ shortPlayerName(dashboardSummary.playerA) }}</strong>
                <em>{{ selectedRadarMetric.playerA }}</em>
              </div>
              <div>
                <strong>{{ shortPlayerName(dashboardSummary.playerB) }}</strong>
                <em>{{ selectedRadarMetric.playerB }}</em>
              </div>
            </div>
          </div>
          <div class="radar-chart-shell">
            <div class="radar-stage">
              <VChart class="chart chart--radar" :option="performanceRadarOptions" />
              <button
                v-for="(metric, index) in radarData"
                :key="metric.subject"
                class="radar-label-hit"
                type="button"
                :style="getRadarLabelStyle(index)"
                :aria-label="`${metric.subject} values`"
                @click="selectRadarMetric(metric)"
              >
                {{ metric.subject }}
              </button>
            </div>
          </div>
        </article>

        <article v-if="isTrainingReport" class="panel training-dashboard-panel">
          <div class="panel-head">
            <h2>Drill Breakdown</h2>
            <p>Session progress and coach-facing training outcome.</p>
          </div>
          <div class="training-dashboard-breakdown">
            <div>
              <span>Target</span>
              <strong>{{ notationReport.training?.targetReps ?? 0 }}</strong>
              <small>planned reps</small>
            </div>
            <div>
              <span>Completed</span>
              <strong>{{ notationReport.training?.completedReps ?? 0 }}</strong>
              <small>recorded reps</small>
            </div>
            <div>
              <span>Successful</span>
              <strong>{{ notationReport.training?.successfulReps ?? 0 }}</strong>
              <small>clean reps</small>
            </div>
            <div>
              <span>Unsuccessful</span>
              <strong>{{ notationReport.training?.unsuccessfulReps ?? 0 }}</strong>
              <small>missed reps</small>
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
import { isLoggedIn, scopedStorageKey } from '@/data/auth'
import { api } from '../boot/axios'

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
const notationStorageKey = scopedStorageKey('akp-shuttletrace:last-match-notation')
const legacyNotationStorageKey = `court${'sense'}:last-match-notation`
const historyStorageKey = scopedStorageKey('akp-shuttletrace:match-history')
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const hoveredRadarMetric = ref(null)
const notationReport = ref(null)
const dashboardMatches = ref([])
const selectedMatchId = ref('')
const settings = loadSettings()

const isTrainingReport = computed(() => reportIsTraining(notationReport.value))
const dashboardTitle = computed(() =>
  isTrainingReport.value ? 'Training Analytics' : 'Post-Match Analytics',
)
const dashboardSummary = computed(() => buildDashboardSummary(notationReport.value))
const stats = computed(() => buildStats(notationReport.value))
const shotData = computed(() => buildShotData(notationReport.value))
const radarData = computed(() => buildRadarData(notationReport.value))
const insights = computed(() => buildInsights(notationReport.value))
const selectedRadarMetric = computed(() => hoveredRadarMetric.value ?? radarData.value[0] ?? null)

onMounted(() => {
  void refreshDashboardMatches()
  window.addEventListener('akp-ai-summary-ready', refreshDashboardMatches)
})

onUnmounted(() => window.removeEventListener('akp-ai-summary-ready', refreshDashboardMatches))

async function refreshDashboardMatches() {
  const currentMatchId = selectedMatchId.value
  dashboardMatches.value = await loadDashboardMatches()
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
  animation: false,
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
    center: ['50%', '48%'],
    radius: '50%',
    splitNumber: 4,
    indicator: radarData.value.map((item) => ({
      name: item.subject,
      max: 100,
    })),
    axisName: {
      color: 'transparent',
      fontFamily: 'Inter',
      fontSize: 1,
      fontWeight: 700,
      padding: [0, 0],
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

function getRadarLabelStyle(index) {
  const point = radarPoint(index, 40)
  return {
    left: `${point.left}%`,
    top: `${point.top}%`,
  }
}

function radarPoint(index, radius = 28) {
  const metricCount = Math.max(radarData.value.length, 1)
  const angle = -Math.PI / 2 + (index / metricCount) * Math.PI * 2

  return {
    left: Math.min(Math.max(50 + Math.cos(angle) * radius, 15), 85),
    top: Math.min(Math.max(48 + Math.sin(angle) * radius, 9), 86),
  }
}

function buildDashboardSummary(report) {
  if (reportIsTraining(report)) {
    const training = report.training ?? {}
    const shot = training.shot ?? report.match?.playerB ?? 'Training Drill'
    const completed = training.completedReps ?? report.match?.totalShots ?? 0
    const target = training.targetReps ?? completed
    const accuracyValue = training.accuracy ?? 0

    return {
      playerA: 'Successful',
      playerB: 'Unsuccessful',
      subtitle: `${shot} training - ${completed}/${target} reps completed, ${accuracyValue}% accuracy`,
      playerALabel: 'Clean reps',
      playerBLabel: 'Missed reps',
    }
  }

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
  if (reportIsTraining(report)) {
    const training = report.training ?? {}
    const target = training.targetReps ?? report.match?.totalShots ?? 0
    const completed = training.completedReps ?? report.match?.totalShots ?? 0
    const successful = training.successfulReps ?? report.match?.scoreA ?? 0
    const unsuccessful = training.unsuccessfulReps ?? report.match?.scoreB ?? 0
    const accuracyValue =
      training.accuracy ?? (completed ? Math.round((successful / completed) * 100) : 0)
    const completion = target ? Math.round((completed / target) * 100) : 0

    return [
      {
        icon: 'fitness_center',
        label: 'Drill',
        value: training.shot ?? report.match?.playerB ?? '-',
        sub: `${target} target repetitions`,
      },
      {
        icon: 'task_alt',
        label: 'Accuracy',
        value: `${accuracyValue}%`,
        sub: `${successful} successful reps`,
      },
      {
        icon: 'timeline',
        label: 'Completed',
        value: String(completed),
        sub: `${completion}% of target`,
      },
      {
        icon: 'cancel',
        label: 'Unsuccessful',
        value: String(unsuccessful),
        sub: 'Needs coach review',
      },
    ]
  }

  if (!hasLiveData(report)) {
    return [
      { icon: 'monitor_heart', label: 'Total Rounds', value: '0', sub: 'No recorded match' },
      { icon: 'gps_fixed', label: 'Longest Rally', value: '0', sub: 'No recorded match' },
      { icon: 'trending_up', label: 'Attack Ratio (A)', value: '0%', sub: 'No recorded match' },
      { icon: 'timeline', label: 'Total Actions', value: '0', sub: 'No recorded match' },
    ]
  }

  const notation = report.notation ?? []
  const rallyOutcomes = report.roundOutcomes ?? report.rallyOutcomes ?? []
  const roundCount = Math.max(
    report.match?.totalRounds ?? report.match?.totalRallies ?? rallyOutcomes.length,
    rallyOutcomes.length,
  )
  const avgShots = roundCount > 0 ? notation.length / roundCount : 0
  const longestRally = Math.max(
    0,
    ...rallyOutcomes.map((outcome) => outcome.rallies ?? outcome.shots ?? 0),
  )
  const playerAShots = notation.filter((action) => action.player === 'A')
  const playerAAttacks = playerAShots.filter(
    (action) => shotCategory(action.shot) === 'attack',
  ).length
  const attackRatio =
    playerAShots.length > 0 ? Math.round((playerAAttacks / playerAShots.length) * 100) : 0

  return [
    {
      icon: 'monitor_heart',
      label: 'Total Rounds',
      value: String(roundCount),
      sub: `Avg ${avgShots.toFixed(1)} rallies/round`,
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
  if (reportIsTraining(report)) {
    const training = report.training ?? {}
    return [
      {
        name: training.shot ?? report.match?.playerB ?? 'Training',
        playerA: training.successfulReps ?? report.match?.scoreA ?? 0,
        playerB: training.unsuccessfulReps ?? report.match?.scoreB ?? 0,
      },
    ]
  }

  const shotNames = ['Smash', 'Drop', 'Netting', 'Drive', 'Lift', 'Serve']
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
      playerA: percentageByShot(notation, 'A', 'Netting'),
      playerB: percentageByShot(notation, 'B', 'Netting'),
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
  if (reportIsTraining(report)) {
    const training = report.training ?? {}
    const accuracyValue = training.accuracy ?? 0
    const completed = training.completedReps ?? 0
    const successful = training.successfulReps ?? 0
    const unsuccessful = training.unsuccessfulReps ?? 0

    return [
      {
        icon: 'track_changes',
        player: training.shot ?? 'Training',
        title: 'Drill Outcome',
        description: `${successful}/${completed} reps were successful, with ${accuracyValue}% accuracy for this session.`,
      },
      {
        icon: unsuccessful > successful ? 'priority_high' : 'verified',
        player: 'Coach Note',
        title: unsuccessful > successful ? 'Review Technique' : 'Good Control',
        description:
          unsuccessful > successful
            ? `${unsuccessful} unsuccessful reps recorded. Consider slowing the next set and focusing on contact quality.`
            : `${successful} successful reps recorded. This drill is trending in a controlled direction.`,
      },
    ]
  }

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

function selectRadarMetric(metric) {
  hoveredRadarMetric.value = metric
}

async function loadDashboardMatches() {
  if (typeof window === 'undefined') return []

  const history = loadLocalDashboardMatches()
  const remoteHistory = await loadRemoteDashboardMatches()
  const latest = getStoredNotationReport()
  const reportsById = new Map()

  remoteHistory.forEach((report) => {
    reportsById.set(report.match.id, report)
  })

  history.forEach((report) => {
    if (!reportsById.has(report.match.id)) reportsById.set(report.match.id, report)
  })

  if (latest?.match) {
    const normalizedLatest = normalizeReports([latest])[0]
    if (!reportsById.has(normalizedLatest.match.id))
      reportsById.set(normalizedLatest.match.id, normalizedLatest)
  }

  const reports = [...reportsById.values()].sort(
    (a, b) => new Date(b.match.savedAt ?? 0) - new Date(a.match.savedAt ?? 0),
  )
  persistDashboardCache(reports)
  return reports
}

function loadLocalDashboardMatches() {
  return normalizeReports(
    parseStoredJson(
      window.localStorage.getItem(historyStorageKey) ??
        (isLoggedIn() ? null : window.localStorage.getItem(legacyHistoryStorageKey)),
      [],
    ),
  )
}

async function loadRemoteDashboardMatches() {
  try {
    const [matchesResponse, trainingResponse] = await Promise.all([
      api.get('/matches'),
      api.get('/training'),
    ])

    return normalizeReports([
      ...normalizeRemoteMatches(matchesResponse.data),
      ...normalizeRemoteTraining(trainingResponse.data),
    ])
  } catch {
    return []
  }
}

function normalizeRemoteMatches(matches) {
  if (!Array.isArray(matches)) return []

  return matches.map((match) => ({
    match: {
      id: `db-match-${match.id}`,
      databaseId: match.id,
      status: match.status ?? 'ended',
      playerA: match.player1?.name ?? 'Player A',
      playerB: match.player2?.name ?? 'Player B',
      playerAId: match.player1Id,
      playerBId: match.player2Id,
      totalRounds: match.totalRallies ?? match.rallies?.length ?? 0,
      totalRallies: match.totalShots ?? match.shotRecords?.length ?? 0,
      totalShots: match.totalShots ?? match.shotRecords?.length ?? 0,
      scoreA: match.player1Score ?? 0,
      scoreB: match.player2Score ?? 0,
      gamesA: match.sets?.filter((set) => set.winnerId === match.player1Id).length ?? 0,
      gamesB: match.sets?.filter((set) => set.winnerId === match.player2Id).length ?? 0,
      firstServer: '-',
      firstServerCode: '-',
      scoringFormat: match.matchFormat ?? '-',
      savedAt: match.endedAt ?? match.date,
    },
    notation: (match.rallies ?? []).flatMap((rally) =>
      (rally.shotRecords ?? []).map((shot) => ({
        id: `db-shot-${shot.id}`,
        roundNumber: rally.rallyNumber,
        rallyNumber: rally.rallyNumber,
        player: shot.playerId === match.player1Id ? 'A' : 'B',
        playerName: shot.player?.name ?? '-',
        shot: shot.shotType?.name ?? shot.shot,
        timestamp: shot.timestamp,
        result: shot.result,
      })),
    ),
    rallyOutcomes: (match.rallies ?? []).map((rally) => ({
      roundNumber: rally.rallyNumber,
      rallyNumber: rally.rallyNumber,
      outcome: rally.outcome,
      shots: rally.shots,
      durationMs: rally.durationMs,
      durationLabel: formatDashboardDuration(rally.durationMs ?? 0),
      endingType: rally.outcomeType,
      endingReason: rally.outcomeReason,
      pointWinnerName: rally.winner?.name ?? '-',
    })),
    setDurations: match.sets ?? [],
    database: { status: 'saved', id: match.id },
  }))
}

function normalizeRemoteTraining(sessions) {
  if (!Array.isArray(sessions)) return []

  return sessions.map((session) => ({
    match: {
      id: `db-training-${session.id}`,
      databaseId: session.id,
      status: 'training',
      playerA: session.player?.name ?? 'Training Player',
      playerB: session.shotType?.name ?? session.shot,
      firstServer: session.player?.name ?? 'Training Player',
      firstServerCode: 'Training',
      totalRallies: session.completedReps ?? 0,
      totalShots: session.completedReps ?? 0,
      scoreA: session.successfulReps ?? 0,
      scoreB: session.unsuccessfulReps ?? 0,
      gamesA: session.successfulReps ?? 0,
      gamesB: session.unsuccessfulReps ?? 0,
      scoringFormat: `${session.targetReps} repetitions, ${session.accuracy}% accuracy`,
      savedAt: session.savedAt,
    },
    notation: (session.reps ?? []).map((rep) => ({
      id: `db-rep-${rep.id}`,
      rallyNumber: rep.repNumber,
      player: 'Training',
      playerName: session.player?.name ?? 'Training Player',
      shot: session.shotType?.name ?? session.shot,
      timestamp: rep.recordedAt,
      result: rep.successful ? 'Successful' : 'Unsuccessful',
    })),
    rallyOutcomes: [
      {
        rallyNumber: 1,
        outcome: `${session.shotType?.name ?? session.shot} drill: ${session.successfulReps} successful, ${session.unsuccessfulReps} unsuccessful`,
        shots: session.completedReps,
        durationMs: session.durationMs,
        durationLabel: formatDashboardDuration(session.durationMs ?? 0),
        endingType: 'training',
        pointWinnerName: `${session.accuracy}% accuracy`,
      },
    ],
    training: {
      playerId: session.playerId,
      playerName: session.player?.name ?? 'Training Player',
      shot: session.shotType?.name ?? session.shot,
      targetReps: session.targetReps,
      completedReps: session.completedReps,
      successfulReps: session.successfulReps,
      unsuccessfulReps: session.unsuccessfulReps,
      accuracy: session.accuracy,
      records: session.reps ?? [],
    },
    database: { status: 'saved', id: session.id },
  }))
}

function persistDashboardCache(reports) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(historyStorageKey, JSON.stringify(reports))
  if (reports[0]) window.localStorage.setItem(notationStorageKey, JSON.stringify(reports[0]))
}

function formatDashboardDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
    (isLoggedIn() ? null : window.localStorage.getItem(legacyNotationStorageKey))
  return parseStoredJson(rawReport, null)
}

function matchOptionLabel(matchReport) {
  const date = matchReport.match.savedAt
    ? formatMatchDate(matchReport.match.savedAt)
    : 'Unknown date'
  if (reportIsTraining(matchReport)) {
    const shot = matchReport.training?.shot ?? matchReport.match.playerB
    const playerName = matchReport.training?.playerName ?? matchReport.match.playerA
    const accuracyValue = matchReport.training?.accuracy ?? 0
    return `${date} - ${playerName}: ${shot} (${accuracyValue}%)`
  }

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

function reportIsTraining(report) {
  return report?.match?.status === 'training' || Boolean(report?.training)
}

function statusLabel(status) {
  const labels = {
    ended: 'Match Ended',
    live: 'Live Match',
    'coin-flip': 'Coin Flip Complete',
    training: 'Training',
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
    Drop: 'neutral',
    Lift: 'defense',
    Netting: 'neutral',
    Serve: 'neutral',
  }

  return categories[shot] ?? 'neutral'
}

function isSupportedShot(shot) {
  return ['Smash', 'Drive', 'Drop', 'Lift', 'Netting', 'Serve'].includes(shot)
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
    [
      'Total Rounds',
      notationReport?.match?.totalRounds ?? notationReport?.match?.totalRallies ?? 114,
    ],
    [
      'Total Rallies',
      notationReport?.match?.totalShots ??
        notationReport?.match?.totalRallies ??
        totalStaticShots(),
    ],
    ['Total Shots', notationReport?.match?.totalShots ?? totalStaticShots()],
    [
      'Current Round Timer',
      notationReport?.match?.currentRoundDurationLabel ??
        notationReport?.match?.currentRallyDurationLabel ??
        '00:00',
    ],
    ['First Server', notationReport?.match?.firstServer ?? 'Not recorded'],
    ['First Server Code', notationReport?.match?.firstServerCode ?? ''],
    ['Active Player', notationReport?.match?.activePlayer ?? 'Not recorded'],
    ['Active Player Code', notationReport?.match?.activePlayerCode ?? ''],
    [],
    ['Recorded Notation'],
    ['Sequence', 'Round Number', 'Player Code', 'Player Name', 'Shot Type', 'Timestamp'],
  ]

  const notationRows = (notationReport?.notation ?? []).filter((action) =>
    isSupportedShot(action.shot),
  )

  if (notationRows.length === 0) {
    rows.push(['No recorded notation found. Record a Live Match first to export notation data.'])
  } else {
    notationRows.forEach((action, index) => {
      rows.push([
        action.sequence ?? index + 1,
        action.roundNumber ?? action.rallyNumber,
        action.player,
        action.playerName,
        action.shot,
        action.timestamp,
      ])
    })
  }

  rows.push(
    [],
    ['Round Outcomes'],
    [
      'Round Number',
      'Outcome',
      'Rallies In Round',
      'Duration',
      'Duration (ms)',
      'Started At',
      'Ended At',
    ],
  )

  const outcomeRows = notationReport?.roundOutcomes ?? notationReport?.rallyOutcomes ?? []
  if (outcomeRows.length === 0) {
    rows.push(['No round outcomes recorded.'])
  } else {
    outcomeRows.forEach((outcome) => {
      rows.push([
        outcome.roundNumber ?? outcome.rallyNumber,
        outcome.outcome,
        outcome.rallies ?? outcome.shots,
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
