## Glass AI Compose

**Slug:** glass-ai-compose  
**Description:** A glassmorphism AI chat compose box with text input, image upload, mode switching, and send — all with spring-animated states.

**Visual:**
- Dark bg with atmospheric flower image at 60% opacity
- Glass panel (family-standard: rgba(255,255,255,0.08) bg, blur layer separation, top edge highlight)
- Multi-line text input area with placeholder "Ask anything..."
- Bottom toolbar row with: image upload button, mode switcher (Creative / Precise / Balanced), and send button
- Uploaded image shows as a small glass thumbnail with an X to remove
- Orange active glow on the panel when focused (matching search bar / user menu)

**Behaviour:**
- **Default state:** subtle glass panel, muted placeholder, toolbar visible but muted
- **Active state (focused):** orange glow border, toolbar brightens, text cursor visible
- **Typing state:** send button activates (accent color), character presence indicated
- **Mode switcher:** pill-style toggle between 3 modes with sliding indicator (spring animation)
- **Image upload:** click opens file picker, thumbnail preview appears above toolbar with animated entry, X button to remove
- **Send button:** disabled when empty, accent-colored when ready, spring scale on tap
- Textarea auto-grows with content (up to a max height)
- Click outside deactivates the glow (like search bar)

**Tech notes:**
- Notification-style tinted icon badges on toolbar buttons
- AI Canvas icons: Send, ImageSquare, Sparkle (or similar for modes)
- Spring animations throughout, reduced-motion support
- All glass family patterns: blur layer z-[-1] with isolate, top highlight, panel styles
