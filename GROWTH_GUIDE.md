# MapleDevs: Zero-to-One Growth Guide 🍁

Now that your site architecture is optimized for SEO, here is how you move the needle from **0 users** to a consistent community.

## 1. Technical "Always-On" Traffic
The most common mistake is waiting for Google to "find" you. You need to push your content.

### A. Automate the Google Indexing API
You have `google-index.js`. You should run this **every time you scrape**.
- **Action**: Add a step in your GitHub Action to run `node scripts/google-index.js` after the build.
- **Why**: This forces Google to crawl your new job pages within minutes, rather than weeks.

### B. Long-Tail Search Hubs
People search for `[Studio Name] + Jobs + [City]`.
- **Action**: I have already added 5 new studios and fixed the "Lyon/France" leak. This ensures that when someone searches for "Coalition Jobs Vancouver," your site is a clean, relevant result.

---

## 2. Social Distribution (The LinkedIn Loop)
I have just migrated your LinkedIn bot to the **2026 Posts API**. 

### The "Tag & Share" Strategy
Don't just post a link. Use the "Roundup" format I implemented:
- **Strategy**: When the bot posts "✨ Gameplay Programmer at Ubisoft," you should manually go to that post and **tag the hiring managers** or people at that studio.
- **Why**: LinkedIn rewards "tagging" with massive reach. If a Ubisoft dev likes your post, their entire network (other gamedevs) sees MapleDevs.

---

## 3. Niche Community Infiltration
Traffic follows value. Be where the Canadian gamedevs live.

### The "Niche 10" Target List:
Go to these places and share **specific links** (e.g., "Just added 10 new Junior roles in Montreal"):
1.  **Slack**: Vancouver Game Devs, MTL Game Dev.
2.  **Discord**: Global Game Jam (Canadian channels), IGDA Chapters (Toronto, Montreal).
3.  **Reddit**: `r/canadianpixel` (if exists), `r/gamedev`, `r/montreal`, `r/vancouver`.
4.  **Facebook Groups**: "Montreal Game Developers", "Game Jobs Canada".

---

## 4. Content Hooks (High Engagement)
Static job lists are okay, but **Salary transparency** and **Student focus** drive shares.

- **Action**: Highlight "New Grad Roles" explicitly in your LinkedIn headlines.
- **Template**: *"Entry-level roles in Canadian Gaming are rare. We just tracked 4 new ones at Digital Extremes and Klei. Check them out: [Link]"*

---

## 5. Summary Checklist
- [ ] **Daily**: Pull `vancouver/index.html` and `montreal/index.html` through the Google Indexing API.
- [ ] **Weekly**: Manually share one "Niche" roundup (e.g. "Best Art Jobs in Toronto This Week").
- [ ] **Monthly**: Audit your "Noise" filter (I've hardened it, but international roles are persistent).
