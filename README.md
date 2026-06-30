# 💬 Client Feedback Generator

Ever wished a client would just say what they mean? Now you can simulate it yourself for laughs or stress-testing your designs! 

This is a satirical **Figma plugin** that scans your design and drops brutally relatable, realistic client feedback right onto your canvas as sticky notes. It checks for things like logos, buttons, colors, and layouts, and generates specific feedback based on what it sees.

## ✨ What it does
- **Design-Aware Notes:** It looks at your design and makes specific comments (e.g., if you have a logo, it'll tell you to "make it bigger").
- **Severity Levels:** Feedback is ranked from "Nitpick" ⚪ to "Change Request" 🟡 to full-on "Panic" 🔴.
- **Manage Feedback:** Mark notes as "Addressed" or "Dismissed", or use the bulk action buttons.
- **Visual Connections:** Draws lines connecting the sticky notes directly to the design elements they are critiquing.
- **Fully Local:** Everything happens on your machine. No internet connection is needed.

## 🛠️ How to try it
1. Clone this repository and run `npm install` in the folder.
2. Build the plugin by running `npm run build`.
3. Open the **Figma desktop app**. Go to **Plugins → Development → Import plugin from manifest**, and choose the `manifest.json` file.
4. Run the plugin, select part of your design, and hit **Generate Feedback** to get roasted!