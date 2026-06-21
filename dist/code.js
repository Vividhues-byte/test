"use strict";
function uid() {
    return 'fb_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
function rgToHex(c) {
    const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
}
function getDesignProfile() {
    const selection = figma.currentPage.selection;
    const allNodes = [];
    const source = selection.length > 0 ? selection : figma.currentPage.children;
    for (const node of source) {
        allNodes.push(node);
        if ('children' in node) {
            for (const child of node.children) {
                allNodes.push(child);
            }
        }
    }
    const profile = {
        hasLogo: false,
        logoNodeName: '',
        logoNodeId: '',
        textCount: 0,
        textSnippets: [],
        hasImage: false,
        colorCount: 0,
        sampleColors: '',
        sampleColorsHex: '',
        frameCount: 0,
        componentCount: 0,
        hasMultiplePages: figma.root.children.length > 1,
        nodeCount: allNodes.length,
        hasButtons: false,
        buttonsLabels: [],
        hasIcons: false,
        hasGradients: false,
    };
    const colorSet = new Set();
    for (const node of allNodes) {
        const name = node.name.toLowerCase();
        if (name.includes('logo') || name.includes('brand') || name.includes('header-logo')) {
            profile.hasLogo = true;
            profile.logoNodeName = node.name;
            profile.logoNodeId = node.id;
        }
        if (name.includes('button') || name.includes('btn') || name.includes('cta')) {
            profile.hasButtons = true;
            if (node.type === 'TEXT') {
                profile.buttonsLabels.push(node.characters);
            }
            else {
                profile.buttonsLabels.push(node.name);
            }
        }
        if (name.includes('icon') || name.includes('svg') || name.includes('glyph')) {
            profile.hasIcons = true;
        }
        if (node.type === 'TEXT') {
            const t = node.characters.trim();
            if (t.length > 2) {
                profile.textCount++;
                if (profile.textSnippets.length < 5) {
                    profile.textSnippets.push(t.substring(0, 80));
                }
            }
        }
        if ('fills' in node) {
            const fills = node.fills;
            if (Array.isArray(fills)) {
                for (const fill of fills) {
                    if (fill.type === 'IMAGE')
                        profile.hasImage = true;
                    if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL')
                        profile.hasGradients = true;
                    if (fill.type === 'SOLID' && fill.color) {
                        colorSet.add(rgToHex(fill.color));
                    }
                }
            }
        }
        if (node.type === 'FRAME' || node.type === 'GROUP')
            profile.frameCount++;
        if (node.type === 'INSTANCE' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')
            profile.componentCount++;
    }
    profile.colorCount = colorSet.size;
    if (colorSet.size > 0) {
        const colors = Array.from(colorSet);
        profile.sampleColors = colors[0];
        profile.sampleColorsHex = colors[0];
    }
    return profile;
}
const feedbackGenerators = [
    (p) => {
        if (p.hasLogo) {
            const name = p.logoNodeName || 'this logo';
            return {
                id: uid(), text: `"${name}" needs to be at least 30% bigger. It's getting completely lost. Make it command attention.`,
                category: 'Logo Size', severity: 'change request', nodeId: p.logoNodeId, nodeName: p.logoNodeName,
            };
        }
        return {
            id: uid(), text: 'Can we make the logo bigger? It should be the first thing people see. Like, twice as big.',
            category: 'Logo Size', severity: 'change request',
        };
    },
    (p) => {
        if (p.colorCount > 0 && p.sampleColorsHex) {
            return {
                id: uid(), text: `I'm thinking ${p.sampleColorsHex} isn't quite right. What if we tried blue? #0066FF is more trustworthy.`,
                category: 'Color', severity: 'change request',
            };
        }
        return {
            id: uid(), text: 'The palette feels safe. Can we try a vibrant blue as the primary?',
            category: 'Color', severity: 'change request',
        };
    },
    (p) => {
        if (p.textSnippets.length > 0) {
            const snippet = p.textSnippets[0];
            return {
                id: uid(), text: `Can we workshop the copy? "${snippet.substring(0, 40)}..." doesn't quite land. Need something punchier.`,
                category: 'Copy', severity: 'change request',
            };
        }
        return {
            id: uid(), text: 'The messaging needs work. Can we make the headline shorter with a subheadline?',
            category: 'Copy', severity: 'change request',
        };
    },
    (p) => {
        if (p.frameCount > 0) {
            return {
                id: uid(), text: 'The grid is inconsistent. Some sections have 12 columns, others 8. Can we unify the layout?',
                category: 'Layout', severity: 'panic',
            };
        }
        return {
            id: uid(), text: 'Things feel scattered. Can we tighten alignment and use a proper grid?',
            category: 'Layout', severity: 'change request',
        };
    },
    () => ({
        id: uid(), text: 'There is WAY too much whitespace. Can we condense things? People scroll too much.',
        category: 'Whitespace', severity: 'nitpick',
    }),
    (p) => {
        if (p.componentCount > 0) {
            return {
                id: uid(), text: 'These components don\'t match our design system. Check the brand guidelines.',
                category: 'Branding', severity: 'panic',
            };
        }
        return {
            id: uid(), text: 'Does this follow our brand guidelines? I don\'t see our visual identity anywhere.',
            category: 'Branding', severity: 'panic',
        };
    },
    () => ({
        id: uid(), text: 'My 12-year-old nephew made a website in school that looks identical to this. Just saying.',
        category: 'My Nephew', severity: 'nitpick',
    }),
    () => ({
        id: uid(), text: 'Apple\'s website does this exact thing but way better. Can we study what they do?',
        category: 'Competitor', severity: 'change request',
    }),
    () => ({
        id: uid(), text: 'Can we add a live chat widget, dark mode, and turn this into a PWA while we\'re at it? Small ask.',
        category: 'Scope Creep', severity: 'panic'
    }),
    (p) => {
        if (p.textCount > 3) {
            return {
                id: uid(), text: 'This font isn\'t working. Too playful for our audience. Try Inter or SF Pro.',
                category: 'Typography', severity: 'change request',
            };
        }
        return {
            id: uid(), text: 'The typography hierarchy is flat. Headlines don\'t look like headlines. Bump the size and weight.',
            category: 'Typography', severity: 'change request',
        };
    },
    (p) => {
        if (p.hasButtons) {
            const label = p.buttonsLabels[0] || 'this button';
            return {
                id: uid(), text: `"${label}" — is this the primary action? It doesn't feel prominent enough.`,
                category: 'Buttons', severity: 'change request',
            };
        }
        return {
            id: uid(), text: 'Where\'s the call to action? We need a prominent CTA.',
            category: 'Buttons', severity: 'panic',
        };
    },
    () => ({
        id: uid(), text: 'Does this work on mobile? I pulled it up on my iPhone and everything overlaps.',
        category: 'Mobile', severity: 'panic',
    }),
    (p) => {
        if (p.hasImage) {
            return {
                id: uid(), text: 'These images feel stock-photo-y. Can we use original photography instead?',
                category: 'Images', severity: 'change request',
            };
        }
        if (p.hasIcons) {
            return {
                id: uid(), text: 'Icons are inconsistent — some outlined, some filled. Pick one style.',
                category: 'Icons', severity: 'nitpick',
            };
        }
        return null;
    },
    () => ({
        id: uid(), text: 'This color contrast fails WCAG AA. I checked. We\'re going to get sued.(Okay maybe not but fix it.)',
        category: 'Accessibility', severity: 'panic',
    }),
    () => ({
        id: uid(), text: 'Dave in sales wants the opposite of what marketing said. Can you make it work for both?',
        category: 'Confliciting Feedback', severity: 'panic',
    }),
];
function generateFeedback(profile) {
    const items = [];
    for (const generator of feedbackGenerators) {
        const item = generator(profile);
        if (item) {
            if (!item.status)
                item.status = 'active';
            items.push(item);
        }
    }
    return items;
}
function severitylabel(s) {
    switch (s) {
        case 'panic': return '🔴';
        case 'change request': return '🟡';
        default: return '⚪';
    }
}
function stickyNoteColor(severity, status) {
    if (status === 'dismissed')
        return { bg: { r: 0.3, g: 0.3, b: 0.3 }, accent: { r: 0.4, g: 0.4, b: 0.4 }, text: { r: 0.7, g: 0.7, b: 0.7 } };
    if (status === 'addressed')
        return { bg: { r: 0.85, g: 0.95, b: 0.85 }, accent: { r: 0.2, g: 0.7, b: 0.3 }, text: { r: 0.15, g: 0.15, b: 0.15 } };
    switch (severity) {
        case 'panic': return { bg: { r: 1, g: 0.95, b: 0.85 }, accent: { r: 1, g: 0.2, b: 0.2 }, text: { r: 0.15, g: 0.15, b: 0.15 } };
        case 'change request': return { bg: { r: 1, g: 1, b: 0.85 }, accent: { r: 1, g: 0.6, b: 0 }, text: { r: 0.15, g: 0.15, b: 0.15 } };
        default: return { bg: { r: 0.95, g: 0.95, b: 0.95 }, accent: { r: 0.6, g: 0.6, b: 0.6 }, text: { r: 0.2, g: 0.2, b: 0.2 } };
    }
}
function getStartPosition() {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity;
        for (const node of selection) {
            const b = node.absoluteBoundingBox;
            if (b) {
                minX = Math.min(minX, b.x);
                minY = Math.min(minY, b.y);
                maxX = Math.max(maxX, b.x + b.width);
            }
        }
        if (minX !== Infinity) {
            return { x: maxX + 40, y: minY };
        }
    }
    const vp = figma.viewport;
    const center = vp.center;
    return { x: center.x + 200, y: center.y - 300 };
}
const loadedFonts = { regular: false, bold: false };
async function ensureFonts() {
    if (!loadedFonts.regular) {
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        loadedFonts.regular = true;
    }
    if (!loadedFonts.bold) {
        await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
        loadedFonts.bold = true;
    }
}
const placedNodes = new Map();
function makeStickyNote(item, x, y) {
    const noteW = 220, noteH = 120;
    const severity = item.severity || 'change request';
    const status = item.status || 'active';
    const frame = figma.createFrame();
    frame.name = item.id;
    frame.x = x;
    frame.y = y;
    frame.resize(noteW, noteH);
    frame.cornerRadius = 8;
    const { bg, accent, text } = stickyNoteColor(severity, status);
    frame.fills = [{ type: 'SOLID', color: bg }];
    frame.strokeWeight = 0;
    const bar = figma.createRectangle();
    bar.resize(4, noteH);
    bar.fills = [{ type: 'SOLID', color: accent }];
    bar.cornerRadius = 0;
    frame.appendChild(bar);
    const headText = figma.createText();
    headText.fontName = { family: 'Inter', style: 'Bold' },
        headText.fontSize = 10;
    headText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
    headText.characters = `${severitylabel(severity)} ${severity.toUpperCase()}  \u2022  ${item.category}`;
    headText.x = 12;
    headText.y = 8;
    frame.appendChild(headText);
    const body = figma.createText();
    body.fontName = { family: 'Inter', style: 'Regular' };
    body.fontSize = 11;
    body.fills = [{ type: 'SOLID', color: text }];
    body.characters = item.text;
    body.x = 12;
    body.y = 28;
    body.resize(noteW - 24, 80);
    body.textAutoResize = 'HEIGHT';
    frame.appendChild(body);
    frame.setPluginData('type', 'client-feedback');
    frame.setPluginData('id', item.id);
    frame.setPluginData('severity', severity);
    frame.setPluginData('status', status);
    frame.setPluginData('category', item.category);
    frame.setPluginData('text', item.text);
    if (item.nodeId)
        frame.setPluginData('relatedNodeId', item.nodeId);
    return { frame, textNode: body, barNode: bar, severity, status };
}
function clearAnnotations() {
    for (const { frame } of placedNodes.values()) {
        if (!frame.removed)
            frame.remove();
    }
    placedNodes.clear();
}
function createAnnotations(items) {
    const start = getStartPosition();
    const spacing = 160;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const data = makeStickyNote(item, start.x, start.y + i * spacing);
        if (item.nodeId) {
            const relatedNode = figma.getNodeById(item.nodeId);
            if (relatedNode && 'absoluteBoundingBox' in relatedNode) {
                const b = relatedNode.absoluteBoundingBox;
                if (b) {
                    const line = figma.createLine();
                    line.x = b.x + b.width / 2;
                    line.y = b.y + b.height / 2;
                    const endX = data.frame.x;
                    const endY = data.frame.y + 60;
                    const dx = endX - line.x;
                    const dy = endY - line.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    line.resize(len, 0);
                    line.rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
                    line.strokeWeight = 1;
                    line.strokes = [{ type: 'SOLID', color: { r: 1, g: 0.6, b: 0 }, opacity: 0.3 }];
                    line.name = `connector_${item.id}`;
                    line.setPluginData('feedbackId', item.id);
                }
            }
        }
        placedNodes.set(item.id, data);
    }
}
function updateStickyVisual(data, status) {
    const { frame, barNode, textNode } = data;
    const severity = frame.getPluginData('severity') || 'change request';
    frame.setPluginData('status', status);
    const { bg, accent } = stickyNoteColor(severity, status);
    frame.fills = [{ type: 'SOLID', color: bg }];
    barNode.fills = [{ type: 'SOLID', color: accent }];
    if (status === 'dismissed') {
        textNode.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        textNode.characters = '\u{1F6AB} [Dismissed] ' + frame.getPluginData('text');
    }
    else if (status === 'addressed') {
        textNode.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.5, b: 0.3 } }];
        textNode.characters = '\u{2705} [Addressed] ' + frame.getPluginData('text');
    }
    else {
        textNode.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
        textNode.characters = frame.getPluginData('text');
    }
}
figma.showUI(__html__, { width: 380, height: 600, themeColors: true });
figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case 'generate': {
            await ensureFonts();
            clearAnnotations();
            const profile = getDesignProfile();
            const items = generateFeedback(profile);
            createAnnotations(items);
            broadcastItem();
            const frames = Array.from(placedNodes.values()).map(d => d.frame).filter(f => !f.removed);
            if (frames.length > 0)
                figma.viewport.scrollAndZoomIntoView(frames);
            break;
        }
        case 'dismiss': {
            const data = placedNodes.get(msg.id);
            if (data && !data.frame.removed)
                updateStickyVisual(data, 'dismissed');
            broadcastItem();
            break;
        }
        case 'address': {
            const data = placedNodes.get(msg.id);
            if (data && !data.frame.removed)
                updateStickyVisual(data, 'addressed');
            broadcastItem();
            break;
        }
        case 'readdress': {
            const data = placedNodes.get(msg.id);
            if (data && !data.frame.removed)
                updateStickyVisual(data, 'active');
            broadcastItem();
            break;
        }
        case 'close': {
            figma.closePlugin();
            break;
        }
    }
};
function broadcastItem() {
    const items = [];
    for (const [id, data] of placedNodes) {
        const frame = data.frame;
        if (frame.removed)
            continue;
        items.push({
            id,
            text: frame.getPluginData('text') || '',
            category: frame.getPluginData('category') || '',
            severity: (frame.getPluginData('severity') || 'change request'),
            status: (frame.getPluginData('status') || 'active'),
        });
    }
    figma.ui.postMessage({ type: 'feedback', items });
}
