

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
    
    function severitylabel(s: string): string {
        switch (s) {
            case 'panic': return '🔴';
            case 'change request': return '🟡';
            default: return '⚪';
          }
        }