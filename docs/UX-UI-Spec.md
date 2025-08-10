# UX/UI Specification
## Ask Dahlia - AI Legal Assistant

### Design System

#### Typography
- **Primary Font**: Inter (Sans-serif)
  - Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
  - Body Text: 16px (1rem)
  - Line Height: 1.5 (body), 1.2 (headings)

- **Secondary Font**: Dancing Script
  - Used for logo and primary branding elements
  - Weight: 700 (Bold)

- **Monospace Font**: JetBrains Mono
  - Used for code samples, citations, and reference IDs
  - Weight: 400 (Regular)

#### Color Palette
- **Primary Background**: Dark (#000000)
- **Secondary Background**: Dark Zinc (#18181b)
- **Glass Card**: Zinc-900 at 40% opacity (#18181b66) with backdrop blur

- **Primary Accent**: Purple Gradient
  - Start: #e879f9 (Pink-500)
  - Middle: #c084fc (Purple-400)
  - End: #a78bfa (Violet-400)

- **Secondary Accents**:
  - Blue: #60a5fa (Blue-400)
  - Green: #4ade80 (Green-400)
  - Yellow: #facc15 (Yellow-400)
  - Red: #f87171 (Red-400)

- **Text Colors**:
  - Primary: #ffffff (White)
  - Secondary: #a1a1aa (Zinc-400)
  - Tertiary: #52525b (Zinc-600)
  - Accent: #c084fc (Purple-400)

#### Spacing
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
- **Component Spacing**: 16px (Default)
- **Section Spacing**: 64px (Default)
- **Page Padding**: 16px (mobile), 24px (tablet), 32px (desktop)

#### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px
- **Large Desktop**: ≥ 1280px

#### Container Widths
- **Default**: 100%
- **Max Width**: 1280px
- **Content Max Width**: 768px

### Components

#### Layout Components

##### HeroBackground
- **Description**: Global cinematic background with parallax effect
- **Layers**:
  1. LQIP (Low Quality Image Placeholder)
  2. High-resolution hero image
  3. Gradient scrim overlay (zinc-950 → midnight-900)
  4. Radial vignette
  5. Bloom effect (purple/pink glow)
  6. Micro-dust particles (animated)
- **Properties**:
  - `variant`: Background image variant ('legal-luxe', 'tech-law', etc.)
  - `overlayOpacity`: 0.30-0.55 range
  - `bloomStrength`: 0-0.40 range
  - `motionEnabled`: Toggle for animation effects
- **Motion**:
  - Parallax scrolling (image: 0.3, dust: 0.6)
  - Dust particle floating animation
  - Reduced motion support

##### GlassCard
- **Description**: Frosted glass effect card container
- **Variants**:
  - `default`: Semi-transparent background
  - `solid`: Higher opacity background
- **Properties**:
  - Border radius: 12px (0.75rem)
  - Border: 1px zinc-800 at 50% opacity
  - Background: zinc-900 at 40% opacity
  - Backdrop filter: blur(8px)
  - Shadow: 0 4px 12px rgba(0, 0, 0, 0.25)

#### UI Components

##### Button
- **Variants**:
  - `default`: Button with gradient background
  - `outline`: Transparent with border
  - `ghost`: Transparent without border
- **Sizes**:
  - `sm`: 32px height, 12px font
  - `md`: 40px height, 14px font
  - `lg`: 48px height, 16px font
- **States**:
  - Default
  - Hover: Slightly darker gradient
  - Active: Scale down 1%
  - Focus: White outline
  - Disabled: 50% opacity, no hover effects
- **Motion**:
  - Hover scale: 1.02
  - Active scale: 0.98
  - Transition: 150ms cubic-bezier(0.4, 0, 0.2, 1)

##### Input
- **Variants**:
  - `default`: Standard input
  - `search`: With search icon
- **States**:
  - Default
  - Focus: Purple border
  - Invalid: Red border
  - Disabled: 50% opacity
- **Properties**:
  - Height: 40px
  - Padding: 12px 16px
  - Border radius: 8px
  - Background: zinc-900 at 50% opacity
  - Border: 1px zinc-800 at 50% opacity

##### Dialog/Modal
- **Animation**:
  - Enter: Fade in + scale up (300ms)
  - Exit: Fade out + scale down (200ms)
- **Overlay**:
  - Background: black at 50% opacity
  - Backdrop filter: blur(4px)
- **Properties**:
  - Border radius: 16px
  - Max width: 90% of viewport
  - Max height: 90% of viewport
  - Padding: 24px

### Page Templates

#### Auth Pages
- **Login**:
  - Logo centered at top
  - Form card centered in page
  - "Ask for access" secondary button
  - Access request modal
- **Access Request Modal**:
  - Full profile capture (8 fields)
  - Submit button
  - Success/error notifications

#### Dashboard
- **Layout**:
  - Fixed header navigation
  - KPI cards (4 across)
  - Activity feed
  - Quick action buttons
- **Responsive Behavior**:
  - Desktop: 4-column grid
  - Tablet: 2-column grid
  - Mobile: 1-column stack

#### Chat Interface
- **Layout**:
  - Left sidebar: Chat sessions list
  - Main panel: Messages
  - Optional right sidebar: Sources drawer
- **Message Types**:
  - User: Right-aligned bubbles
  - Assistant: Left-aligned with avatar
- **Features**:
  - Citations with formatting
  - Voice controls
  - Source drawer
  - Action buttons

#### Document Management
- **Upload Area**:
  - Drag-and-drop zone
  - File selection button
  - Progress indicators
- **Document List**:
  - Status indicators
  - Metadata display
  - Action buttons
- **Document Detail**:
  - Preview
  - Metadata panel
  - Processing status

#### Risk Assessment
- **Matrix**:
  - 5x5 grid (probability × impact)
  - Color-coded cells
  - Selection indicators
- **Risk Factors**:
  - Cards with details
  - Score indicators
- **Recommendations**:
  - Clause suggestions
  - Posture indicators

### Motion & Animations

#### Page Transitions
- **Page Entry**:
  - Fade in (300ms)
  - Staggered content reveal
- **Between Routes**:
  - Fade crossfade (150ms)
  - No layout shift

#### Micro-interactions
- **Buttons**:
  - Hover: Scale up 2%
  - Active: Scale down 1%
- **Cards**:
  - Hover: Subtle lift (translateY -2px)
  - Active: Press down (translateY 1px)
- **Lists**:
  - Item enter: Fade + slide in
  - Item exit: Fade + slide out
- **Notifications**:
  - Enter: Slide up + fade in
  - Exit: Slide down + fade out

#### Loader States
- **Inline Loading**:
  - Pulsing dots (3 dots, staggered)
  - Color: Primary accent
- **Page Loading**:
  - Centered loading indicator
  - Semi-transparent backdrop
- **Progress Bars**:
  - Gradient fill animation
  - Smooth easing function

### Accessibility

#### Color Contrast
- **Text Requirements**:
  - Regular text: AA (4.5:1 ratio)
  - Large text: AA (3:1 ratio)
  - All text on glass: Overlay nudge if needed (+0.04)
- **Focus States**:
  - High contrast focus rings
  - Never remove focus indicators

#### Motion Sensitivity
- **Reduced Motion**:
  - Honor prefers-reduced-motion
  - Disable parallax
  - Disable animations
  - Static dust particles

#### Keyboard Navigation
- **Focus Order**:
  - Logical tab order
  - Focus trapping in modals
  - Skip-to-content link

#### Screen Readers
- **ARIA Roles**:
  - Semantic HTML
  - ARIA landmarks
  - Form labels
  - Button/link descriptors
- **Live Regions**:
  - Chat messages
  - Notifications
  - Loading states

### Mobile Adaptation

#### Touch Targets
- **Minimum Size**: 44×44px
- **Spacing**: 8px minimum between targets

#### Responsive Layout
- **Navigation**:
  - Desktop: Full horizontal nav
  - Mobile: Hamburger menu
- **Content**:
  - Desktop: Multi-column
  - Mobile: Single column
- **Controls**:
  - Larger on mobile
  - Bottom positioning for common actions

#### Gesture Support
- **Swipe**: Navigate between sections
- **Pinch**: Zoom in document previews
- **Long Press**: Additional options menu

### Brand Elements

#### Logo
- **Primary Logo**: "Ask Dahlia" with Dancing Script "D"
- **Favicon**: Black square with Dancing Script "D"
- **Monogram**: Solo "D" for constrained spaces
- **Animations**:
  - Subtle glow pulse on hover
  - Letters appear sequentially on page load

#### Hero Images
1. **legal-luxe**: Sophisticated legal workspace
2. **tech-law**: Digital law and technology
3. **data-scales**: Data analytics and justice
4. **contract-macro**: Contract documents detail
5. **boardroom**: Executive legal decisions

#### Loading & Empty States
- **Loading**: Pulsing dots with gradient
- **Empty Chat**: Message icon with helper text
- **No Results**: Contextual icon with suggestion
- **Error States**: Friendly error with retry option

### Interaction Patterns

#### Form Patterns
- **Inline Validation**: As users type
- **Error Messaging**: Below input field
- **Success Feedback**: Toast notifications
- **Multi-step Forms**: Progress indicator

#### Navigation Patterns
- **Main Navigation**: Horizontal tabs (desktop), Hamburger (mobile)
- **Secondary Navigation**: Left sidebar
- **Breadcrumbs**: For deep hierarchies
- **Back Buttons**: For nested views

#### Search Patterns
- **Global Search**: Top navigation
- **Contextual Search**: Within specific sections
- **Search Results**: Highlight matches
- **Filtering**: Multiple facets
