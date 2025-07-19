# AuditoryX Brutalist Design System Guide

This document provides guidance on using the brutalist design system components implemented for AuditoryX.

## Design Principles

### 1. Typography
- **Primary Font**: Space Grotesk (700-900 weights) for display text
- **Monospace Font**: JetBrains Mono (400-800 weights) for UI elements
- **Text Transform**: UPPERCASE for headings, buttons, and labels
- **Heavy Weights**: Use 700+ font weights only for display elements

### 2. Color Palette
```css
--brutalist-black: #000000    /* Primary background */
--brutalist-dark: #0e0e0e     /* Secondary background */
--brutalist-white: #ffffff    /* Text and accents */
--brutalist-gray: #333333     /* Shadows and borders */
```

### 3. Layout & Spacing
- **Sharp Edges**: All components use `border-radius: 0`
- **Dramatic Shadows**: Hard shadows using `box-shadow: 4px 4px 0 #333333`
- **Rigid Spacing**: Architectural grid layouts with consistent gaps
- **High Contrast**: Pure black/white contrast focus

## Typography Classes

### Display Headings
```jsx
<h1 className="heading-brutalist-xl">MAIN TITLE</h1>     // 4rem, 900 weight
<h2 className="heading-brutalist-lg">SECTION TITLE</h2>  // 2.5rem, 800 weight  
<h3 className="heading-brutalist-md">SUBSECTION</h3>     // 1.875rem, 800 weight
<h4 className="heading-brutalist-sm">LABEL</h4>          // 1.25rem, 700 weight
```

### Body Text
```jsx
<p className="text-brutalist">MAIN TEXT</p>              // Space Grotesk, 600 weight
<span className="text-brutalist-mono">UI LABEL</span>    // JetBrains Mono, 700 weight
```

## Button System

### Primary Buttons
```jsx
<button className="btn-brutalist">MAIN ACTION</button>
<button className="btn-brutalist-lg">LARGE ACTION</button>
<button className="btn-brutalist-sm">SMALL ACTION</button>
```

### Secondary Buttons
```jsx
<button className="btn-brutalist-secondary">SECONDARY ACTION</button>
```

### Using the Button Component
```jsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="lg">MAIN ACTION</Button>
<Button variant="secondary">SECONDARY ACTION</Button>
```

## Form Elements

### Input Fields
```jsx
<input className="input-brutalist" placeholder="ENTER TEXT" />
<textarea className="textarea-brutalist" placeholder="ENTER MESSAGE" />
<select className="select-brutalist">
  <option>OPTION 1</option>
  <option>OPTION 2</option>
</select>
```

### Form Layout
```jsx
<div className="card-brutalist spacing-brutalist-md">
  <h3 className="heading-brutalist-sm mb-6">FORM TITLE</h3>
  <div className="space-y-6">
    <input className="input-brutalist" placeholder="FIELD 1" />
    <input className="input-brutalist" placeholder="FIELD 2" />
    <button className="btn-brutalist w-full">SUBMIT</button>
  </div>
</div>
```

## Card System

### Basic Cards
```jsx
<div className="card-brutalist spacing-brutalist-md">
  <h3 className="heading-brutalist-sm mb-4">CARD TITLE</h3>
  <p className="text-brutalist-mono opacity-80">Card content goes here</p>
</div>
```

### Interactive Cards
```jsx
<div className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
  <!-- Card content with hover effects -->
</div>
```

## Layout Components

### Grid Layouts
```jsx
<div className="grid-brutalist grid-cols-1 md:grid-cols-3">
  <div className="card-brutalist">Item 1</div>
  <div className="card-brutalist">Item 2</div>
  <div className="card-brutalist">Item 3</div>
</div>
```

### Navigation
```jsx
<header className="nav-brutalist">
  <h1 className="heading-brutalist-lg">AUDITORYX</h1>
  <nav className="flex gap-6">
    <Link href="/about" className="nav-brutalist-link">ABOUT</Link>
    <Link href="/services" className="nav-brutalist-link">SERVICES</Link>
  </nav>
</header>
```

## Spacing System

### Padding Classes
```jsx
<div className="spacing-brutalist-sm">  // 24px padding</div>
<div className="spacing-brutalist-md">  // 32px padding</div>
<div className="spacing-brutalist-lg">  // 48px padding</div>
<div className="spacing-brutalist-xl">  // 64px padding</div>
```

## Shadow & Hover Effects

### Shadow Utilities
```jsx
<div className="shadow-brutal">     // 4px 4px 0 #333333</div>
<div className="shadow-brutal-lg">  // 6px 6px 0 #333333</div>
<div className="shadow-brutal-xl">  // 8px 8px 0 #333333</div>
```

### Hover Effects
```jsx
<div className="hover-brutal">
  <!-- Element with dramatic hover animation -->
</div>
```

## Progress Elements

### Progress Bars
```jsx
<div className="progress-brutalist">
  <div className="progress-brutalist-fill" style={{width: '60%'}} />
</div>
```

### XP Progress Component
```jsx
import XpProgressBar from '@/components/ui/XpProgressBar';

<XpProgressBar 
  currentXp={750}
  nextTierXp={1000}
  currentTier="standard"
/>
```

## Responsive Design

### Breakpoint Classes
The brutalist system includes responsive adjustments:
- Mobile: Reduced font sizes and padding
- Tablet: Standard sizing
- Desktop: Full brutalist scale

### Mobile-First Approach
```jsx
<h1 className="heading-brutalist-xl">  // Automatically scales down on mobile</h1>
<div className="spacing-brutalist-xl">  // Reduces to 48px on mobile</div>
```

## Color Usage Guidelines

### Backgrounds
- Use `bg-brutalist-black` for primary sections
- Use `bg-brutalist-dark` for card backgrounds
- Never use gradients or soft colors

### Text Colors
- Primary text: `text-white` (default in brutalist classes)
- Secondary text: Use `opacity-80` or `opacity-60`
- Accent text: `text-white` with bold typography

### Borders
- Always use `border-white` with 2px or 4px thickness
- Use `border-brutalist` utility for consistent 2px white borders

## Accessibility Considerations

### Contrast
- All text maintains WCAG AA contrast standards
- Pure black/white combination ensures maximum readability

### Interactive Elements
- Minimum touch target size of 44px maintained
- Clear focus states with sharp outlines
- Dramatic hover effects provide clear feedback

### Typography
- Heavy fonts ensure readability
- Uppercase text used judiciously to avoid accessibility issues
- Proper heading hierarchy maintained

## Component Examples

### Service Card
```jsx
<div className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
  <h3 className="heading-brutalist-sm mb-4">SERVICE NAME</h3>
  <p className="text-brutalist-mono mb-4 opacity-80">Service description</p>
  <div className="flex justify-between mb-4">
    <span className="text-brutalist-mono">PRICE: $500</span>
    <span className="text-brutalist">⭐ 4.9 (247)</span>
  </div>
  <button className="btn-brutalist w-full">BOOK NOW</button>
</div>
```

### Modal/Dialog
```jsx
<div className="overlay-brutalist fixed inset-0 flex items-center justify-center">
  <div className="modal-brutalist spacing-brutalist-lg max-w-md">
    <h2 className="heading-brutalist-md mb-6">CONFIRM ACTION</h2>
    <p className="text-brutalist-mono mb-8">Are you sure you want to proceed?</p>
    <div className="flex gap-4">
      <button className="btn-brutalist-secondary">CANCEL</button>
      <button className="btn-brutalist">CONFIRM</button>
    </div>
  </div>
</div>
```

## Performance Considerations

### Font Loading
- Space Grotesk and JetBrains Mono loaded with `display=swap`
- Critical fonts preloaded for performance
- Fallback fonts maintain brutalist appearance

### CSS Optimization
- Brutalist system CSS is modular and can be tree-shaken
- Critical styles inlined for above-the-fold content
- Transitions kept minimal (100ms) for immediate feedback

## Migration Guidelines

### Converting Existing Components
1. Replace rounded corners with sharp edges
2. Update font families to Space Grotesk/JetBrains Mono
3. Convert soft shadows to brutal box shadows
4. Transform text to uppercase for headers/buttons
5. Update color palette to pure black/white

### Class Replacement Map
```
Old Class                 → New Class
----------------------------|---------------------------
rounded-lg                → (remove - sharp edges only)
bg-gray-900               → bg-brutalist-dark
text-xl font-bold         → heading-brutalist-sm
btn btn-primary          → btn-brutalist
input-base               → input-brutalist
shadow-lg                → shadow-brutal
```

This design system ensures consistency across the AuditoryX platform while maintaining the bold, architectural aesthetic of brutalist design.