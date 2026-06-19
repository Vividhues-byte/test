

interface FeedbackItem {
    id: string;
    text: string;
    category: string;
    severity: 'nitpick' | 'change request' | 'panic';
    status?: 'active' | 'dismissed' | 'addressed';
    nodeId?: string;
    nodeName?: string;
}

interface StickyNoteData {
    frame: FrameNode;
    textNode: TextNode;
    barNode: RectangleNode;
    severity: string;
    status: string;
}

interface DesignProfile {
    hasLogo: boolean;
    logoNodeName: string;
    logoNodeId: string;
    textCount: number;
    textSnippets: string[];
    hasImage: boolean;
    colorCount: number;
    sampleColors: string;
    sampleColorsHex: string;
    frameCount: number;
    componentCount: number;
    hasMultiplePages: boolean;
    nodeCount: number;
    hasButtons: boolean;
    buttonsLabels: string[];
    hasIcons: boolean;
    hasGradients: boolean;
}

function uid(): string {
    return 'fb_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function rgToHex(c: RGB): string {
    const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
      const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
      const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
    
    function getDesignProfile(): DesignProfile {
     const selection = figma.currentPage.selection;
    const allNodes: SceneNode[] = [];
    
    const source = selection.length > 0 ? selection : figma.currentPage.children;
    for (const node of source) {
      allNodes.push(node);
      if('children' in node) {  
    for (const child of ( node as ChildrenMixin).children) (
    allNodes.push(child);
      }
    }
    }
    
    const profile: DesignProfile = {
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
    
    const colorSet = new Set<string>();

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
            profile.buttonsLabels.push((node as TextNode).characters);
        } else {
            profile.buttonsLabels.push(node.name);
        }
    }

    if (name.includes('icon') || name.includes('svg') || name.includes('glyph')) {
        profile.hasIcons = true;
    }

 if (node.type === 'TEXT') {
    const t = (node as TextNode).characters.trim();
    if (t.length > 2) {
        profile.textCount++;
        if (profile.textSnippets.length < 5) {
            profile.textSnippets.push(t.substring(0, 80));
        }
    }
}

 if ('fills' in node) {
    const fills = (node as GeometryMixin).fills as Paint[] | typeof figma.mixed;
    if (Array.isArray(fills)) {
        for (const fill of fills) {
            if (fill.type === 'IMAGE') profile.hasImage = true;
            if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') profile.hasGradients = true;
            if (fill.type === 'SOLID' && fill.color) {
                colorSet.add(rgToHex(fill.color));
            }
        }
    }
}

  if(node.type === 'FRAME' || node.type === 'GROUP') profile.frameCount++;
  if(node.type === 'INSTANCE' || node.type === 'COMPONENT') || node.type === 'COMPONENT_SET') profile.componentCount++;
    }
    
    profile.colorCount = colorSet.size;
    if (colorSet.size > 0) {
        const colors = Array.from(colorSet);
        profile.sampleColor = colors[0];
        profile.sampleColorsHex = colors[0];
    }

    return profile;
}
    
    function severitylabel(s: string): string {
        switch (s) {
            case 'panic': return '🔴';
            case 'change request': return '🟡';
            default: return '⚪';
          }
        }