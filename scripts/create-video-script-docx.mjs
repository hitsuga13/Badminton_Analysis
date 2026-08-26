import fs from 'node:fs'
import path from 'node:path'

const outputPath = path.resolve('AKP_ShuttleTrace_Video_Script.docx')

const scenes = [
  {
    scene: '1. Opening',
    script:
      'Hello, this is AKP ShuttleTrace, a Badminton Match and Stroke Notational Analysis System. This system helps coaches record live badminton matches, capture stroke notation, analyze player performance, manage player profiles, and generate post-match reports.',
    shot: 'Show the system opened in the browser with the AKP ShuttleTrace branding visible.',
    flow: 'Open the web app. Start on the main screen or dashboard. Keep the logo and sidebar visible for a few seconds.',
  },
  {
    scene: '2. Main Interface',
    script:
      'After entering the system, users can access the main modules from the sidebar. The available modules are Dashboard, Live Match, Training Mode, Players, History, Profile, and Settings.',
    shot: 'Show the sidebar and move the cursor through each menu item.',
    flow: 'Point to Dashboard, Live Match, Training Mode, Players, History, Profile, and Settings without clicking too fast.',
  },
  {
    scene: '3. Players Module',
    script:
      'The Players module is used to manage player information. Coaches can view the player list, add new players, edit existing player data, view player details, and delete players.',
    shot: 'Open the Players page and show the player table.',
    flow: 'Click Players. Show dummy players. Click Add Player. Show name, category, dominant hand, age, height, weight, and BMI fields.',
  },
  {
    scene: '4. Player Data',
    script:
      'The system stores additional player information such as age, height, weight, and BMI. BMI is calculated automatically based on the player height and weight.',
    shot: 'Focus on the Add/Edit Player dialog and BMI value.',
    flow: 'Adjust height and weight. Show BMI changing automatically. Then show Details, Edit, and Delete action buttons.',
  },
  {
    scene: '5. Live Match Setup',
    script:
      'The Live Match module is used during an active badminton match. Coaches can select two players directly from the saved player database instead of typing player names manually.',
    shot: 'Open Live Match and show player selection cards.',
    flow: 'Click Live Match. Select Player A and Player B. Click Start Match.',
  },
  {
    scene: '6. Digital Coin Flip',
    script:
      'Once both players are selected, the system starts a digital coin flip to determine the first server. The player who wins the coin flip will begin the first rally.',
    shot: 'Show the coin flip animation and result.',
    flow: 'Let the coin flip animation and sound play. Pause briefly when the first server result appears.',
  },
  {
    scene: '7. Start Recording',
    script:
      'After the first server is determined, the coach can start recording the match. The active player notation panel is highlighted so the coach knows which player stroke should be recorded.',
    shot: 'Show the live match recorder with one active player panel.',
    flow: 'Click Start Recording. Point to the highlighted player panel and the dimmed inactive panel.',
  },
  {
    scene: '8. First Shot Rule',
    script:
      'For the first shot of every rally, only the Serve button is enabled because every badminton rally must start with a serve.',
    shot: 'Focus on the notation buttons before the first shot.',
    flow: 'Show that only Serve is available. Show other stroke buttons dimmed. Click Serve.',
  },
  {
    scene: '9. Turn-Based Notation',
    script:
      'After the serve is recorded, the turn automatically switches to the opponent. The Serve button becomes disabled because serve is only valid as the first shot of a rally.',
    shot: 'Show the active panel switching between both players.',
    flow: 'Click several valid strokes such as Smash, Drop, Clear, and Error. Let the button sound effects play.',
  },
  {
    scene: '10. Rally Timer',
    script:
      'The system also records the duration of each rally. The rally timer starts when the rally begins and stops when the rally ends.',
    shot: 'Show the rally timer running during notation recording.',
    flow: 'Record a few strokes. Keep the timer visible. Click End Rally and show the rally outcome being saved.',
  },
  {
    scene: '11. End Match',
    script:
      'After several rallies have been recorded, the coach can end the match. All notation data and rally outcomes are saved automatically into History and used for Dashboard analytics.',
    shot: 'Show the End Match button and confirmation/result state.',
    flow: 'Record at least two short rallies. Click End Match. Wait until the match is saved.',
  },
  {
    scene: '12. Dashboard Analytics',
    script:
      'After the match is completed, the recorded data is displayed in the Dashboard. Coaches can use the match selector to choose which match they want to analyze.',
    shot: 'Open Dashboard and show the selected match.',
    flow: 'Click Dashboard. Use the match selector. Show summary cards for total rallies, longest rally, attack ratio, and unforced errors.',
  },
  {
    scene: '13. Shot Distribution Chart',
    script:
      'The shot frequency chart shows the frequency and distribution of stroke types used by both players during the match.',
    shot: 'Focus on the bar chart.',
    flow: 'Move the cursor over the shot distribution chart. Show the comparison between both players.',
  },
  {
    scene: '14. Performance Radar',
    script:
      'The radar chart compares player performance across categories such as attack, defence, consistency, stamina, speed, and net play.',
    shot: 'Focus on the radar chart.',
    flow: 'Hover over Attack and Defence. Show that only the selected category data appears for both players.',
  },
  {
    scene: '15. Export Report',
    script:
      'The system also provides an Export Report function. The report is exported as a CSV file, which can be opened in Excel for further analysis.',
    shot: 'Show the Export Report button on Dashboard.',
    flow: 'Click Export Report. If the browser shows a download, briefly show the downloaded CSV file.',
  },
  {
    scene: '16. History Module',
    script:
      'The History module stores all completed live matches and training sessions. Coaches can review previous records and open the details for each session.',
    shot: 'Open History and show the saved records.',
    flow: 'Click History. Open one match detail. Show score, total strokes, rally outcomes, and notation timeline.',
  },
  {
    scene: '17. Recently Deleted',
    script:
      'If a history record is deleted, it moves to Recently Deleted, where it can still be restored if needed.',
    shot: 'Show delete, Recently Deleted, and restore.',
    flow: 'Delete one history item. Scroll to Recently Deleted. Click Restore and show the record returning to history.',
  },
  {
    scene: '18. Training Mode',
    script:
      'Training Mode is used to track training sessions based on a selected player, shot type, and target repetition.',
    shot: 'Open Training Mode setup.',
    flow: 'Select a player. Select a shot type. Choose target repetition. Click Start Training.',
  },
  {
    scene: '19. Training Recording',
    script:
      'During training, the system calculates total repetitions, successful attempts, unsuccessful attempts, accuracy, and progress.',
    shot: 'Show training progress and result buttons.',
    flow: 'Click Successful and Unsuccessful several times. Show progress, accuracy, and remaining repetition.',
  },
  {
    scene: '20. Training Save Result',
    script:
      'After the session ends, the training data is saved into History and linked to the selected player profile.',
    shot: 'Show the completed training state, then History or Player details.',
    flow: 'End Training. Open History or the player details page to show the saved training record.',
  },
  {
    scene: '21. Settings',
    script:
      'In Settings, users can adjust system preferences such as sound effects, sound volume, theme, data backup, backup import, and clearing match history.',
    shot: 'Open Settings page.',
    flow: 'Show sound toggle, volume slider, theme options, backup export, backup import, and clear match history controls.',
  },
  {
    scene: '22. Closing',
    script:
      'In conclusion, AKP ShuttleTrace helps coaches record badminton matches live, analyze stroke notation, manage player profiles, store match and training history, track training performance, and export reports for further analysis.',
    shot: 'Return to Dashboard or show the AKP ShuttleTrace logo.',
    flow: 'End on the dashboard or branding screen. Keep the final screen still for a few seconds.',
  },
]

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

function paragraph(text, style = '') {
  const pStyle = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''
  return `<w:p>${pStyle}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function cell(content, width, shaded = false) {
  const shade = shaded ? '<w:shd w:fill="DFFF00"/>' : ''
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shade}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${content}</w:tc>`
}

function row(cells, header = false) {
  const trPr = header ? '<w:trPr><w:tblHeader/></w:trPr>' : ''
  return `<w:tr>${trPr}${cells.join('')}</w:tr>`
}

const header = row(
  [
    cell(paragraph('Scene', 'TableHeader'), 1700, true),
    cell(paragraph('Reader Script', 'TableHeader'), 3600, true),
    cell(paragraph('Shot / Screen', 'TableHeader'), 2500, true),
    cell(paragraph('Flow to Show', 'TableHeader'), 3000, true),
  ],
  true,
)

const tableRows = scenes
  .map((item) =>
    row([
      cell(paragraph(item.scene, 'SceneCell'), 1700),
      cell(paragraph(item.script), 3600),
      cell(paragraph(item.shot), 2500),
      cell(paragraph(item.flow), 3000),
    ]),
  )
  .join('')

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph('AKP ShuttleTrace Video Recording Script', 'Title')}
    ${paragraph('Scene-by-scene guide for system overview video', 'Subtitle')}
    ${paragraph('Recommended recording order: Players, Live Match, Dashboard, History, Training Mode, Settings, Closing.')}
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="10800" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="BDBDBD"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="BDBDBD"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BDBDBD"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="BDBDBD"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>
        </w:tblBorders>
        <w:tblLayout w:type="fixed"/>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="1700"/>
        <w:gridCol w:w="3600"/>
        <w:gridCol w:w="2500"/>
        <w:gridCol w:w="3000"/>
      </w:tblGrid>
      ${header}
      ${tableRows}
    </w:tbl>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="720" w:bottom="1080" w:left="720" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="80"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="32"/><w:color w:val="111111"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="240"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:i/><w:sz w:val="22"/><w:color w:val="555555"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="TableHeader">
    <w:name w:val="Table Header"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="19"/><w:color w:val="111111"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="SceneCell">
    <w:name w:val="Scene Cell"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="19"/><w:color w:val="111111"/></w:rPr>
  </w:style>
</w:styles>`

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`

const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>AKP ShuttleTrace Video Recording Script</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-08-26T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-26T00:00:00Z</dcterms:modified>
</cp:coreProperties>`

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>`

const files = [
  ['[Content_Types].xml', contentTypesXml],
  ['_rels/.rels', relsXml],
  ['word/document.xml', documentXml],
  ['word/_rels/document.xml.rels', documentRelsXml],
  ['word/styles.xml', stylesXml],
  ['docProps/core.xml', coreXml],
  ['docProps/app.xml', appXml],
]

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function u16(value) {
  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(value)
  return buffer
}

function u32(value) {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(value >>> 0)
  return buffer
}

function dosDateTime(date = new Date('2026-08-26T00:00:00Z')) {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, date: dosDate }
}

function buildZip(entries) {
  const localParts = []
  const centralParts = []
  let offset = 0
  const { time, date } = dosDateTime()

  for (const [name, content] of entries) {
    const nameBuffer = Buffer.from(name)
    const data = Buffer.from(content, 'utf8')
    const crc = crc32(data)

    const localHeader = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuffer.length),
      u16(0),
      nameBuffer,
    ])

    localParts.push(localHeader, data)

    const centralHeader = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuffer.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuffer,
    ])

    centralParts.push(centralHeader)
    offset += localHeader.length + data.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const endRecord = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0),
  ])

  return Buffer.concat([...localParts, centralDirectory, endRecord])
}

fs.writeFileSync(outputPath, buildZip(files))
console.log(outputPath)
