export interface ToothDef {
    id: string; // Triadan number, e.g., "104"
    label: string;
    x: number; // Percentage X relative to chart width
    y: number; // Percentage Y relative to chart height
    isMaxillary: boolean;
    quadrant: 1 | 2 | 3 | 4;
}

// Initial placeholder coordinates. 
// Ideally these would be finetuned to match the specific JPGs provided.
// Since we don't know the exact layout of the JPGs, we'll start with a plausible distribution
// and might need to adjust.

const createTooth = (id: string, x: number, y: number, isMaxillary: boolean, quadrant: 1 | 2 | 3 | 4): ToothDef => ({
    id,
    label: id,
    x,
    y,
    isMaxillary,
    quadrant,
});

export const DOG_TEETH: ToothDef[] = [
    createTooth('101', 47.8, 14.4, true, 1),
    createTooth('102', 43.9, 14.3, true, 1),
    createTooth('103', 40.1, 14.3, true, 1),
    createTooth('104', 35.7, 14.1, true, 1),
    createTooth('105', 29.9, 14.3, true, 1),
    createTooth('106', 25.8, 14.4, true, 1),
    createTooth('107', 20.4, 14.6, true, 1),
    createTooth('108', 13.8, 14.8, true, 1),
    createTooth('109', 6.6, 13.9, true, 1),
    createTooth('110', 2.4, 14.5, true, 1),
    createTooth('201', 52.9, 14.5, true, 2),
    createTooth('202', 56.7, 14.2, true, 2),
    createTooth('203', 60.6, 14.5, true, 2),
    createTooth('204', 65.1, 14.1, true, 2),
    createTooth('205', 70.5, 14.3, true, 2),
    createTooth('206', 74.9, 14.1, true, 2),
    createTooth('207', 80.3, 14.2, true, 2),
    createTooth('208', 86.4, 14.2, true, 2),
    createTooth('209', 94.0, 14.2, true, 2),
    createTooth('210', 97.7, 14.3, true, 2),
    createTooth('301', 52.2, 91.6, false, 3),
    createTooth('302', 56.3, 91.6, false, 3),
    createTooth('303', 60.1, 91.7, false, 3),
    createTooth('304', 64.0, 91.7, false, 3),
    createTooth('305', 69.0, 91.4, false, 3),
    createTooth('306', 72.7, 91.2, false, 3),
    createTooth('307', 77.3, 91.6, false, 3),
    createTooth('308', 82.6, 92.1, false, 3),
    createTooth('309', 89.3, 91.6, false, 3),
    createTooth('310', 95.0, 91.5, false, 3),
    createTooth('311', 98.7, 91.5, false, 3),
    createTooth('401', 48.3, 91.9, false, 4),
    createTooth('402', 44.2, 91.9, false, 4),
    createTooth('403', 40.5, 92.1, false, 4),
    createTooth('404', 36.4, 91.8, false, 4),
    createTooth('405', 31.4, 91.6, false, 4),
    createTooth('406', 27.8, 91.3, false, 4),
    createTooth('407', 23.1, 91.4, false, 4),
    createTooth('408', 17.9, 91.4, false, 4),
    createTooth('409', 11.6, 91.3, false, 4),
    createTooth('410', 5.3, 91.3, false, 4),
    createTooth('411', 2.0, 91.2, false, 4),
];

export const CAT_TEETH: ToothDef[] = [
    createTooth('101', 47.3, 14.1, true, 1),
    createTooth('102', 43.4, 14.3, true, 1),
    createTooth('103', 39.2, 14.2, true, 1),
    createTooth('104', 34.1, 13.6, true, 1),
    createTooth('106', 26.2, 14.4, true, 1),
    createTooth('107', 22.2, 14.4, true, 1),
    createTooth('108', 15.9, 14.4, true, 1),
    createTooth('109', 9.6, 14.4, true, 1),
    createTooth('201', 52.6, 14.5, true, 2),
    createTooth('202', 56.3, 14.4, true, 2),
    createTooth('203', 60.8, 14.4, true, 2),
    createTooth('204', 66.0, 13.8, true, 2),
    createTooth('206', 73.5, 14.4, true, 2),
    createTooth('207', 77.7, 14.5, true, 2),
    createTooth('208', 84.1, 14.4, true, 2),
    createTooth('209', 90.1, 14.4, true, 2),
    createTooth('301', 51.3, 92.1, false, 3),
    createTooth('302', 55.0, 92.2, false, 3),
    createTooth('303', 59.4, 92.3, false, 3),
    createTooth('304', 65.1, 92.5, false, 3),
    createTooth('307', 75.8, 92.1, false, 3),
    createTooth('308', 81.7, 92.1, false, 3),
    createTooth('309', 88.2, 92.0, false, 3),
    createTooth('401', 47.9, 92.3, false, 4),
    createTooth('402', 44.2, 92.1, false, 4),
    createTooth('403', 40.0, 92.6, false, 4),
    createTooth('404', 35.3, 92.5, false, 4),
    createTooth('407', 24.1, 92.1, false, 4),
    createTooth('408', 17.7, 91.6, false, 4),
    createTooth('409', 11.7, 91.8, false, 4),
];
