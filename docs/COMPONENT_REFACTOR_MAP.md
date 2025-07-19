# 🧩 AuditoryX Component Refactor Map

**Purpose:** Detailed component-by-component refactoring specifications  
**Status:** Ready for Implementation  
**Last Updated:** December 2024

---

## 📁 File Structure & Component Map

### **Navigation & Layout Components**

#### **`components/Navbar.tsx`** - ⚠️ MAJOR REFACTOR NEEDED
**Current Issues:**
- Soft typography (Inter font)
- Rounded corners and gentle styling  
- Gradient usage
- Insufficient contrast

**Required Changes:**
```typescript
// BEFORE
<header className="w-full px-6 py-4 border-b border-gray-800 flex items-center justify-between">
  <h1 className="text-2xl font-extrabold text-white">
    Auditory<span className="text-blue-500">X</span>
  </h1>

// AFTER  
<header className="w-full px-8 py-6 border-b-4 border-white bg-black flex items-center justify-between">
  <h1 className="font-display text-4xl font-black text-white uppercase tracking-tight">
    AUDITORYX
  </h1>
```

**Styling Updates:**
- Font: Heavy display font (Druk/Space Grotesk 900)
- Border: 4px solid white bottom border
- Padding: Increased to 32px/24px
- Remove: Color accent on X, use pure white
- Transform: Uppercase text

---

#### **`components/Footer.tsx`** - ⚠️ MAJOR REFACTOR NEEDED
**Current Issues:**
- Standard social media icons
- Soft hover effects
- Rounded social links

**Required Changes:**
```typescript
// BEFORE
<footer className="bg-black text-white py-8">
  <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between">

// AFTER
<footer className="bg-black border-t-4 border-white text-white py-12">
  <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
```

**Styling Updates:**  
- Layout: Grid-based rigid structure
- Border: 4px white top border
- Links: Uppercase, monospace font
- Spacing: Increased padding and gaps
- Remove: Soft hover transitions

---

#### **`components/Hero.tsx`** - ⚠️ COMPLETE REDESIGN NEEDED
**Current Issues:**
- Gradient backgrounds
- Soft, refined typography
- Standard button styling

**Required Changes:**
```typescript
// BEFORE
<section className="text-center text-neutral-light py-24 bg-gradient-to-b from-neutral-dark to-black">
  <h1 className="text-5xl font-bold">
    Auditory<span className="text-blue-500">X</span> Open Network
  </h1>

// AFTER
<section className="text-center bg-black py-32 border-b-4 border-white">
  <h1 className="font-display text-8xl font-black text-white uppercase tracking-tighter mb-8">
    AUDITORYX
  </h1>
  <p className="font-display text-2xl font-bold text-white uppercase tracking-wide mb-12">
    OPEN NETWORK
  </p>
```

**Styling Updates:**
- Background: Pure black, no gradients
- Typography: Massive display text (8xl/6rem+)
- Transform: All uppercase
- Spacing: Dramatic vertical rhythm
- Border: Sharp white border separator

---

### **Content & Data Components**

#### **`components/ServiceCard.tsx`** - ⚠️ MAJOR REFACTOR NEEDED  
**Current Issues:**
- Rounded corners (rounded-lg)
- Soft border colors
- Gentle hover effects
- Standard button styling

**Required Changes:**
```typescript
// BEFORE
<div className="border border-gray-700 p-4 rounded-lg bg-gray-900 text-white space-y-2">
  <h3 className="text-xl font-bold">{service.serviceName}</h3>
  <button className="btn btn-primary w-full mt-2">

// AFTER  
<div className="border-2 border-white bg-zinc-950 text-white p-8 shadow-brutal hover:shadow-brutal-lg transition-all duration-100 hover:-translate-x-1 hover:-translate-y-1">
  <h3 className="font-display text-2xl font-black uppercase tracking-tight mb-4">{service.serviceName}</h3>
  <button className="btn-brutalist w-full mt-6">
```

**Styling Updates:**
- Borders: 2px solid white, sharp corners
- Background: Very dark (#0a0a0a) instead of gray-900  
- Shadow: Brutal box-shadow effect
- Hover: Sharp translate movement
- Typography: Heavy display font for titles
- Buttons: Brutalist button system

---

#### **`components/Services.tsx`** - ✅ STRUCTURE OK, STYLING UPDATE
**Current Issues:**
- Uses ServiceCard component (needs update)
- Grid layouts need rigid spacing

**Required Changes:**
- Update to use new ServiceCard styling
- Implement rigid grid spacing (32px gaps minimum)
- Sharp container edges

---

### **User Interface Components**

#### **`components/ui/DragDropUpload.tsx`** - ⚠️ MODERATE REFACTOR
**Current Issues:**
- Basic border styling
- Standard input styling
- Soft upload feedback

**Required Changes:**
```typescript
// BEFORE  
<div className='border p-4 rounded'>
  <input className='mb-2' />

// AFTER
<div className='border-2 border-white p-8 bg-zinc-950'>
  <input className='input-brutalist mb-4' />
  <div className='grid grid-cols-2 gap-4'>
```

**Styling Updates:**
- Border: 2px solid white  
- Background: Dark theme consistent
- Input: Brutalist input styling
- Grid: Rigid 2-column layout
- Spacing: Increased padding

---

#### **`components/ui/XpProgressBar.tsx`** - ⚠️ MAJOR REFACTOR
**Current Issues:**
- Rounded progress bar
- Soft animations
- Standard colors

**Required Changes:**
```typescript
// Create angular progress bar
<div className="progress-brutalist">
  <div 
    className="progress-brutalist-fill" 
    style={{ width: `${progress}%` }}
  />
</div>
```

**Styling Updates:**
- Shape: Sharp rectangular progress bar
- Animation: Step-based instead of smooth
- Colors: White fill on black background
- Height: Increased for visibility

---

### **Form Components**

#### **`components/BookingForm.tsx`** - ⚠️ MAJOR REFACTOR  
**Current Issues:**
- Standard form styling
- Soft input borders
- Rounded form elements

**Required Changes:**
```typescript
// All inputs need brutalist styling
<input className="input-brutalist" />
<select className="select-brutalist" />
<textarea className="textarea-brutalist" />
<button className="btn-brutalist" />
```

**Styling Updates:**
- Inputs: Sharp borders, high contrast
- Labels: Uppercase, monospace font
- Buttons: Brutalist button system
- Layout: Rigid grid-based form layout

---

#### **`components/forms/`** - ⚠️ ALL FORMS NEED UPDATE
**Components Affected:**
- All form components in forms/ directory
- AvailabilityForm.tsx
- EditProfileForm.tsx
- ServiceForm.tsx
- ServiceSubmissionForm.tsx

**Universal Changes:**
- Sharp input styling
- Angular form layouts
- Brutalist button styling
- High contrast focus states

---

### **Business Logic Components**

#### **`components/BookingsViewer.tsx`** - ✅ STRUCTURE OK
**Required Changes:**
- Update data display cards to brutalist styling
- Sharp table/list layouts
- Angular status indicators

#### **`components/StripeCheckout.tsx`** - ✅ MINIMAL UPDATE
**Required Changes:**  
- Update container styling to match theme
- Brutalist button for checkout action
- Sharp form field styling

---

### **Page-Level Components** 

#### **`src/app/page.tsx`** (Homepage) - ⚠️ MAJOR UPDATE
**Current Issues:**
- Gradient hero section
- Soft feature cards
- Rounded creator profile cards

**Required Changes:**
```typescript  
// Hero section
<section className="bg-black border-b-4 border-white py-32">
  <h1 className="font-display text-8xl font-black text-white uppercase text-center">

// Feature cards  
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="card-brutalist">
```

**Styling Updates:**
- Remove all gradients
- Update all cards to brutalist styling
- Heavy typography throughout
- Sharp section dividers

---

#### **Admin Components** - ⚠️ MODERATE UPDATE
**Components:**
- `src/app/admin/components/AdminNavbar.tsx`
- `src/app/admin/components/ModerationPanel.tsx`

**Required Changes:**
- Sharp admin interface styling
- Angular data tables
- Brutalist action buttons
- High contrast status indicators

---

## 🎨 New Component Classes Needed

### **Brutalist Button System**
```css
.btn-brutalist {
  background: #FFFFFF;
  color: #000000;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  padding: 16px 32px;
  font: 800 14px/1 'JetBrains Mono', monospace;
  text-transform: UPPERCASE;
  letter-spacing: 0.1em;
  box-shadow: 4px 4px 0 #333333;
  transition: all 0.1s ease;
}

.btn-brutalist:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #333333;
}

.btn-brutalist-secondary {
  background: transparent;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
}
```

### **Brutalist Card System**
```css
.card-brutalist {
  background: #0a0a0a;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  padding: 32px;
  box-shadow: 4px 4px 0 #333333;
  transition: all 0.1s ease;
}

.card-brutalist:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #333333;
}

.shadow-brutal {
  box-shadow: 4px 4px 0 #333333;
}

.shadow-brutal-lg {
  box-shadow: 8px 8px 0 #333333;
}
```

### **Brutalist Input System**
```css  
.input-brutalist {
  background: #000000;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  color: #FFFFFF;
  padding: 16px;
  font: 400 16px/1.4 'Inter', sans-serif;
  transition: all 0.1s ease;
}

.input-brutalist:focus {
  outline: none;
  border-color: #FFFFFF;
  box-shadow: 4px 4px 0 #333333;
  transform: translate(-1px, -1px);
}
```

### **Typography Classes**
```css
.font-display {
  font-family: 'Space Grotesk', 'Arial Black', sans-serif;
}

.heading-brutalist-xl { 
  font: 900 4rem/0.9 var(--font-display);
  text-transform: UPPERCASE;
  letter-spacing: -0.02em;
}

.heading-brutalist-lg { 
  font: 800 2.5rem/1 var(--font-display);
  text-transform: UPPERCASE;
}

.text-brutalist { 
  font: 600 1rem/1.4 var(--font-display);
  text-transform: UPPERCASE;
  letter-spacing: 0.05em;
}
```

---

## ⚡ Priority Implementation Order

### **Phase 1: Core Foundation**
1. **Typography System** - Install fonts, create classes
2. **Brutalist CSS System** - Core variables and components
3. **Navbar.tsx** - Most visible component
4. **Hero.tsx** - Homepage impact

### **Phase 2: Content Components**  
1. **ServiceCard.tsx** - Used throughout platform
2. **Button System** - Universal component
3. **Form Components** - User interaction critical
4. **Footer.tsx** - Complete the foundation

### **Phase 3: Page Implementation**
1. **Homepage** - Primary user entry point
2. **Explore Page** - Core functionality  
3. **Dashboard** - User management interface
4. **Admin Components** - Platform management

---

## 🔍 Quality Assurance Checklist

### **Visual Compliance**
- [ ] Pure black backgrounds (#000 or #0e0e0e)
- [ ] Sharp edges (border-radius: 0) throughout
- [ ] Heavy typography (700+ font weights)
- [ ] Dramatic shadows and hover effects
- [ ] High contrast (white on black primary)

### **Technical Compliance**  
- [ ] Consistent CSS class naming
- [ ] Performance optimized
- [ ] Responsive across breakpoints
- [ ] Accessibility maintained (WCAG 2.1 AA)
- [ ] Cross-browser tested

### **User Experience**
- [ ] Sharp, immediate interactions
- [ ] Clear visual hierarchy
- [ ] Consistent brutalist patterns
- [ ] Maintained functionality
- [ ] Premium aesthetic feel

---

*This component map provides detailed specifications for transforming each component to match the brutalist premium aesthetic while maintaining all functional requirements.*