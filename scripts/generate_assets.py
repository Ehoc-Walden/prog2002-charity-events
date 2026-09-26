from pathlib import Path
import html

root = Path(r"C:\Users\Walden_Ehoc\Documents\Codex\2026-09-25\new-chat-2\outputs\charity-events-submission\clientside\assets")
covers = root / "covers"
covers.mkdir(parents=True, exist_ok=True)

palettes = {
    "twilight-harbour": ("#102338", "#FF5A36", "#F2D95C", "#17B7A5"),
    "table-of-one-hundred": ("#251B2D", "#D9A441", "#F6EFDF", "#E84A7F"),
    "art-with-heart": ("#1E283A", "#7B61A8", "#F2D95C", "#FF7E68"),
    "beats-for-belonging": ("#17282B", "#E84A7F", "#17B7A5", "#F2D95C"),
    "coastline-walk": ("#0E5560", "#57C7B8", "#F8D15B", "#F7F0DE"),
    "trivia-tomorrow": ("#11382E", "#2E7D68", "#F0C95A", "#EAEFEA"),
    "sunrise-yoga": ("#24354A", "#4C8EDA", "#FF8A65", "#F4D06F"),
    "long-lunch": ("#3A2A1B", "#EE7F2D", "#F2D95C", "#6BBF8A"),
    "river-cleanup": ("#173B45", "#1C9DA0", "#D8E86A", "#EAF7F2"),
    "winter-sleepout": ("#171C2E", "#5268B6", "#E4A853", "#D7E2F1"),
    "fundraising-masterclass": ("#2C2934", "#8D7BA8", "#FF7E68", "#F1E9DA"),
    "spring-pantry": ("#3A2B20", "#C86B3C", "#80B97A", "#F2D95C"),
}

def base(pid, p):
    bg, a, b, c = p
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-labelledby="title desc">
  <title id="title">{html.escape(pid.replace('-', ' ').title())}</title>
  <desc id="desc">Abstract editorial artwork in the Common Ground charity event visual system.</desc>
  <rect width="1200" height="800" fill="{bg}"/>
  <rect x="0" y="0" width="1200" height="800" fill="url(#grain)" opacity=".13"/>
  <defs>
    <pattern id="grain" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#fff" opacity=".35"/>
      <circle cx="17" cy="13" r="1" fill="#fff" opacity=".18"/>
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{a}" stop-opacity=".95"/>
      <stop offset="1" stop-color="{b}" stop-opacity=".66"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">'''

def close_mark(pid, p):
    bg, a, b, c = p
    return f'''  </g>
  <g transform="translate(56 58)">
    <circle cx="28" cy="28" r="27" fill="{c}" opacity=".96"/>
    <path d="M14 30c6-14 18-18 29-9-4 14-15 20-29 9Z" fill="{bg}"/>
    <path d="M28 51V31" stroke="{bg}" stroke-width="5" stroke-linecap="round"/>
  </g>
  <text x="118" y="98" fill="{c}" font-family="Arial, sans-serif" font-size="23" font-weight="700" letter-spacing="4">COMMON GROUND</text>
</svg>'''

svg = {}
# Run / route cover
p = palettes["twilight-harbour"]
svg["twilight-harbour"] = base("twilight harbour", p) + f'''
    <path d="M-80 660C190 520 235 235 515 335s336-180 745-60" stroke="url(#fade)" stroke-width="150"/>
    <path d="M-40 440C210 390 270 630 530 545s315-135 720-290" stroke="{p[2]}" stroke-width="16" opacity=".9"/>
    <path d="M40 720C260 560 380 525 560 575s360 74 620-75" stroke="{p[3]}" stroke-width="18" stroke-dasharray="4 28" opacity=".9"/>
    <circle cx="865" cy="214" r="137" fill="{p[2]}" opacity=".92"/>
    <circle cx="865" cy="214" r="88" fill="{p[1]}"/>
    <path d="M815 215h100M865 165v100" stroke="{p[0]}" stroke-width="18"/>''' + close_mark("twilight-harbour", p)
# Gala arches
p = palettes["table-of-one-hundred"]
svg["table-of-one-hundred"] = base("table of one hundred", p) + f'''
    <path d="M128 690V346c0-156 126-282 282-282s282 126 282 282v344" stroke="{p[1]}" stroke-width="42"/>
    <path d="M278 690V366c0-95 62-157 147-157s147 62 147 157v324" stroke="{p[3]}" stroke-width="34" opacity=".9"/>
    <path d="M728 690V250c0-87 70-157 157-157s157 70 157 157v440" stroke="{p[2]}" stroke-width="22" opacity=".82"/>
    <circle cx="884" cy="489" r="80" fill="{p[1]}" opacity=".86"/>
    <circle cx="884" cy="489" r="31" fill="{p[0]}"/>''' + close_mark("table-of-one-hundred", p)
# Auction frames
p = palettes["art-with-heart"]
svg["art-with-heart"] = base("art with heart", p) + f'''
    <rect x="108" y="210" width="404" height="474" rx="18" fill="{p[2]}" transform="rotate(-7 310 447)"/>
    <rect x="365" y="154" width="404" height="474" rx="18" fill="url(#fade)" transform="rotate(5 567 391)"/>
    <rect x="645" y="246" width="404" height="474" rx="18" fill="{p[3]}" transform="rotate(-3 847 483)"/>
    <path d="M163 545c98-154 213-169 318-45 58 68 125 67 203 1" stroke="{p[0]}" stroke-width="16"/>
    <path d="M420 492c73-138 183-153 285-25 72 91 153 94 235-17" stroke="{p[0]}" stroke-width="16"/>
    <circle cx="725" cy="537" r="59" fill="{p[0]}" opacity=".56"/>''' + close_mark("art-with-heart", p)
# Music waves
p = palettes["beats-for-belonging"]
svg["beats-for-belonging"] = base("beats for belonging", p) + f'''
    <path d="M90 386c96-242 183 201 294-2s171 235 278 13 192 198 344-72" stroke="{p[1]}" stroke-width="48"/>
    <path d="M98 559c82-183 168 141 268-8s173 181 273 5 193 145 352-64" stroke="{p[2]}" stroke-width="30" opacity=".92"/>
    <circle cx="900" cy="226" r="103" fill="{p[2]}"/>
    <path d="M870 168v116l94-58-94-58Z" fill="{p[0]}"/>
    <path d="M137 163h230M137 204h144" stroke="{p[3]}" stroke-width="15"/>''' + close_mark("beats-for-belonging", p)
# Coast walk
p = palettes["coastline-walk"]
svg["coastline-walk"] = base("coastline community walk", p) + f'''
    <path d="M-40 520c178-153 311-50 456 19s255 38 417-75 248-73 407-11" stroke="url(#fade)" stroke-width="116"/>
    <path d="M-10 588c205-104 340-26 500 44s287 28 447-71 231-72 323-41" stroke="{p[3]}" stroke-width="22" stroke-dasharray="8 30"/>
    <circle cx="939" cy="235" r="126" fill="{p[2]}"/>
    <path d="M842 250c58-21 112-8 161 38-55 49-108 60-161 34v-72Z" fill="{p[1]}"/>
    <path d="M948 237c-5 35 12 63 52 83" stroke="{p[0]}" stroke-width="10"/>''' + close_mark("coastline-walk", p)
# Trivia dots
p = palettes["trivia-tomorrow"]
svg["trivia-tomorrow"] = base("trivia for tomorrow", p) + f'''
    <g fill="{p[1]}" opacity=".93">
      <circle cx="200" cy="242" r="86"/><circle cx="390" cy="242" r="86"/><circle cx="580" cy="242" r="86"/>
      <circle cx="295" cy="414" r="86"/><circle cx="485" cy="414" r="86"/><circle cx="675" cy="414" r="86"/>
      <circle cx="390" cy="586" r="86"/><circle cx="580" cy="586" r="86"/><circle cx="770" cy="586" r="86"/>
    </g>
    <path d="M794 144h244v430H794z" fill="{p[2]}" transform="rotate(7 916 359)"/>
    <path d="M871 276c6-41 38-60 79-52 43 9 64 45 50 82-11 29-32 39-56 58-12 10-18 22-18 39" stroke="{p[0]}" stroke-width="22" fill="none"/>
    <circle cx="921" cy="467" r="14" fill="{p[0]}"/>''' + close_mark("trivia-tomorrow", p)
# Yoga sun
p = palettes["sunrise-yoga"]
svg["sunrise-yoga"] = base("sunrise yoga", p) + f'''
    <circle cx="852" cy="348" r="166" fill="{p[2]}"/>
    <circle cx="852" cy="348" r="116" fill="{p[3]}"/>
    <path d="M648 547c118-81 256-81 414 0M589 625c176-116 365-116 550 0" stroke="{p[2]}" stroke-width="22"/>
    <path d="M83 270c89-84 174-84 258 0s169 84 254 0" stroke="{p[1]}" stroke-width="22"/>
    <path d="M106 355c78-66 151-66 224 0s146 66 220 0" stroke="{p[2]}" stroke-width="14" opacity=".88"/>''' + close_mark("sunrise-yoga", p)
# Long lunch
p = palettes["long-lunch"]
svg["long-lunch"] = base("long lunch", p) + f'''
    <ellipse cx="605" cy="500" rx="465" ry="192" fill="{p[1]}"/>
    <ellipse cx="605" cy="466" rx="367" ry="141" fill="{p[2]}" opacity=".94"/>
    <path d="M356 455h500M420 530c42 74 111 110 196 110s154-36 196-110" stroke="{p[0]}" stroke-width="20" fill="none"/>
    <circle cx="481" cy="345" r="54" fill="{p[3]}"/><circle cx="604" cy="315" r="54" fill="{p[3]}"/><circle cx="727" cy="345" r="54" fill="{p[3]}"/>
    <path d="M133 173h252M133 224h178" stroke="{p[3]}" stroke-width="19"/>''' + close_mark("long-lunch", p)
# River cleanup
p = palettes["river-cleanup"]
svg["river-cleanup"] = base("river clean up", p) + f'''
    <path d="M-30 368c163-119 300-119 463 0s300 119 463 0 300-119 463 0" stroke="url(#fade)" stroke-width="128"/>
    <path d="M-20 491c163-119 300-119 463 0s300 119 463 0 300-119 463 0" stroke="{p[2]}" stroke-width="36"/>
    <path d="M760 123c-82 18-123 65-123 141 0 72 44 124 135 124 86 0 132-50 132-122 0-76-44-124-144-143Z" fill="{p[3]}" opacity=".92"/>
    <path d="M746 211c19-34 56-51 105-48M770 303c-6-40 4-73 31-99" stroke="{p[0]}" stroke-width="13" fill="none"/>''' + close_mark("river-cleanup", p)
# Sleepout stars
p = palettes["winter-sleepout"]
svg["winter-sleepout"] = base("winter sleepout", p) + f'''
    <path d="M0 629c216-177 401-176 566-16s336 150 634-24v211H0Z" fill="{p[1]}" opacity=".9"/>
    <path d="M168 226l72 78-72 78-72-78 72-78Zm255-82l92 101-92 101-92-101 92-101Zm310 132l67 72-67 72-67-72 67-72Z" fill="{p[2]}"/>
    <path d="M775 503c0-78 63-141 141-141s141 63 141 141v188H775Z" fill="{p[3]}" opacity=".82"/>
    <path d="M916 362v329M775 503h282" stroke="{p[0]}" stroke-width="18" opacity=".72"/>''' + close_mark("winter-sleepout", p)
# Fundraising suspended
p = palettes["fundraising-masterclass"]
svg["fundraising-masterclass"] = base("fundraising masterclass", p) + f'''
    <rect x="190" y="176" width="820" height="478" rx="42" fill="{p[3]}" opacity=".92"/>
    <path d="M280 292h640M280 382h468M280 472h530M280 562h343" stroke="{p[1]}" stroke-width="24"/>
    <circle cx="917" cy="181" r="105" fill="{p[2]}"/>
    <path d="M866 181h102" stroke="{p[0]}" stroke-width="20"/>''' + close_mark("fundraising-masterclass", p)
# Pantry grid
p = palettes["spring-pantry"]
svg["spring-pantry"] = base("spring pantry", p) + f'''
    <rect x="128" y="212" width="400" height="432" rx="24" fill="{p[1]}"/>
    <rect x="570" y="212" width="500" height="432" rx="24" fill="{p[2]}"/>
    <path d="M128 356h400M128 500h400M261 212v432M395 212v432" stroke="{p[3]}" stroke-width="22"/>
    <path d="M651 309h339M651 432h238M651 555h284" stroke="{p[0]}" stroke-width="25"/>
    <path d="M467 194c36-104 110-135 223-92" stroke="{p[3]}" stroke-width="24"/>''' + close_mark("spring-pantry", p)

for name, content in svg.items():
    (covers / f"{name}.svg").write_text(content, encoding="utf-8")

mark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-labelledby="title">
<title id="title">Common Ground Collective mark</title>
<circle cx="60" cy="60" r="58" fill="#FF5A36"/>
<path d="M27 64c13-37 43-49 71-23-9 37-38 51-71 23Z" fill="#102338"/>
<path d="M60 100V66" stroke="#102338" stroke-width="11" stroke-linecap="round"/>
<circle cx="88" cy="30" r="12" fill="#F2D95C"/>
</svg>'''
(root / "common-ground-mark.svg").write_text(mark, encoding="utf-8")
(root / "favicon.svg").write_text(mark, encoding="utf-8")
print(f"Created {len(svg)} covers and brand marks.")
