# Rockhopper Design System Implementation (Tailwind CSS v4)

This document outlines the implementation of the Rockhopper design system in the Excel Addin Remover application using Tailwind CSS v4.

## Overview

The application has been updated to follow the Rockhopper design system specifications from Figma, implemented entirely with Tailwind CSS v4:

- **Colors**: Primary blue (#3C6FF6), success green (#12B76A), error red (#F04438), and neutral grays
- **Typography**: Inter for body text, Poppins for headings
- **Spacing**: Consistent spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px)
- **Border Radius**: 4px, 6px, 8px, 12px, 16px, 24px, and full rounded
- **Shadows**: Light, medium, large, and extra large shadow variants
- **Components**: Reusable UI components following design system patterns

## Tailwind v4 Configuration

The design system is implemented using Tailwind CSS v4's new `@theme` directive in `app/globals.css`. This replaces the traditional `tailwind.config.ts` file.

### Theme Variables

```css
@import "tailwindcss";

@theme {
  /* Rockhopper Design System Colors */
  --color-primary-50: #F0F4FE;
  --color-primary-100: #E0E9FD;
  --color-primary-200: #C1D3FB;
  --color-primary-300: #A2BDF9;
  --color-primary-400: #83A7F7;
  --color-primary-500: #3C6FF6;
  --color-primary-600: #1D4DE2;
  --color-primary-700: #1A45CB;
  --color-primary-800: #173DB4;
  --color-primary-900: #14359D;

  --color-success-50: #F0FDF4;
  --color-success-100: #DCFCE7;
  --color-success-200: #BBF7D0;
  --color-success-300: #86EFAC;
  --color-success-400: #4ADE80;
  --color-success-500: #12B76A;
  --color-success-600: #039855;
  --color-success-700: #047857;
  --color-success-800: #065F46;
  --color-success-900: #064E3B;

  --color-error-50: #FEF2F2;
  --color-error-100: #FEE2E2;
  --color-error-200: #FECACA;
  --color-error-300: #FCA5A5;
  --color-error-400: #F87171;
  --color-error-500: #F04438;
  --color-error-600: #7A271A;
  --color-error-700: #DC2626;
  --color-error-800: #B91C1C;
  --color-error-900: #991B1B;

  --color-warning-50: #FFFBEB;
  --color-warning-100: #FEF3C7;
  --color-warning-200: #FDE68A;
  --color-warning-300: #FCD34D;
  --color-warning-400: #FBBF24;
  --color-warning-500: #F97066;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;
  --color-warning-800: #92400E;
  --color-warning-900: #78350F;

  --color-gray-50: #F9FAFB;
  --color-gray-100: #F2F4F7;
  --color-gray-200: #EAECF0;
  --color-gray-300: #D0D5DD;
  --color-gray-400: #98A2B3;
  --color-gray-500: #667085;
  --color-gray-600: #475467;
  --color-gray-700: #344054;
  --color-gray-800: #1D2939;
  --color-gray-900: #101828;

  /* Keep default colors */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-transparent: transparent;
  --color-current: currentColor;

  /* Font Families */
  --font-family-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-display: var(--font-poppins), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Font Sizes */
  --text-xs: 12px;
  --text-xs--line-height: 1.5;
  --text-sm: 13px;
  --text-sm--line-height: 1.538;
  --text-base: 14px;
  --text-base--line-height: 1.5;
  --text-lg: 16px;
  --text-lg--line-height: 1.5;
  --text-xl: 18px;
  --text-xl--line-height: 1.556;
  --text-2xl: 24px;
  --text-2xl--line-height: 1.5;
  --text-3xl: 30px;
  --text-3xl--line-height: 1.5;
  --text-4xl: 36px;
  --text-4xl--line-height: 1.5;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  --spacing-4xl: 48px;

  /* Container Sizes */
  --container-xs: 20rem;
  --container-sm: 24rem;
  --container-md: 28rem;
  --container-lg: 32rem;
  --container-xl: 36rem;
  --container-2xl: 42rem;
  --container-3xl: 48rem;
  --container-4xl: 56rem;
  --container-5xl: 64rem;
  --container-6xl: 72rem;
  --container-7xl: 80rem;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;

  /* Box Shadows */
  --shadow-sm: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  --shadow-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg: 0px 20px 25px -5px rgba(16, 24, 40, 0.1), 0px 10px 10px -5px rgba(16, 24, 40, 0.04);
  --shadow-xl: 0px 25px 50px -12px rgba(16, 24, 40, 0.25);

  /* Letter Spacing */
  --tracking-wide: 0.02em;
}
```

### PostCSS Configuration

The project uses the correct PostCSS configuration for v4:

```javascript
// postcss.config.mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

### Key Differences from v3

1. **No config file**: Tailwind v4 uses CSS `@theme` directive instead of `tailwind.config.ts`
2. **Theme variables**: All design tokens are defined as CSS custom properties
3. **Automatic utility generation**: Tailwind automatically generates utility classes from theme variables
4. **Better performance**: Only used utilities are included in the final CSS
5. **PostCSS plugin**: Uses `@tailwindcss/postcss` instead of `tailwindcss`
6. **Import statement**: Uses `@import "tailwindcss"` instead of `@tailwind` directives

### v4 Upgrade Compliance

This implementation follows the [Tailwind CSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide#adding-custom-utilities) requirements:

✅ **PostCSS Configuration**: Correctly uses `@tailwindcss/postcss` plugin
✅ **Import Statement**: Uses `@import "tailwindcss"` instead of `@tailwind` directives
✅ **Theme Variables**: Uses `@theme` directive with CSS custom properties
✅ **Default Colors**: Includes default colors (`white`, `black`, `transparent`, `current`)
✅ **No Arbitrary Values**: Components use semantic class names instead of arbitrary values
✅ **No Deprecated Utilities**: No usage of deprecated v3 utilities
✅ **Container Variables**: Properly defines `--container-*` variables for max-width utilities

## Components

All components are built using Tailwind CSS v4 classes and follow the Rockhopper design system patterns.

### Button
- **Variants**: Primary, Secondary, Danger, Success
- **Sizes**: Small, Medium, Large
- **States**: Default, Hover, Disabled

```tsx
<Button variant="primary" size="medium">
  Click me
</Button>
```

### Card
- **Structure**: Header, Body, Footer
- **Styling**: White background, subtle shadow, rounded corners
- **Usage**: Content containers, forms, lists

```tsx
<Card>
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

### Badge
- **Variants**: Primary, Secondary, Success, Error, Muted
- **Usage**: Status indicators, counts, labels

```tsx
<Badge variant="primary">5</Badge>
```

### Alert
- **Variants**: Success, Error, Warning, Info
- **Features**: Icons, titles, descriptions
- **Usage**: Notifications, feedback messages

```tsx
<Alert variant="success" title="Success">
  Operation completed successfully
</Alert>
```

## Usage Examples

### Colors
```tsx
// Primary colors
<div className="bg-primary-500 text-white">Primary button</div>
<div className="bg-primary-50 text-primary-600">Primary background</div>

// Success colors
<div className="bg-success-500 text-white">Success state</div>
<div className="text-success-600">Success text</div>

// Error colors
<div className="bg-error-500 text-white">Error state</div>
<div className="text-error-600">Error text</div>

// Gray scale
<div className="bg-gray-50 text-gray-800">Light background</div>
<div className="text-gray-500">Muted text</div>
```

### Typography
```tsx
// Display font (Poppins)
<h1 className="font-display text-4xl font-semibold tracking-wide">Heading</h1>

// Sans font (Inter)
<p className="font-sans text-base">Body text</p>
<p className="font-sans text-sm font-medium">Label text</p>
<p className="font-sans text-xs text-gray-400">Caption text</p>
```

### Spacing
```tsx
<div className="p-6">Padding 24px</div>
<div className="m-4">Margin 16px</div>
<div className="space-y-3">Vertical spacing 12px</div>
<div className="gap-2">Gap 8px</div>
```

### Containers
```tsx
<div className="max-w-xs">Max width 20rem</div>
<div className="max-w-sm">Max width 24rem</div>
<div className="max-w-md">Max width 28rem</div>
<div className="max-w-lg">Max width 32rem</div>
<div className="max-w-xl">Max width 36rem</div>
<div className="max-w-2xl">Max width 42rem</div>
<div className="max-w-3xl">Max width 48rem</div>
<div className="max-w-4xl">Max width 56rem</div>
<div className="max-w-5xl">Max width 64rem</div>
<div className="max-w-6xl">Max width 72rem</div>
<div className="max-w-7xl">Max width 80rem</div>
```

### Shadows
```tsx
<div className="shadow-sm">Light shadow</div>
<div className="shadow-md">Medium shadow (cards)</div>
<div className="shadow-lg">Large shadow (dropdowns)</div>
<div className="shadow-xl">Extra large shadow (modals)</div>
```

## Implementation Notes

1. **Font Loading**: Inter and Poppins fonts are loaded from Google Fonts in `app/layout.tsx`
2. **Theme Variables**: All design tokens are defined in `app/globals.css` using the `@theme` directive
3. **Component Library**: Reusable components are located in `app/components/ui/`
4. **TypeScript**: All components are fully typed with TypeScript interfaces
5. **Accessibility**: Components include proper ARIA attributes and keyboard navigation
6. **CSS Variables**: Font variables are defined in `app/globals.css` for font loading

## Benefits of Tailwind v4

- **Performance**: Only used CSS classes are included in the final bundle
- **Maintainability**: Design changes can be made in one place (CSS theme variables)
- **Developer Experience**: IntelliSense support for all design tokens
- **Responsive Design**: Built-in responsive utilities
- **Dark Mode Ready**: Easy to implement dark mode variants
- **Modern Architecture**: Uses CSS custom properties for better performance
- **No Config File**: Simpler setup with theme variables in CSS
- **Better Tree Shaking**: Improved CSS purging and optimization
- **CSS Variables**: Direct access to theme values in CSS and JavaScript

## Browser Support

Tailwind CSS v4 requires modern browsers:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

## References

- [Tailwind CSS v4 Theme Variables Documentation](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide#adding-custom-utilities)
- Figma Design System: Rockhopper DS
- Color palette and typography specifications from Figma components
- Component patterns from Navigation, Modal, Panel, and Toast designs
- Tailwind CSS v4 documentation and best practices
