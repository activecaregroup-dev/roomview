# Prompt: Generate RoomView User Guide

Use the following prompt in a new Claude conversation to generate a user guide for the RoomView application.

---

## Prompt

Please write a clear, friendly user guide for a web application called **RoomView**, built for care home staff at **Active Neuro** (formerly Active Care Group).

### What RoomView does

RoomView is a room management dashboard for a care home. It lets staff:
- See all rooms at a glance — occupied or vacant
- Admit and discharge patients
- Set a personalised welcome message displayed on a TV screen in each patient's room
- View a PIN-protected welcome screen on the room TV
- Manage room details (room number, location, PIN, notes)

### The two main views

**1. Dashboard (`/dashboard`)**
The main screen staff use day-to-day. Shows a card for every room with:
- Room number, location, occupied/vacant status
- Patient name and admission time (if occupied)
- A preview of the screen message
- Clicking the card (anywhere except the buttons) opens the Edit Room modal
- Buttons: Admit / Discharge, PIN reveal (hold to show), Refresh screen, Preview (opens TV screen in new tab), Show URL (shows the short URL and PIN for entering on the TV)

**2. Manage Rooms (`/manage`)**
For setting up rooms. Add new rooms, edit basic details (number, PIN, location, notes), delete vacant rooms.

### Key workflows to document

1. **Logging in** — visit the app URL, select the site (Woodlands), enter the password
2. **Admitting a patient** — click Admit on a vacant room, enter the patient's first name, edit the welcome message (pre-filled with a default template — replace [Registered Manager Name] and [Concierge Name] with real names), click Admit Patient
3. **Discharging a patient** — click Discharge on an occupied room, confirm
4. **Editing the screen message** — click anywhere on the room card to open Edit Room, update the Screen message field, Save Changes
5. **Setting up a room TV** — click Show URL on the room card, note the short URL (e.g. `https://roomview.vercel.app/s/wood/15`) and PIN, type the URL into the TV browser, enter the 4-digit PIN
6. **Refreshing a screen** — click Refresh on the room card to push any updates to the TV immediately
7. **Adding a new room** — go to Manage Rooms, click Add Room, fill in room number, PIN, location

### Tone and format

- Friendly and non-technical — audience is care home staff, not IT
- Use numbered steps for workflows
- Use simple headings and short paragraphs
- Include a brief "Tips" section at the end
- Format as clean Markdown suitable for a printed handout or internal wiki
- Do not mention any technical details (no Snowflake, no API, no code)
