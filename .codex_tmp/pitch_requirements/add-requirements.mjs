import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, PresentationFile } from '@oai/artifact-tool'

const source = 'C:\\Users\\wanah\\Downloads\\ShuttleTrace_AI_Pitch_Visual_Draft.pptx'
const output = 'C:\\Users\\wanah\\OneDrive\\Documents\\GitHub\\Badminton_Analysis\\ShuttleTrace_AI_Pitch_Visual_Draft_with_Project_Spec.pptx'
const mediaDir = 'C:\\Users\\wanah\\OneDrive\\Documents\\GitHub\\Badminton_Analysis\\.codex_tmp\\pitch_requirements\\media\\ppt\\media'
const qaDir = 'C:\\Users\\wanah\\OneDrive\\Documents\\GitHub\\Badminton_Analysis\\.codex_tmp\\pitch_requirements\\final-render'

const W = 1280
const H = 720
const C = {
  bg: '#07080B',
  panel: '#15161A',
  panel2: '#202126',
  text: '#FFFFFF',
  muted: '#B8BECF',
  dim: '#7E8494',
  lime: '#D7FF00',
  red: '#FF3B42',
  line: '#34363D',
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()))
}

async function image(name) {
  const filePath = path.join(mediaDir, name)
  const blob = await fs.readFile(filePath)
  const contentType = name.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return { blob, contentType }
}

function bg(slide) {
  slide.background.fill = C.bg
  slide.shapes.add({
    geometry: 'rect',
    position: { left: 0, top: 0, width: W, height: H },
    fill: C.bg,
    line: { style: 'solid', fill: C.bg, width: 0 },
  })
  slide.shapes.add({
    geometry: 'rect',
    position: { left: 0, top: 0, width: 12, height: H },
    fill: C.lime,
    line: { style: 'solid', fill: C.lime, width: 0 },
  })
}

function text(slide, value, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    position,
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  })
  shape.text = value
  shape.text.style = {
    fontSize: style.fontSize ?? 22,
    bold: style.bold ?? false,
    color: style.color ?? C.text,
    fontFace: style.fontFace ?? 'Aptos',
  }
  return shape
}

function label(slide, value, left, top, width = 260) {
  return text(slide, value, { left, top, width, height: 26 }, {
    fontSize: 12,
    bold: true,
    color: C.lime,
    fontFace: 'Aptos',
  })
}

function title(slide, value, top = 72, width = 850) {
  return text(slide, value, { left: 70, top, width, height: 78 }, {
    fontSize: 34,
    bold: true,
    color: C.text,
    fontFace: 'Aptos Display',
  })
}

function subtitle(slide, value, top = 150, width = 760) {
  return text(slide, value, { left: 72, top, width, height: 58 }, {
    fontSize: 18,
    color: C.muted,
  })
}

function card(slide, heading, body, position, accent = C.lime) {
  slide.shapes.add({
    geometry: 'roundRect',
    position,
    fill: C.panel,
    line: { style: 'solid', fill: C.line, width: 1 },
    borderRadius: 10,
  })
  slide.shapes.add({
    geometry: 'rect',
    position: { left: position.left, top: position.top, width: 5, height: position.height },
    fill: accent,
    line: { style: 'solid', fill: accent, width: 0 },
  })
  text(slide, heading, {
    left: position.left + 22,
    top: position.top + 18,
    width: position.width - 44,
    height: 30,
  }, { fontSize: 18, bold: true })
  text(slide, body, {
    left: position.left + 22,
    top: position.top + 56,
    width: position.width - 44,
    height: position.height - 70,
  }, { fontSize: 14, color: C.muted })
}

function pill(slide, value, left, top, width, color = C.panel2) {
  slide.shapes.add({
    geometry: 'roundRect',
    position: { left, top, width, height: 34 },
    fill: color,
    line: { style: 'solid', fill: C.line, width: 1 },
    borderRadius: 8,
  })
  text(slide, value, { left: left + 14, top: top + 8, width: width - 28, height: 18 }, {
    fontSize: 11,
    bold: true,
    color: color === C.lime ? '#000000' : C.text,
  })
}

function footer(slide, number) {
  text(slide, `PROJECT SPECIFICATION  /  ${number}`, { left: 72, top: 666, width: 340, height: 20 }, {
    fontSize: 10,
    color: C.dim,
  })
  text(slide, 'AKP SHUTTLETRACE', { left: 1042, top: 666, width: 170, height: 20 }, {
    fontSize: 10,
    bold: true,
    color: C.dim,
  })
}

function notes(slide, extra = '') {
  slide.speakerNotes.textFrame.setText([
    '[Sources]',
    'Product interface screenshots supplied in the source deck.',
    'Project requirements derived from the AKP ShuttleTrace project specification requested by the user and the current repository architecture.',
    extra,
  ].filter(Boolean))
  slide.speakerNotes.setVisible(true)
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(source))

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'SYSTEM REQUIREMENT ADDENDUM', 72, 58)
  title(slide, 'Project specification for AKP ShuttleTrace', 92, 680)
  subtitle(slide, 'Badminton match and stroke notational analysis system for coaches, analysts and structured training review.', 182, 680)
  pill(slide, 'Frontend: Vue 3 + Quasar', 72, 266, 220, C.lime)
  pill(slide, 'Backend: NestJS + Prisma', 310, 266, 220)
  pill(slide, 'Database: PostgreSQL', 548, 266, 190)
  card(slide, 'Purpose', 'Record live matches, capture stroke notation, store player profiles, analyze performance and generate post-match reports.', { left: 72, top: 344, width: 310, height: 150 })
  card(slide, 'Primary user', 'Badminton coach or analyst who needs fast notation during match play and clear review after the session.', { left: 404, top: 344, width: 310, height: 150 })
  card(slide, 'Deployment target', 'Frontend on GitHub Pages, backend on Railway and PostgreSQL connected through DATABASE_URL.', { left: 736, top: 344, width: 310, height: 150 })
  const img = await image('image.png')
  slide.images.add({
    ...img,
    alt: 'AKP ShuttleTrace post-match analytics dashboard',
    fit: 'cover',
    position: { left: 810, top: 70, width: 390, height: 220 },
    geometry: 'roundRect',
    borderRadius: 10,
  })
  footer(slide, '01')
  notes(slide, 'Slide added as a new requirement addendum; original pitch content is preserved.')
}

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'FUNCTIONAL REQUIREMENTS', 72, 58)
  title(slide, 'System scope covers the full coaching workflow', 92, 760)
  subtitle(slide, 'The app must support everything from player setup to live notation, training logging, history review and export.', 172, 820)
  const cards = [
    ['Authenticate', 'Register, login, current user session and logout.'],
    ['Manage players', 'Create, view, edit and delete player profiles.'],
    ['Record matches', 'Select Player A/B, track sets, rallies, score and shot sequence.'],
    ['Track strokes', 'Store shot type, rally context, player ownership and performance category.'],
    ['Analyze dashboard', 'Show match summary, shot frequency, attack ratio, longest rally and radar-style comparison.'],
    ['Training mode', 'Set drill target, record repetitions and review training history.'],
    ['Export reports', 'Generate match reports and export CSV for coach documentation.'],
    ['Settings/backup', 'Support utility settings, local fallback and data recovery path.'],
  ]
  cards.forEach(([h, b], i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    card(slide, h, b, { left: 72 + col * 286, top: 260 + row * 146, width: 258, height: 112 }, i === 7 ? C.red : C.lime)
  })
  footer(slide, '02')
  notes(slide)
}

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'FRONTEND REQUIREMENTS', 72, 58)
  title(slide, 'The frontend is the coach-facing control surface', 92, 670)
  subtitle(slide, 'Built with Vue 3, Quasar, Vue Router, Axios and ECharts/Vue-ECharts, with LocalStorage fallback for continuity.', 172, 640)
  const img = await image('image2.png')
  slide.images.add({
    ...img,
    alt: 'AKP ShuttleTrace live match player selection screen',
    fit: 'cover',
    position: { left: 706, top: 86, width: 500, height: 300 },
    geometry: 'roundRect',
    borderRadius: 10,
  })
  ;[
    ['Core pages', 'Dashboard, Login/Register, Live Match, Training Mode, Players, History, Profile and Settings.'],
    ['UI responsibility', 'Fast coach notation, player forms, report views, chart rendering and match/training navigation.'],
    ['Data handling', 'Axios API calls with LocalStorage fallback or offline cache for prototype resilience.'],
  ].forEach(([h, b], i) => card(slide, h, b, { left: 72, top: 270 + i * 118, width: 560, height: 88 }))
  footer(slide, '03')
  notes(slide)
}

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'BACKEND REQUIREMENTS', 72, 58)
  title(slide, 'The backend keeps badminton data structured and consistent', 92, 760)
  subtitle(slide, 'NestJS with TypeScript exposes REST endpoints, Prisma handles persistence and PostgreSQL stores match/training records.', 172, 780)
  const modules = [
    ['AuthModule', 'User identity, session validation and logout.'],
    ['PlayersModule', 'CRUD for coach-owned player profiles.'],
    ['MatchesModule', 'Match report, rallies, sets, shot records and soft delete history.'],
    ['TrainingModule', 'Training sessions, drill targets and repetition records.'],
    ['PrismaService', 'Database access layer and schema mapping.'],
  ]
  modules.forEach(([h, b], i) => {
    const left = i < 3 ? 72 + i * 380 : 262 + (i - 3) * 380
    const top = i < 3 ? 282 : 438
    card(slide, h, b, { left, top, width: 330, height: 112 })
  })
  const img = await image('image3.png')
  slide.images.add({
    ...img,
    alt: 'AKP ShuttleTrace analytics screen used by backend reporting',
    fit: 'cover',
    position: { left: 880, top: 68, width: 330, height: 180 },
    geometry: 'roundRect',
    borderRadius: 8,
  })
  footer(slide, '04')
  notes(slide)
}

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'DATABASE REQUIREMENTS', 72, 58)
  title(slide, 'Database model connects coaching records', 92, 760)
  subtitle(slide, 'The schema must preserve coach ownership, player context, match rallies, shot notation and training repetitions.', 172, 850)
  card(slide, 'Ownership chain', 'User > CoachProfile > Player\nEach coach owns their player records and session context.', { left: 72, top: 258, width: 346, height: 128 })
  card(slide, 'Match structure', 'Match > MatchSet > Rally > ShotRecord\nEvery point sequence stays connected to the match and player.', { left: 466, top: 258, width: 346, height: 128 })
  card(slide, 'Training structure', 'TrainingSession > TrainingRep\nDrill target, player, shot focus and repetition result are saved together.', { left: 860, top: 258, width: 346, height: 128 })
  card(slide, 'Reference data', 'ShotType links live shots and training reps so analysis uses a consistent badminton vocabulary.', { left: 72, top: 426, width: 346, height: 128 }, C.red)
  card(slide, 'History behavior', 'Match and training records support soft delete so coach history can be hidden without losing data integrity.', { left: 466, top: 426, width: 346, height: 128 })
  card(slide, 'Reporting base', 'Dashboard and export reports pull from Match, Rally, ShotRecord, TrainingSession and TrainingRep.', { left: 860, top: 426, width: 346, height: 128 })
  text(slide, 'Key tables: User, AuthSession, CoachProfile, Player, Match, MatchSet, Rally, ShotRecord, ShotType, TrainingSession and TrainingRep.', { left: 72, top: 596, width: 1000, height: 44 }, {
    fontSize: 16,
    color: C.muted,
  })
  footer(slide, '05')
  notes(slide, 'Diagram is an editable summary of the requested database specification.')
}

{
  const slide = presentation.slides.add()
  bg(slide)
  label(slide, 'API AND QUALITY REQUIREMENTS', 72, 58)
  title(slide, 'REST endpoints and quality rules make the prototype production-ready', 92, 900)
  subtitle(slide, 'The backend API is grouped by auth, players, matches, training and system health checks.', 172, 760)
  const groups = [
    ['Auth', 'POST /auth/register\nPOST /auth/login\nGET /auth/me\nPOST /auth/logout'],
    ['Players', 'GET /players\nGET /players/:id\nPOST /players\nPUT /players/:id\nDELETE /players/:id'],
    ['Matches', 'GET /matches\nGET /matches/:id\nPOST /matches\nPOST /matches/reports\nPOST /matches/:id/rallies\nPOST /matches/:id/shots\nDELETE /matches/:id'],
    ['Training', 'GET /training\nGET /training/player/:playerId\nPOST /training\nDELETE /training/:id'],
    ['System', 'GET /\nGET /health'],
  ]
  groups.forEach(([h, b], i) => {
    const left = 72 + (i % 3) * 382
    const top = i < 3 ? 252 : 470
    card(slide, h, b, { left, top, width: 330, height: i === 2 ? 172 : 154 }, i === 4 ? C.red : C.lime)
  })
  text(slide, 'Non-functional: responsive UI, backend validation, user/coach data ownership, soft delete, fast live-notation interaction and LocalStorage fallback.', { left: 72, top: 624, width: 1040, height: 42 }, {
    fontSize: 15,
    color: C.muted,
  })
  const img = await image('image4.png')
  slide.images.add({
    ...img,
    alt: 'AKP ShuttleTrace training mode screen',
    fit: 'cover',
    position: { left: 922, top: 70, width: 284, height: 160 },
    geometry: 'roundRect',
    borderRadius: 8,
  })
  footer(slide, '06')
  notes(slide)
}

await fs.mkdir(qaDir, { recursive: true })
await PresentationFile.exportPptx(presentation).then((pptx) => pptx.save(output))

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, '0')}`
  await writeBlob(path.join(qaDir, `${stem}.png`), await presentation.export({ slide, format: 'png', scale: 1 }))
}
await writeBlob(path.join(qaDir, 'montage.webp'), await presentation.export({ format: 'webp', montage: true, scale: 1 }))

console.log(`output=${output}`)
console.log(`slides=${presentation.slides.items.length}`)
console.log(`qa=${qaDir}`)
