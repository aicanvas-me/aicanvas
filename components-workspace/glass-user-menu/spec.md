# Glass User Menu

**Component:** Glass User Menu
**Slug:** glass-user-menu
**Description:** A user avatar trigger that opens a glass dropdown with user info header, grouped menu items, and a sub-menu.

**Visual:**
- Trigger: avatar circle with user initials + name + chevron, glass pill style
- Dropdown: frosted glass panel, same style as Glass Modal/Card
- Header section: avatar, full name, email
- Menu groups: Account (Profile, Settings), Workspace (Team, Billing), then Log Out at the bottom in red
- One sub-menu: Settings expands inline to show sub-items (Appearance, Notifications, Privacy)
- Background: same orange flower image as Glass Card/Slider

**Behaviour:**
- Click trigger → dropdown springs open with blur+scale entrance
- Hover on menu items → subtle glass highlight, slight x-translate
- Settings row → click to expand/collapse sub-items with spring height animation
- Log Out row → red accent, hover glows red
- Click outside → closes
- Staggered entrance for menu items

**Tech notes:** Framer Motion, glass design tokens matching the rest of the glass collection.
