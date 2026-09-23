#!/usr/bin/env python3
import struct, zlib, binascii
from pathlib import Path

SRC = Path('bring-photo-v4-maison.webp.png')
DST = Path('bring-photo-v5-maison.webp.png')
SRC_W, SRC_H = 1536, 1024
COLS, ROWS = 12, 7
CELL_W, CELL_H = 140, 160
ALPHA_FLOOR = 8

BBOXES = [
[(31,19,62,127),(164,19,61,127),(288,14,60,132),(412,18,63,129),(534,14,70,131),(666,13,55,134),(776,18,88,128),(921,15,57,131),(1048,14,62,131),(1164,17,64,129),(1258,42,124,85),(1399,41,122,90)],
[(22,168,81,127),(137,177,115,109),(266,171,111,123),(409,168,79,127),(534,164,70,131),(639,186,114,92),(767,168,109,127),(897,171,108,120),(1045,168,66,127),(1173,166,48,130),(1258,185,127,105),(1397,178,126,109)],
[(31,314,62,125),(130,330,123,95),(276,315,86,124),(409,314,64,124),(514,322,106,108),(647,330,105,100),(768,324,115,108),(894,314,111,124),(1019,317,115,121),(1140,337,127,91),(1267,338,125,88),(1425,311,71,127)],
[(18,463,93,107),(156,461,64,109),(258,465,109,102),(383,467,113,96),(509,466,119,94),(639,470,114,88),(766,469,110,93),(889,461,120,104),(1021,461,121,105),(1151,458,110,103),(1275,459,116,108),(1424,455,84,115)],
[(29,585,63,118),(161,581,60,124),(288,581,54,124),(410,583,56,123),(537,579,52,128),(657,586,65,122),(793,584,61,123),(902,584,87,122),(1032,592,88,114),(1171,586,67,121),(1298,584,64,123),(1398,610,124,81)],
[(13,738,109,99),(161,723,62,121),(295,723,41,120),(414,721,54,123),(536,722,54,123),(650,724,92,121),(788,722,66,125),(916,723,60,124),(1012,731,114,113),(1144,736,125,105),(1299,723,56,121),(1399,755,123,67)],
[(13,871,109,115),(132,884,126,94),(274,871,96,120),(401,868,85,119),(525,863,79,127),(639,868,101,120),(767,865,102,122),(894,867,111,120),(1030,863,101,120),(1153,864,105,127),(1283,872,110,116),(1413,862,103,123)],
]

def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
    return a if pa <= pb and pa <= pc else (b if pb <= pc else c)

def read_rgba_png(path):
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('Source atlas is not a PNG')
    pos = 8
    width = height = None
    compressed = bytearray()
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        kind = data[pos+4:pos+8]
        payload = data[pos+8:pos+8+length]
        pos += 12 + length
        if kind == b'IHDR':
            width, height, depth, color, comp, filt, interlace = struct.unpack('>IIBBBBB', payload)
            if (depth, color, comp, filt, interlace) != (8, 6, 0, 0, 0):
                raise SystemExit('Expected non-interlaced 8-bit RGBA PNG')
        elif kind == b'IDAT':
            compressed.extend(payload)
        elif kind == b'IEND':
            break
    raw = zlib.decompress(bytes(compressed))
    bpp = 4
    stride = width * bpp
    pixels = bytearray(width * height * bpp)
    prev = bytearray(stride)
    src = 0
    for y in range(height):
        f = raw[src]; src += 1
        scan = bytearray(raw[src:src+stride]); src += stride
        for i in range(stride):
            left = scan[i-bpp] if i >= bpp else 0
            up = prev[i]
            ul = prev[i-bpp] if i >= bpp else 0
            if f == 1: scan[i] = (scan[i] + left) & 255
            elif f == 2: scan[i] = (scan[i] + up) & 255
            elif f == 3: scan[i] = (scan[i] + ((left + up) >> 1)) & 255
            elif f == 4: scan[i] = (scan[i] + paeth(left, up, ul)) & 255
            elif f != 0: raise SystemExit(f'Unsupported PNG filter {f}')
        off = y * stride
        pixels[off:off+stride] = scan
        prev = scan
    return width, height, pixels

def png_chunk(kind, payload):
    crc = binascii.crc32(kind + payload) & 0xffffffff
    return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', crc)

def write_rgba_png(path, width, height, pixels):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        off = y * stride
        raw.extend(pixels[off:off+stride])
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        b'\x89PNG\r\n\x1a\n'
        + png_chunk(b'IHDR', ihdr)
        + png_chunk(b'IDAT', zlib.compress(bytes(raw), 9))
        + png_chunk(b'IEND', b'')
    )

def replace_once(path, old, new):
    text = path.read_text(encoding='utf-8')
    if text.count(old) != 1:
        raise SystemExit(f'Expected one occurrence in {path}: {old!r}')
    path.write_text(text.replace(old, new), encoding='utf-8')

def main():
    w, h, src = read_rgba_png(SRC)
    if (w, h) != (SRC_W, SRC_H):
        raise SystemExit(f'Unexpected Maison atlas size: {w}x{h}')
    out_w, out_h = COLS * CELL_W, ROWS * CELL_H
    out = bytearray(out_w * out_h * 4)
    for row in range(ROWS):
        for col in range(COLS):
            x, y, bw, bh = BBOXES[row][col]
            if bw > CELL_W - 12 or bh > CELL_H - 12:
                raise SystemExit(f'Product {row},{col} does not fit the padded cell')
            dx = col * CELL_W + (CELL_W - bw) // 2
            dy = row * CELL_H + (CELL_H - bh) // 2
            for yy in range(bh):
                src_off = ((y + yy) * w + x) * 4
                dst_off = ((dy + yy) * out_w + dx) * 4
                for xx in range(bw):
                    s = src_off + xx * 4
                    d = dst_off + xx * 4
                    if src[s+3] <= ALPHA_FLOOR:
                        continue
                    out[d:d+4] = src[s:s+4]
    write_rgba_png(DST, out_w, out_h, out)

    app = Path('app.js')
    replace_once(app,
        "'Maison':{src:'./bring-photo-v4-maison.webp.png?v=14',cols:12,rows:7,ratio:.875}",
        "'Maison':{src:'./bring-photo-v5-maison.webp.png?v=15',cols:12,rows:7,ratio:.875}")
    replace_once(app,
        "  const isDishware=position.category==='Maison'&&position.sub==='Vaisselle';\n"
        "  const safeRight=isDishware?2:(position.category==='Maison'?10:4);\n"
        "  const safeBottom=isDishware?2:((position.category==='Maison'||position.category==='Boissons')?9:4);",
        "  const safeRight=position.category==='Maison'?0:4;\n"
        "  const safeBottom=position.category==='Maison'?0:(position.category==='Boissons'?9:4);")

    index = Path('index.html')
    text = index.read_text(encoding='utf-8')
    if text.count('<span class=\"page-version\">v94</span>') != 3:
        raise SystemExit('Unexpected page-version before v95')
    text = text.replace('<span class=\"page-version\">v94</span>', '<span class=\"page-version\">v95</span>')
    if text.count('./app.js?v=94') != 1:
        raise SystemExit('Unexpected app.js cache key before v95')
    index.write_text(text.replace('./app.js?v=94', './app.js?v=95'), encoding='utf-8')

    sw = Path('sw.js')
    replace_once(sw, "const CACHE='courses-app-v94-list-reorder';", "const CACHE='courses-app-v95-maison-atlas';")
    replace_once(sw, "'./app.js?v=94'", "'./app.js?v=95'")
    replace_once(sw, "'./bring-photo-v4-maison.webp.png?v=14'", "'./bring-photo-v5-maison.webp.png?v=15'")

    print(f'Wrote {DST} ({out_w}x{out_h}); prepared v95 integration')

if __name__ == '__main__':
    main()
