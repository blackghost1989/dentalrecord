import React, { useState, useEffect } from 'react';
import { ToothDef } from '../constants/teeth';
import { Copy, Check, RotateCcw } from 'lucide-react';

interface CalibrationPanelProps {
    species: 'dog' | 'cat';
    teethList: ToothDef[];
    onClose: () => void;
    currentToothIndex: number;
    onReset: () => void;
    calibrationData: Record<string, { x: number; y: number }>;
}

const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
    species,
    teethList,
    onClose,
    currentToothIndex,
    onReset,
    calibrationData
}) => {
    const [copied, setCopied] = useState(false);

    // Determine current step
    const isComplete = currentToothIndex >= teethList.length;
    const currentTooth = !isComplete ? teethList[currentToothIndex] : null;

    // Generate output code
    const generateCode = () => {
        const lines = teethList.map(tooth => {
            const coords = calibrationData[tooth.id];
            // If we have new coords, use them. If not (skipped?), use original.
            // But we expect user to click all. 
            const x = coords ? coords.x.toFixed(1) : tooth.x;
            const y = coords ? coords.y.toFixed(1) : tooth.y;

            return `    createTooth('${tooth.id}', ${x}, ${y}, ${tooth.isMaxillary}, ${tooth.quadrant}),`;
        });

        return `export const ${species === 'dog' ? 'DOG_TEETH' : 'CAT_TEETH'}: ToothDef[] = [\n${lines.join('\n')}\n];`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50 flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    Calibration Mode
                </div>
                {!isComplete ? (
                    <div className="text-lg">
                        Click on tooth: <span className="font-bold text-blue-600">{currentTooth?.id}</span>
                        <span className="text-gray-500 text-sm ml-2">({currentToothIndex + 1} / {teethList.length})</span>
                    </div>
                ) : (
                    <div className="text-lg font-bold text-green-600 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Calibration Complete!
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isComplete && (
                    <p className="text-sm text-gray-500 italic mr-4 hidden md:block">
                        Click the center of the tooth on the chart image.
                    </p>
                )}

                {isComplete && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Config Code'}
                    </button>
                )}

                <button
                    onClick={onReset}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Restart"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition ml-2"
                >
                    Exit
                </button>
            </div>

            {/* Hidden TextArea for easier manual copy if clipboard fails */}
            {isComplete && (
                <textarea
                    className="sr-only"
                    readOnly
                    value={generateCode()}
                />
            )}
        </div>
    );
};

export default CalibrationPanel;
