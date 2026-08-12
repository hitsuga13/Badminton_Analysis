<template>
  <q-page class="dashboard-page">
    <div class="content-wrap">
      <header class="dashboard-header">
        <div>
          <h1>Post-Match Analytics</h1>
          <p>Final Summary - 21-18, 19-21, 21-15</p>
        </div>

        <div class="match-card">
          <button class="secondary-action" type="button">Export Report</button>
          <div class="matchup">
            <div class="player player--right">
              <strong>Viktor Axelsen</strong>
              <span class="winner">Winner</span>
            </div>
            <div class="versus">VS</div>
            <div class="player">
              <strong>Lee Zii Jia</strong>
              <span>Runner Up</span>
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
        <article class="panel panel--wide">
          <div class="panel-head">
            <h2>Shot Frequency & Distribution</h2>
            <p>Comparison of shot types used during the match.</p>
          </div>
          <VChart class="chart chart--bar" :option="shotFrequencyOptions" />
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Performance Radar</h2>
            <p>Multi-dimensional analysis.</p>
          </div>
          <VChart class="chart chart--radar" :option="performanceRadarOptions" />
        </article>
      </section>

      <section class="insight-grid">
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
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
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

use([
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  RadarChart,
  RadarComponent,
  TooltipComponent,
])

const stats = [
  { icon: 'monitor_heart', label: 'Total Rallies', value: '114', sub: 'Avg 12.5 shots/rally' },
  { icon: 'gps_fixed', label: 'Longest Rally', value: '48', sub: 'Shots (Set 2)' },
  { icon: 'trending_up', label: 'Attack Ratio (A)', value: '65%', sub: '+12% from average' },
  { icon: 'shield', label: 'Unforced Errors (A)', value: '12', sub: '-3 from average' },
]

const shotData = [
  { name: 'Smash', axelsen: 35, lee: 28 },
  { name: 'Clear', axelsen: 27, lee: 32 },
  { name: 'Drop', axelsen: 18, lee: 22 },
  { name: 'Net', axelsen: 24, lee: 20 },
  { name: 'Drive', axelsen: 15, lee: 19 },
  { name: 'Lift', axelsen: 22, lee: 25 },
]

const radarData = [
  { subject: 'Attack', axelsen: 85, lee: 70 },
  { subject: 'Defence', axelsen: 75, lee: 82 },
  { subject: 'Net Play', axelsen: 90, lee: 75 },
  { subject: 'Speed', axelsen: 80, lee: 85 },
  { subject: 'Stamina', axelsen: 85, lee: 80 },
  { subject: 'Consistency', axelsen: 78, lee: 88 },
]

const chartTextColor = '#a1a1aa'
const borderColor = '#27272a'
const primaryColor = '#dfff00'
const secondarySeriesColor = '#71717a'
const cardColor = '#141416'
const foregroundColor = '#fafafa'

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
    data: shotData.map((shot) => shot.name),
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
      name: 'Axelsen',
      type: 'bar',
      data: shotData.map((shot) => shot.axelsen),
      barMaxWidth: 28,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        focus: 'series',
      },
    },
    {
      name: 'Lee',
      type: 'bar',
      data: shotData.map((shot) => shot.lee),
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
    backgroundColor: cardColor,
    borderColor,
    textStyle: {
      color: foregroundColor,
      fontFamily: 'Inter',
    },
  },
  radar: {
    center: ['50%', '46%'],
    radius: '68%',
    splitNumber: 4,
    indicator: radarData.map((item) => ({
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
          name: 'Axelsen',
          value: radarData.map((item) => item.axelsen),
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
          name: 'Lee',
          value: radarData.map((item) => item.lee),
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

const insights = [
  {
    icon: 'bolt',
    player: 'Viktor Axelsen',
    title: 'Playing Style: Aggressive',
    description:
      'Player favored offensive shots in 65% of rallies. High success rate on cross-court net shots.',
  },
  {
    icon: 'shield',
    player: 'Lee Zii Jia',
    title: 'Playing Style: Balanced/Counter',
    description:
      'Strong defensive presence with consistent lifts and blocks. Capitalized heavily on unforced errors.',
  },
]
</script>
