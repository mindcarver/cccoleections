# DESIGN.md - AI Tools Collection

**Inspired by**: Notion - Warm minimalism, serif headings, soft surfaces  
**Adapted for**: AI Tools Collection showcase website

---

## 1. Visual Theme & Atmosphere

**Mood**: Clean, functional, content-first, warm minimalism  
**Density**: Airy and breathable, maximum content clarity  
**Design Philosophy**: "The interface should disappear, leaving only the content"

- **Primary Vibe**: Simple, functional, unpretentious
- **Content Focus**: Information takes absolute precedence
- **Emotional Tone**: Calm, organized, productive
- **Visual Language**: Minimal decoration, maximum readability

---

## 2. Color Palette & Roles

### Primary Colors
```css
/* Neutral Foundation - Notion-inspired minimalism */
--text-primary: #37352F;          /* Near-black for main content */
--text-secondary: #787774;        /* Medium gray for supporting text */
--text-tertiary: #9B9A97;         /* Light gray for metadata */
--text-placeholder: #D3D1CB;      /* Placeholder text */

### Background Colors
--bg-primary: #FFFFFF;            /* Pure white canvas */
--bg-secondary: #F7F6F3;          /* Subtle warm gray (Notion's signature) */
--bg-tertiary: #EFEFEF;           /* Hover states, subtle borders */
--bg-hover: #EFEFEF;              /* Interactive hover states */
--bg-active: #E3E2E0;             /* Active/pressed states */

### Accent Colors (Minimal use)
--accent-primary: #2383E2;        /* Notion blue - links, primary actions */
--accent-hover: #1A6FB0;          /* Darker blue for hover */
--accent-light: #EBF5FF;          /* Light blue for backgrounds */

### Semantic Colors
--success: #0F7B6C;               /* Green for success states */
--warning: #D9730D;               /* Orange for warnings */
--error: #E03E3E;                 /* Red for errors */
--info: #0F7B6C;                  /* Teal for information */

### Border & Dividers
--border-subtle: #E9E9E7;         /* Very subtle borders */
--border-medium: #D3D1CB;         /* Medium contrast borders */
--shadow-subtle: rgba(15, 15, 15, 0.04);  /* Extremely subtle shadows */
```

**Color Philosophy**: 
- **Content First**: Near-black text on white backgrounds for maximum readability
- **Minimal Accent**: Blue used sparingly for links and key interactions
- **Warm Grays**: Slightly warm gray backgrounds (#F7F6F3) reduce eye strain
- **High Contrast**: 15:1+ contrast ratio for accessibility
- **No Decoration**: Colors serve function, not decoration

---

## 3. Typography Rules

### Font Families
```css
/* Primary - Content First */
--font-primary: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', sans-serif;

/* Secondary - Headings with character */
--font-heading: 'Segoe UI', 'Helvetica Neue', 'Georgia', serif;

/* Monospace - Code/Technical */
--font-mono: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
```

### Type Scale

| Element | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|-------------|------|--------|-------------|----------------|--------|
| **H1 - Page Title** | Heading | 40px | 700 | 1.2 | -0.02em | Main page title |
| **H2 - Section Title** | Heading | 32px | 600 | 1.3 | -0.01em | Major sections |
| **H3 - Subsection** | Primary | 24px | 600 | 1.3 | 0 | Sub-headers |
| **H4 - Group Title** | Primary | 18px | 600 | 1.4 | 0 | Card titles, groups |
| **Body Large** | Primary | 16px | 400 | 1.5 | 0 | Lead paragraphs |
| **Body Base** | Primary | 14px | 400 | 1.5 | 0 | Main content |
| **Body Small** | Primary | 13px | 400 | 1.5 | 0 | Secondary text |
| **Caption** | Primary | 12px | 400 | 1.4 | 0 | Metadata, tags |
| **Code Inline** | Mono | 13px | 400 | 1.5 | 0 | Technical terms |
| **Button** | Primary | 14px | 500 | 1 | 0 | Interactive elements |

**Typography Principles**:
- **System Fonts First**: Fast loading, native feel
- **Tight Headings**: Negative letter spacing for large headings
- **Optimized Line Height**: 1.5 for body text, 1.2-1.3 for headings
- **Hierarchical Contrast**: Clear size differences between levels
- **Maximum Readability**: 14-16px body text, never smaller than 12px

---

## 4. Component Stylings

### Buttons
```css
/* Primary Button - Minimalist */
.btn-primary {
  background: var(--text-primary);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: var(--text-secondary);
}

/* Secondary Button - Ghost style */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 4px;
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* Link Button - Text-only */
.btn-link {
  background: transparent;
  color: var(--accent-primary);
  padding: 0;
  border-radius: 0;
  text-decoration: none;
}

.btn-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}
```

### Cards
```css
/* Content Card - Minimalist */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 16px;
  box-shadow: var(--shadow-subtle);
  transition: background 0.15s ease;
}

.card:hover {
  background: var(--bg-hover);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.card-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
```

### Inputs & Forms
```css
/* Minimalist Input */
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1);
}

.input::placeholder {
  color: var(--text-placeholder);
}
```

### Tags & Badges
```css
/* Simple Tag */
.tag {
  display: inline-block;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 2px;
}

.tag-blue {
  background: var(--accent-light);
  color: var(--accent-primary);
}

.tag-gray {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* Status Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.badge-success {
  background: rgba(15, 123, 108, 0.1);
  color: var(--success);
}

.badge-new {
  background: rgba(35, 131, 226, 0.1);
  color: var(--accent-primary);
}
```

### Navigation
```css
/* Minimal Navigation */
.nav {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-subtle);
  padding: 12px 0;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.nav-link:hover,
.nav-link.active {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Language Switcher - Minimal */
.lang-switcher {
  display: flex;
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 2px;
}

.lang-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  border-radius: 3px;
  cursor: pointer;
}

.lang-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

---

## 5. Layout Principles

### Spacing Scale
```css
--space-xs: 2px;      /* Tight spacing */
--space-sm: 4px;      /* Small gaps */
--space-md: 8px;      /* Default spacing */
--space-lg: 12px;     /* Component spacing */
--space-xl: 16px;     /* Section spacing */
--space-2xl: 24px;    /* Large sections */
--space-3xl: 32px;    /* Page margins */
```

### Grid System
```css
/* Content Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
}

/* Cards Grid */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

/* List Layout */
.list-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
```

### Whitespace Philosophy
- **Functional Margins**: Only as much whitespace as needed
- **Compact but Clear**: 8-16px spacing between elements
- **Content Density**: Higher information density than typical designs
- **Vertical Rhythm**: Consistent 8px spacing scale
- **No Wasted Space**: Every pixel serves a purpose

---

## 6. Depth & Elevation

### Shadow System
```css
--shadow-none: none;
--shadow-subtle: 0 1px 2px rgba(15, 15, 15, 0.04);     /* Barely visible */
--shadow-medium: 0 2px 8px rgba(15, 15, 15, 0.08);    /* Modals, dropdowns */
--shadow-strong: 0 8px 16px rgba(15, 15, 15, 0.12);   /* Floating elements */
```

### Surface Hierarchy
1. **Base Canvas**: `background: var(--bg-primary)` - No shadow
2. **Subtle Sections**: `background: var(--bg-secondary)` - No shadow
3. **Cards**: `background: var(--bg-primary)` - Subtle shadow
4. **Modals**: `background: var(--bg-primary)` - Medium shadow
5. **Tooltips**: `background: var(--text-primary)` - Strong shadow

**Elevation Rules**:
- **Minimal Shadows**: Shadows are barely noticeable
- **Focus on Borders**: Use borders more than shadows for separation
- **Flat Design**: Prefer flat design with subtle depth
- **Hover Effects**: Background color changes over shadow changes

---

## 7. Do's and Don'ts

### ✅ DO
- **Use system fonts** - Fast, native, familiar
- **Prioritize content** - Information over decoration
- **Minimal shadows** - Subtle depth, not dramatic
- **High contrast** - Black text on white backgrounds
- **Simple borders** - 1px solid, subtle colors
- **Compact spacing** - 8px scale, efficient use of space
- **Square corners** - 4px radius maximum
- **Fast transitions** - 0.15s for instant feedback

### ❌ DON'T
- **Overuse blue accent** - Only for links and key actions
- **Large shadows** - Keep shadows barely visible
- **Excessive whitespace** - Space is valuable, use efficiently
- **Decorative elements** - Every element must serve a purpose
- **Bold colors** - Stick to grayscale with minimal accent
- **Large border radius** - 4px maximum, prefer square
- **Slow animations** - Fast transitions for snappy feel
- **Marketing-style design** - This is a tool, not a landing page

---

## 8. Responsive Behavior

### Breakpoints
```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Desktops */
```

### Mobile Adaptations
```css
/* Stack content on mobile */
@media (max-width: 768px) {
  .grid-cards {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
  
  .card {
    padding: 12px;
  }
  
  /* Adjust type scale */
  .card-title {
    font-size: 16px;
  }
  
  /* Stack navigation */
  .nav {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
```

### Touch Targets
- **Minimum size**: 44×44px for interactive elements
- **Spacing**: At least 8px between targets
- **Visual feedback**: Immediate background color change
- **No hover on mobile**: Use active states instead

---

## 9. Agent Prompt Guide

### Quick Color Reference
```
Primary text: #37352F (near-black)
Secondary text: #787774 (medium gray)
Backgrounds: #FFFFFF, #F7F6F3 (warm gray)
Accent blue: #2383E2 (sparingly)
Success: #0F7B6C | Warning: #D9730D | Error: #E03E3E
Borders: #E9E9E7, #D3D1CB
```

### Ready-to-Use Prompts

**For New Components**:
```
"Create a [component name] following Notion's minimalist design:
- Use near-black text (#37352F) on white backgrounds
- System fonts, 4px max border radius
- Minimal shadows (0.04 opacity) or no shadows
- 8px spacing scale, compact but clear
- Blue accent (#2383E2) used sparingly
- Fast 0.15s transitions, snappy feel"
```

**For Layouts**:
```
"Design a content-focused layout with:
- High information density, minimal whitespace
- 1200px max-width container, centered
- Card grid with 8px gaps, min 300px cards
- Subtle gray backgrounds (#F7F6F3) for contrast
- Typography: 40px H1, 32px H2, 14px body
- Function over form, every pixel serves purpose"
```

**For Interactive Elements**:
```
"Build minimalist components with:
- Fast 0.15s transitions for instant feedback
- Background color changes on hover/active
- 2px blue ring on focus (#2383E2)
- Touch targets minimum 44×44px
- Clear visual feedback, no decorative effects"
```

### Design Checklist
- [ ] System fonts only
- [ ] High contrast text (15:1+)
- [ ] Minimal shadows (0.04 opacity)
- [ ] 4px max border radius
- [ ] 8px spacing scale
- [ ] Blue accent used sparingly
- [ ] Fast transitions (0.15s)
- [ ] Content-first layout
- [ ] Mobile-responsive grid
- [ ] Touch targets ≥44px

---

**Implementation Notes**:
- This design system prioritizes function over form
- Notion-style minimalism reduces cognitive load
- High information density without clutter
- Works exceptionally well for content-heavy interfaces
- Mobile-first approach ensures accessibility

**Version**: 2.0 (Notion-inspired)  
**Last Updated**: 2025-01-26  
**Maintained By**: AI Tools Collection Team