import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, PresentationFile } from '@oai/artifact-tool'

const source = 'C:\\Users\\wanah\\Downloads\\ShuttleTrace_AI_Pitch_Visual_Draft.pptx'
const outDir = 'C:\\Users\\wanah\\OneDrive\\Documents\\GitHub\\Badminton_Analysis\\.codex_tmp\\pitch_requirements\\inspect'

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()))
}

await fs.mkdir(outDir, { recursive: true })

const presentation = await PresentationFile.importPptx(await FileBlob.load(source))
const snapshot = await presentation.inspect({
  kind: 'deck,slide,textbox,shape,image,table,chart,notes,layout',
  include: 'id,slide,name,title,textPreview,textChars,bbox,bboxUnit,rows,cols,alt,isPlaceholder',
  maxChars: 50000,
})
await fs.writeFile(path.join(outDir, 'inspect.ndjson'), snapshot.ndjson)

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, '0')}`
  await writeBlob(path.join(outDir, `${stem}.png`), await presentation.export({ slide, format: 'png', scale: 1 }))
  await fs.writeFile(path.join(outDir, `${stem}.layout.json`), await (await slide.export({ format: 'layout' })).text())
}

await writeBlob(path.join(outDir, 'montage.webp'), await presentation.export({ format: 'webp', montage: true, scale: 1 }))

console.log(`slides=${presentation.slides.items.length}`)
console.log(path.join(outDir, 'inspect.ndjson'))
