# Resources Directory

This project's frontend source code folder uses a traditional backend-based template engine (Edge.js). At the same time, it has an asset pipeline (Vite) built to manage various assets including Tailwind CSS, which is essential for modern frontend development.

Additionally, the **Hotwired stack (Stimulus, Turbo, etc.)** is configured to provide a **Single Page Application (SPA)**-like user experience in an MPA (Multi Page Application) environment.

## File Structure and Development Process

```
project-root/
├── views/                  # Edge.js templates
│   ├── components/         # Reusable Edge.js components
│   │   ├── layout/         # Layout components
│   │   └── uikit/          # UI kit components
│   └── pages/              # Page-specific templates
├── src/                    # JavaScript (Stimulus controllers, etc.)
│   ├── controllers/        # Stimulus controllers
│   └── tailwind.css        # Tailwind CSS stylesheet
├── public/
│   └── builds/             # Built assets (Vite output)
└── vite.config.js          # Vite configuration
```

## 🔧 Technology Stack Overview

### Hybrid Approach: Backend Template Engine + Modern Frontend Tools

This project is built based on the following philosophy:

- **Server-Side Rendering**: Easy and powerful template system through Edge.js
- **Modern Development Environment**: Simple asset pipeline construction through Vite
- **User Experience Optimization**: SPA-level interaction through Hotwired
- **Modern Design**: Utility-first styling through Tailwind CSS

---

## 📝 Edge.js Templates

**docs** → https://edgejs.dev/docs/introduction

### Key Syntax Examples
```edge
{{-- Variable output --}}
<h1>{{ title }}</h1>

{{-- Conditionals --}}
@if(user.authenticated)
  <p>Welcome, {{ user.name }}!</p>
@endif

{{-- Loops --}}
@each(item in items)
  <div class="item">{{ item.name }}</div>
@endeach

{{-- Component usage --}}
@component('components/button', { text: 'Click me' })
```

### Project Implementation
- `.edge` extension files located in `views/` folder
- Structured layout, component, and page-specific templates
- Efficient connection between backend data and frontend UI
 
### Edge.js Component System (views/components/)
Edge.js provides a powerful feature to use components **as tags**:

<sub>*Note: Works in the /components directory of Edge.js's default mount path.</sub>

#### Component Tag Rules
- Filename becomes tag name: `modal.edge` → `@modal()`
- Nested folders use dot notation: `form/input.edge` → `@form.input()`
- Underscores convert to camelCase: `tool_tip.edge` → `@toolTip()`

#### Usage Example
```edge
{{-- Component definition: views/components/card.edge --}}
<div class="bg-white rounded-lg shadow-md p-6">
  <h3 class="text-xl font-semibold mb-4">
    {{{ await $slots.header() }}}
  </h3>
  <div class="text-gray-600">
    {{{ await $slots.main() }}}
  </div>
</div>

{{-- Component usage --}}
@card()
  @slot('header')
    Product Introduction
  @end
  
  @slot('main')
    <p>This is a reusable card component.</p>
  @end
@end
```

---

## ⚡ Assets Pipeline By Vite

**docs** → https://vite.dev/guide/

## 🎨 Modern UI By Tailwind CSS

**docs** → https://tailwindcss.com/docs

---

## 🚀 SPA UX By Hotwired

**docs** → https://hotwired.dev/