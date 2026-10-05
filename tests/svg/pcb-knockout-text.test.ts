import { expect, test } from "bun:test"
import { parseAltiumPcbDoc, serializeAltiumPcbToSvg } from "../../lib"

test("renders knockout backgrounds with transparent letters", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|VX0=0mil|VY0=0mil|VX1=700mil|VY1=0mil|VX2=700mil|VY2=500mil|VX3=0mil|VY3=500mil",
      "|RECORD=Text|LAYER=TOPOVERLAY|X=100mil|Y=350mil|HEIGHT=70.8661mil|WIDESTRING=68,65,84,65|INVERTED=TRUE|MARGINBORDERWIDTH=7.086614mil|JUSTIFICATION=5",
      "|RECORD=Text|LAYER=TOPOVERLAY|X=350mil|Y=350mil|HEIGHT=70.8661mil|WIDESTRING=80,87,82|INVERTED=TRUE|MARGINBORDERWIDTH=7.086614mil|JUSTIFICATION=5",
      "|RECORD=Text|LAYER=BOTTOMOVERLAY|X=550mil|Y=150mil|HEIGHT=40mil|TEXT=PWR|INVERTED=TRUE|MARGINBORDERWIDTH=0mil|ROTATION=90|MIRROR=TRUE",
      "|RECORD=Text|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=40mil|TEXT=Normal",
    ].join("\n"),
  )
  const svg = serializeAltiumPcbToSvg(document)
  expect(svg.match(/data-knockout="true"/g)).toHaveLength(3)
  const ids = [...svg.matchAll(/<mask id="([^"]+)"/g)].map((match) => match[1])
  expect(new Set(ids).size).toBe(3)
  for (const id of ids) expect(svg).toContain(`mask="url(#${id})"`)
  expect(svg).toContain("rotate(-90) scale(-1 1)")
  expect(svg).toContain('fill="black"')
  expect(svg).toContain(">Normal</text>")
})

test("uses explicit knockout rectangle dimensions", () => {
  const svg = serializeAltiumPcbToSvg(
    parseAltiumPcbDoc(
      "|RECORD=Board\n|RECORD=Text|LAYER=TOPOVERLAY|X=0mil|Y=0mil|HEIGHT=40mil|TEXT=DATA|INVERTED=TRUE|INVERTEDRECT=TRUE|TEXTBOXWIDTH=200mil|TEXTBOXHEIGHT=80mil|MARGINBORDERWIDTH=10mil",
    ),
  )
  expect(svg).toContain('width="200" height="80"')
  expect(svg).toContain('x="-10" y="-50"')
})
