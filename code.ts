

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