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
          <div class="bar-chart" aria-label="Shot frequency chart">
            <div v-for="shot in shotData" :key="shot.name" class="bar-group">
              <div class="bars">
                <span class="bar bar--a" :style="{ height: `${shot.a}%` }" />
                <span class="bar bar--b" :style="{ height: `${shot.b}%` }" />
              </div>
              <small>{{ shot.name }}</small>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Performance Radar</h2>
            <p>Multi-dimensional analysis.</p>
          </div>
          <div class="radar-wrap">
            <div class="radar">
              <span v-for="axis in radarData" :key="axis.subject">{{ axis.subject }}</span>
              <div class="radar-poly radar-poly--a" />
              <div class="radar-poly radar-poly--b" />
            </div>
          </div>
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
const stats = [
  { icon: 'monitor_heart', label: 'Total Rallies', value: '114', sub: 'Avg 12.5 shots/rally' },
  { icon: 'gps_fixed', label: 'Longest Rally', value: '48', sub: 'Shots (Set 2)' },
  { icon: 'trending_up', label: 'Attack Ratio (A)', value: '65%', sub: '+12% from average' },
  { icon: 'shield', label: 'Unforced Errors (A)', value: '12', sub: '-3 from average' },
]

const shotData = [
  { name: 'Smash', a: 88, b: 70 },
  { name: 'Clear', a: 68, b: 80 },
  { name: 'Drop', a: 45, b: 55 },
  { name: 'Net', a: 60, b: 50 },
  { name: 'Drive', a: 38, b: 48 },
  { name: 'Lift', a: 55, b: 63 },
]

const radarData = [
  { subject: 'Attack' },
  { subject: 'Defence' },
  { subject: 'Net Play' },
  { subject: 'Speed' },
  { subject: 'Stamina' },
  { subject: 'Consistency' },
]

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
