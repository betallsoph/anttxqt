# Design Language — anttkn

> Template design cho toàn bộ UI của anttxqt portfolio.
> Áp dụng cho trang chính, admin, và bất kỳ trang mới nào.

---

## 1. Philosophy

**anttkn** — Bold, honest, playful.
*(Note từ tác giả: Xin nhắc lại là tôi không hề thích "Neobrutalism" nhé. Chẳng qua cái web vô tình trông giống thế thôi! Dùng từ này thì AI dễ hiểu mà làm cho lẹ chứ không phải gu tui!)*

- Viền đen dày, rõ ràng
- Shadow offset tạo chiều sâu giả 3D
- Màu sáng, tươi (blue-300 chủ đạo)
- Tương tác rõ ràng: bấm vào = shadow biến mất, element "lún xuống"
- Typography đậm, dễ đọc
- Không gradient text, không blur, không glass morphism

---

## 2. Color Palette

### Primary
| Token           | Value                        | Tailwind       | Usage                     |
|-----------------|------------------------------|----------------|---------------------------|
| Primary         | `#93C5FD` / `rgb(147,197,253)` | `blue-300`     | Button bg, accent, scrollbar |
| Primary Dark    | `#60A5FA` / `rgb(96,165,250)`  | `blue-400`     | Hover states, dots        |
| Primary Light   | `#DBEAFE`                    | `blue-100`     | Card bg, hover ghost btn  |
| Primary Lighter | `#EFF6FF`                    | `blue-50`      | Subtle backgrounds        |
| Primary Medium  | `#BFDBFE`                    | `blue-200`     | Icon boxes, grid hover    |

### Neutral
| Token       | Value     | Tailwind     | Usage                  |
|-------------|-----------|--------------|------------------------|
| Black       | `#000000` | `black`      | Text, borders, shadows |
| White       | `#FFFFFF` | `white`      | Backgrounds, cards     |
| Zinc-100    | `#F4F4F5` | `zinc-100`   | macOS header bg        |
| Zinc-400    | `#A1A1AA` | `zinc-400`   | Placeholder, muted     |
| Zinc-500    | `#71717A` | `zinc-500`   | Secondary text         |
| Zinc-600    | `#52525B` | `zinc-600`   | Body text              |
| Zinc-700    | `#3F3F46` | `zinc-700`   | Strong body text       |

### Status
| Token          | Background  | Text         | Border       |
|----------------|-------------|--------------|--------------|
| Production     | `green-200` | `green-800`  | `green-400`  |
| Staging        | `sky-200`   | `sky-800`    | `sky-400`    |
| In Development | `amber-200` | `amber-800`  | `amber-400`  |
| Concept        | `purple-200`| `purple-800` | `purple-400` |

### Semantic
| Token   | Value       | Usage           |
|---------|-------------|-----------------|
| Link    | `blue-500`  | All text links  |
| Error   | `red-500`   | Error messages  |
| Success | `green-600` | Success messages|

---

## 3. Typography

### Font
- **Family:** `"Outfit"` (Google Fonts)
- **Weights:** 100–900 available, commonly used: 500 (medium), 600 (semibold), 700 (bold), 900 (black)

### Scale

| Element          | Mobile             | Tablet+ (`sm:`)     | Weight       |
|------------------|--------------------|---------------------|--------------|
| Hero heading     | `text-2xl` (1.5rem)| `text-3xl` (1.875rem)| `font-bold`  |
| Section heading  | `text-lg` (1.125rem)| `text-xl` (1.25rem) | `font-bold`  |
| Card title       | `text-xl` (1.25rem)| —                   | `font-bold`  |
| Body text        | `text-base` (1rem) | `text-lg` (1.125rem)| normal       |
| Small text       | `text-sm` (0.875rem)| —                  | `font-medium`|
| Tiny text        | `text-xs` (0.75rem)| —                   | `font-semibold`|
| Avatar initials  | `text-3xl`         | `text-4xl`          | `font-black` |
| Name (h1)        | `text-3xl`         | `text-4xl`          | `font-black` |

### Line Height
- Body: `leading-relaxed` (1.625)
- Headings: `leading-none` (1)
- Default: `leading-tight` (1.25)

---

## 4. Shadows

3 shadow tokens, all pure black offset:

```css
--shadow-primary:            5px 6px 0px -1px #000000;
--shadow-secondary:          3px 3px 0px -1px #000000;
--shadow-secondary-opposite: -3px 3px 0px -1px #000000;
```

| Token              | Tailwind            | Usage                        |
|--------------------|---------------------|------------------------------|
| Primary            | `shadow-primary`    | Buttons (default, opposite)  |
| Secondary          | `shadow-secondary`  | Cards, product links         |
| Secondary Opposite | `shadow-secondary-opposite` | Special reversed items |

**Interaction rule:** Shadow collapses on hover/active → element translates by shadow offset.

---

## 5. Borders

| Property | Value               | Usage                    |
|----------|---------------------|--------------------------|
| Width    | `border-2` (2px)    | All interactive elements |
| Color    | `border-black`      | Primary border           |
| Radius   | `rounded-lg` (0.5rem)| Cards, items, inputs    |
| Radius   | `rounded-[6px]`     | Buttons only             |
| Radius   | `rounded-full`      | Avatar, badges, dots     |
| Dashed   | `border-2 border-dashed border-zinc-300` | Placeholders |

**Avatar border:** `border-[3px]` mobile → `border-[4px]` tablet.

---

## 6. Spacing

### Layout
| Element     | Mobile         | Tablet+ (`sm:`) |
|-------------|----------------|-----------------|
| Max width   | `max-w-2xl` (42rem) | —          |
| Horizontal  | `px-5` (1.25rem)| `px-6` (1.5rem)|
| Vertical    | `py-6` (1.5rem)| `py-8` (2rem)   |
| Section gap | `space-y-6`    | `space-y-8`     |

### Components
| Element       | Mobile      | Tablet+      |
|---------------|-------------|--------------|
| Card padding  | `p-4`       | `p-6`        |
| Item padding  | `p-3`       | `p-4`        |
| Skill padding | `p-2.5`     | `p-3`        |
| Item gap      | `gap-3`     | `gap-4`      |
| Content gap   | `space-y-3` | `space-y-4`  |

---

## 7. Components

### Button

6 variants. Base styles:
```
inline-flex items-center justify-center rounded-[6px]
whitespace-nowrap text-sm font-bold gap-2 cursor-pointer
disabled:pointer-events-none disabled:opacity-50
transition-all
```

| Variant            | BG          | Text         | Border              | Shadow           | Hover                                      |
|--------------------|-------------|--------------|---------------------|------------------|---------------------------------------------|
| `default`          | `blue-300`  | `black`      | `border-2 black`    | `shadow-primary` | `translate-x-[5px] translate-y-[5px] shadow-none` |
| `oppositeDefault`  | `white`     | `black`      | `border-2 black`    | `shadow-primary` | `translate-x-[5px] translate-y-[5px] shadow-none` |
| `noShadow`         | `blue-300`  | `black`      | `border-2 black`    | none             | `bg-blue-400` (500ms)                       |
| `oppositeNoShadow` | `white`     | `blue-400`   | `border-2 blue-400` | none             | `bg-blue-400 text-white` (500ms)            |
| `ghost`            | transparent | `black`      | none                | none             | `bg-blue-100` (300ms)                       |
| `link`             | transparent | `blue-500`   | none                | none             | `underline`                                 |

Sizes: `default` (h-10 px-4), `sm` (h-9 px-3), `lg` (h-12 px-8), `icon` (size-10)

### Card

```
rounded-lg border-2 border-black bg-blue-100 shadow-secondary py-6 px-6
```

Sub-components:
- **CardHeader:** `flex flex-col space-y-1.5 pb-4`
- **CardTitle:** `text-xl font-bold leading-none tracking-tight`
- **CardDescription:** `text-sm text-zinc-600`
- **CardContent:** unstyled wrapper
- **CardFooter:** `flex items-center pt-4`

### Product Link Item

```
flex items-center gap-3 sm:gap-4 p-3 sm:p-4
border-2 border-black rounded-lg bg-white shadow-secondary
active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
transition-all duration-150 group
```

Icon box: `w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 border-2 border-black rounded-lg`
Arrow: `group-hover:text-black group-hover:translate-x-1`

### Skill Item

```
flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3
border-2 border-black rounded-lg bg-white
```

Dot: `w-2 h-2 bg-blue-400 rounded-full`

### Section Divider

```
border-t-2 border-black pt-6 sm:pt-8
```

### macOS Window Header

```html
<div class="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
</div>
```

### Image Placeholder

```html
<div class="bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
    <div class="text-center">
        <div class="w-12 h-12 mx-auto mb-2 bg-white/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
            <ImageIcon class="w-6 h-6 text-blue-400" />
        </div>
        <p class="text-xs text-blue-400 font-medium">Image Coming Soon</p>
    </div>
</div>
```

### Navigation Link

Active: `text-black font-semibold`
Inactive: `text-zinc-500 hover:text-black transition-all duration-200`

### Status Badge

```
px-2 py-0.5 text-[10px] sm:text-xs font-bold border rounded-full
```

Apply status color from Status table above.

### Tag

```
px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold
bg-zinc-100 border border-zinc-300 rounded-full
```

---

## 8. Form Inputs (Admin)

### Text Input / Textarea / Select

```
w-full border-2 border-black rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-blue-300
```

### Label

```
block text-sm font-bold mb-1
```

### Sub-label (optional fields)

```
block text-xs font-bold mb-1 text-zinc-500
```

---

## 9. Animations

### Page Enter (Motion)
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

Staggered: `delay: 0.1 * index` cho lists, `0.2`, `0.3`, `0.4` cho sections.

### Button Press (Shadow Collapse)
```
hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none
```
Smaller version (cards/links): `active:translate-x-[3px] active:translate-y-[3px]`

### Arrow Slide
```
group-hover:translate-x-1 transition-all
```

### Grid Pattern Hover
```
hover:fill-blue-200/30 transition-all duration-100
[&:not(:hover)]:duration-1000  /* slow fade out */
```

---

## 10. Responsive Strategy

**Mobile-first.** Base = mobile, `sm:` (640px) = tablet+.

Key pattern:
```
text-base sm:text-lg       /* font scales up */
p-3 sm:p-4                 /* padding scales up */
gap-3 sm:gap-4             /* gap scales up */
space-y-6 sm:space-y-8     /* vertical rhythm scales up */
w-10 h-10 sm:w-12 sm:h-12  /* icons scale up */
hidden sm:inline            /* show extra info on tablet */
```

---

## 11. Background System

### Interactive Grid
- Fixed, behind content (`fixed inset-0 -z-10 opacity-50`)
- 40×30 squares, 50px each
- Hover: `fill-blue-200/30`
- Stroke: `stroke-gray-400/20`, width `0.3`

### Gradient Overlay
```
fixed inset-0 -z-10
bg-gradient-to-b from-white/80 via-white/60 to-white/80
pointer-events-none
```

### Custom Scrollbar
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #93C5FD; border: 2px solid black; }
::-webkit-scrollbar-thumb:hover { background: #60A5FA; }
```

### Text Selection
```css
::selection { background: rgb(147, 197, 253); color: black; }
```

---

## 12. Do's and Don'ts

### Do
- Dùng `border-2 border-black` cho mọi element tương tác
- Dùng `shadow-secondary` cho cards, `shadow-primary` cho buttons
- Dùng `bg-blue-100` cho card backgrounds
- Dùng `bg-white` cho items bên trong cards
- Dùng `rounded-lg` cho mọi thứ (trừ buttons: `rounded-[6px]`)
- Giữ animation nhẹ nhàng: fade + slide up
- Mobile-first, chỉ dùng `sm:` breakpoint

### Don't
- Không dùng gradient text
- Không dùng blur/glass morphism
- Không dùng border mỏng hơn 2px cho interactive elements
- Không dùng màu border khác ngoài black (trừ status badges, dashed placeholders)
- Không dùng shadow CSS thông thường — chỉ dùng 3 shadow tokens
- Không dùng border-radius lớn hơn `rounded-lg` (trừ `rounded-full` cho circles)
- Không quá 2 breakpoints (base + `sm:`)
