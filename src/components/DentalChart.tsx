import React, { useRef, useState, useEffect } from 'react';
import catChart from '../assets/cat_chart.jpg';
import dogChart from '../assets/dog_chart.jpg';
import { DOG_TEETH, CAT_TEETH, ToothDef } from '../constants/teeth';

export interface ToothData {
    missing?: boolean;
    mobile?: string; // e.g., 'M0', 'M1', etc.
    furcation?: string; // 'none', 'F1', 'F2', 'F3'
    fractureType?: string; // 'complicated_crown', etc.
    recession?: string; // mm
    pocket?: string; // mm
    boneLoss?: string; // %
    gingivitis?: 0 | 1 | 2 | 3;
    calculus?: 0 | 1 | 2 | 3;
    xrayOne?: string;
    treatments: {
        perio: boolean;
        endo: boolean;
        restore: boolean;
        extract: boolean;
        flap: boolean;
    };
}

export type TeethMap = Record<string, ToothData>;

interface DentalChartProps {
    species: 'dog' | 'cat';
    teethData: TeethMap;
    selectedToothId: string | null;
    onToothClick: (tooth: ToothDef) => void;
}

const DentalChart: React.FC<DentalChartProps> = ({ species, teethData, selectedToothId, onToothClick }) => {
    const definitions = species === 'dog' ? DOG_TEETH : CAT_TEETH;
    const imageSrc = species === 'dog' ? dogChart : catChart;

    // Visual Markers
    const renderMarkers = (tooth: ToothDef) => {
        const data = teethData[tooth.id];
        if (!data) return null;

        const markers = [];

        // Red Circle for Missing
        if (data.missing) {
            markers.push(
                <circle
                    key="missing"
                    cx={0}
                    cy={0}
                    r="1.8" // Relative to viewbox of the marker group
                    stroke="red"
                    strokeWidth="0.4"
                    fill="none"
                />
            );
        }

        // Red Cross for Extraction
        if (data.treatments?.extract) {
            markers.push(
                <g key="extract" stroke="red" strokeWidth="0.4">
                    <line x1="-1.5" y1="-1.5" x2="1.5" y2="1.5" />
                    <line x1="1.5" y1="-1.5" x2="-1.5" y2="1.5" />
                </g>
            );
        }

        // Wave for Flap - drawing a simple sine wave path above
        if (data.treatments?.flap) {
            markers.push(
                <path
                    key="flap"
                    d="M -2 -2.5 Q -1 -3.5, 0 -2.5 T 2 -2.5"
                    stroke="blue"
                    strokeWidth="0.3"
                    fill="none"
                />
            );
        }

        // We can add more visual feedback here (e.g. fracture line)

        return markers;
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto select-none">
            {/* Container aspect ratio helper if needed, but simple img block is fine */}
            <div className="relative">
                <img src={imageSrc} alt={`${species} dental chart`} className="w-full h-auto object-contain pointer-events-none" />

                {/* SVG Overlay for interactions and markers */}
                <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {definitions.map((tooth) => {
                        const isSelected = selectedToothId === tooth.id;
                        const data = teethData[tooth.id];
                        const hasFindings = data && (data.missing || data.treatments?.extract || data.treatments?.flap); // simplified check

                        return (
                            <g
                                key={tooth.id}
                                transform={`translate(${tooth.x}, ${tooth.y})`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToothClick(tooth);
                                }}
                                className="group cursor-pointer"
                            >
                                {/* Hit Area - invisible usually, but can show hover */}
                                <circle
                                    r="3"
                                    // Explicit colors to avoid Tailwind v4 oklch() issues with html2canvas
                                    fill="transparent"
                                    className={`transition-colors duration-200 ${isSelected ? '' : 'hover:fill-[#3b82f61a]'}`}
                                    strokeWidth="0.2"
                                    style={{
                                        fill: isSelected ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                                        stroke: isSelected ? '#3b82f6' : 'transparent'
                                    }}
                                />

                                {/* Tooth Label (Tiny) - Optional, maybe only on hover? */}
                                <text
                                    y="4.5"
                                    className="text-[2px] fill-gray-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                    textAnchor="middle"
                                >
                                    {tooth.label}
                                </text>

                                {/* Visual Markers Layer */}
                                {renderMarkers(tooth)}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default DentalChart;
