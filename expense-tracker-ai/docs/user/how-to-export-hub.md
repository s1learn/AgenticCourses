# How to Export and Share Your Expenses

Use the Export & Share panel to download your expenses as a spreadsheet, a printable report or a backup file. You can also see what you've exported before.

## Before You Start

- You need at least one expense in the app. New users get sample expenses automatically.
- To get the printable **Monthly Summary**, allow pop-ups for this site in your browser.
- Some parts of this panel are previews of features that aren't connected yet. See [What works today](#what-works-today).

---

## Step-by-Step Guide

### Step 1: Open the Export & Share panel
On the **Dashboard**, click the purple **Export** button. A panel slides in from the right.

<!-- SCREENSHOT: Dashboard with the purple "Export" button highlighted -->
![Step 1 — Export button on the Dashboard](./screenshots/export-hub/step-01.png)

### Step 2: Pick a template
The **Templates** tab is shown first. Each card says what it contains, its file type and how many expenses it will include.

| Template | What you get | File type |
|---|---|---|
| 📊 **Tax Report** | All expenses from this calendar year | Spreadsheet (CSV) |
| 📅 **Monthly Summary** | This month's expenses in a printable report | PDF (via print) |
| 🥧 **Category Analysis** | All expenses, grouped by category | Spreadsheet (CSV) |
| 💾 **Full Backup** | Every expense, for safekeeping | JSON (a data file) |

<!-- SCREENSHOT: Templates tab showing the four template cards with record counts -->
![Step 2 — Template cards](./screenshots/export-hub/step-02.png)

### Step 3: Click Export on the template you want
The button briefly changes to **✓ Exported!**

- For spreadsheets and backups, the file goes to your Downloads folder.
- For **Monthly Summary**, a new tab opens with your report and the print window. To save it as a file, choose **Save as PDF** as the printer.

<!-- SCREENSHOT: A template card showing the green "✓ Exported!" button -->
![Step 3 — Export confirmed](./screenshots/export-hub/step-03.png)

### Step 4: Check your export history
Click the **History** tab. Each export is listed with when you made it, how many expenses it included and its size.

To get a file again, click the download arrow next to it. The new file uses your current expenses, not the ones you had when you first exported.

<!-- SCREENSHOT: History tab with several entries and the download arrow highlighted -->
![Step 4 — Export history](./screenshots/export-hub/step-04.png)

### Step 5: Close the panel
Click the **✕** in the top-right corner, or click anywhere outside the panel.

---

## What You'll See When It Works

- Your browser shows a download for files such as `tax_report_2026.csv` or `full_backup_2026-10-23.json`. You can open CSV files in Excel, Google Sheets or Numbers.
- The **Monthly Summary** opens as a clean report with your expenses and a total at the bottom.
- The export appears at the top of the **History** tab with a green ✓.

<!-- SCREENSHOT: Monthly Summary report open in a new tab with the print dialog -->
![Success — Printable monthly report](./screenshots/export-hub/success.png)

---

## What Works Today

Exporting files works fully. The other tabs show how sharing and syncing will work, but **they don't send or upload anything yet**:

| Tab | What you can do now |
|---|---|
| **Templates** | ✅ Download real files |
| **History** | ✅ See past exports, download again, clear the list |
| **Share** | Preview only. The link and QR code don't open your data, and "Send Report" doesn't send an email. |
| **Schedule** | Preview only. Saved settings don't run automatic backups. |
| **Integrations** | Preview only. "Connect" doesn't link a real account. |

---

## Common Issues

**"I clicked Monthly Summary and nothing happened."**
Your browser probably blocked the pop-up. Look for a blocked pop-up icon in the address bar, allow pop-ups for this site, and click **Export** again.

**"My Tax Report or Monthly Summary is empty."**
These templates only include expenses dated this year or this month. Add expenses for the current period, or use **Full Backup** or **Category Analysis** to get everything.

**"I see exports in History that I never made."**
New users see a few example entries. Click **Clear All**, then **Yes**, to remove them.

**"I cleared my history, but the old entries came back."**
This is a known issue. It happens if you export something without closing the panel after clearing. Close and reopen the panel after you click **Clear All**.

**"My schedule settings reset when I came back."**
This is a known issue. The Schedule tab may show the default settings instead of the ones you saved. Check every field again before you click **Save Schedule**.

**"Download QR doesn't download anything."**
This is a known issue. The QR code is a preview and can't be downloaded yet.

**"Copy Link didn't work."**
Copying needs a secure connection. Open the app at `https://…` or `http://localhost`.

---

## Related Guides
- [Project README](../../README.md): how to try the different versions of the export feature

---

*Need more help? Open an issue in this repository.*

> 🔧 **Developer reference**: [docs/dev/export-hub-implementation.md](../dev/export-hub-implementation.md)
