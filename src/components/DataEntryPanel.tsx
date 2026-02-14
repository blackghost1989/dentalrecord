import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { ToothData } from './DentalChart';

interface DataEntryPanelProps {
    toothId: string;
    data: ToothData;
    species: 'dog' | 'cat';
    onUpdate: (data: ToothData) => void;
    onPrev: () => void;
    onNext: () => void;
    onClose: () => void;
}

const DataEntryPanel: React.FC<DataEntryPanelProps> = ({ toothId, data, species, onUpdate, onPrev, onNext, onClose }) => {
    // Helper to update fields
    const updateField = (field: keyof ToothData, value: any) => {
        onUpdate({ ...data, [field]: value });
    };

    const updateTreatment = (field: keyof ToothData['treatments'], value: boolean) => {
        const currentTreatments = data.treatments || {};
        let newTreatments = { ...currentTreatments, [field]: value };

        // Exclusivity Rule: Extraction overrides most other treatments
        if (field === 'extract' && value === true) {
            newTreatments = {
                ...newTreatments,
                perio: false,
                endo: false,
                restore: false
                // flap remains available
            };
        }

        onUpdate({
            ...data,
            treatments: newTreatments,
        });
    };

    const SectionHeader = ({ title, isOpen, toggle }: { title: string, isOpen: boolean, toggle: () => void }) => (
        <button
            onClick={toggle}
            className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 text-left"
        >
            {isOpen ? <ChevronDown className="w-3 h-3 mr-2" /> : <ChevronRight className="w-3 h-3 mr-2" />}
            {title}
        </button>
    );

    const [findingsOpen, setFindingsOpen] = useState(true);
    const [treatmentsOpen, setTreatmentsOpen] = useState(true);

    const idNum = parseInt(toothId);
    let showFurcation = true;
    if (species === 'dog') {
        const noFurcationTeeth = [101, 102, 103, 104, 105, 201, 202, 203, 204, 205, 301, 302, 303, 304, 305, 311, 401, 402, 403, 404, 405, 411];
        if (noFurcationTeeth.includes(idNum)) showFurcation = false;
    } else {
        const noFurcationTeeth = [101, 102, 103, 104, 106, 109, 201, 202, 203, 204, 206, 209, 301, 302, 303, 304, 401, 402, 403, 404];
        if (noFurcationTeeth.includes(idNum)) showFurcation = false;
    }

    return (
        <div className="h-full flex flex-col bg-white shadow-xl md:border-l border-gray-200 overflow-hidden rounded-t-2xl md:rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 pt-[max(1rem,env(safe-area-inset-top,0px))]">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                        {toothId}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 leading-tight">Tooth Assessment</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Point Selection Active</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={onPrev}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100"
                        aria-label="Previous Tooth"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={onNext}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100"
                        aria-label="Next Tooth"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-10">

                {/* 1. Exam & Findings */}
                <SectionHeader title="1. Exam & Findings" isOpen={findingsOpen} toggle={() => setFindingsOpen(!findingsOpen)} />
                {findingsOpen && (
                    <div className="p-4 space-y-4">
                        {/* Missing */}
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={!!data.missing}
                                onChange={(e) => updateField('missing', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-medium text-gray-700">Missing Tooth</span>
                        </label>

                        {/* Mobility Index */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mobility Index</label>
                            <select
                                value={data.mobile || 'M0'}
                                onChange={(e) => updateField('mobile', e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="M0">M0, &lt;0.2mm</option>
                                <option value="M1">M1, 0.2-0.5mm</option>
                                <option value="M2">M2, 0.5-1mm</option>
                                <option value="M3">M3, &gt;3mm</option>
                            </select>
                        </div>

                        {/* Furcation */}
                        {showFurcation && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Furcation</label>
                                <select
                                    value={data.furcation || 'none'}
                                    onChange={(e) => updateField('furcation', e.target.value)}
                                    className="w-full border rounded p-2 text-sm"
                                >
                                    <option value="none">None</option>
                                    <option value="F1">F1</option>
                                    <option value="F2">F2</option>
                                    <option value="F3">F3</option>
                                </select>
                            </div>
                        )}

                        {/* Gingival Recession */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Gingival Recession</label>
                            <select
                                value={data.recession || ''}
                                onChange={(e) => updateField('recession', e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="">None</option>
                                {[...Array(20)].map((_, i) => (
                                    <option key={i + 1} value={`${i + 1}mm`}>{i + 1}mm</option>
                                ))}
                            </select>
                        </div>

                        {/* Perio Pocket Depth */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Perio Pocket Depth</label>
                            <select
                                value={data.pocket || ''}
                                onChange={(e) => updateField('pocket', e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="">None</option>
                                {[...Array(20)].map((_, i) => (
                                    <option key={i + 1} value={`${i + 1}mm`}>{i + 1}mm</option>
                                ))}
                            </select>
                        </div>

                        {/* Alveolar Bone Loss */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Alveolar Bone Loss</label>
                            <select
                                value={data.boneLoss || 'none'}
                                onChange={(e) => updateField('boneLoss', e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="none">None</option>
                                <option value="<25%">&lt;25%</option>
                                <option value="25-50%">25-50%</option>
                                <option value=">50%">&gt;50%</option>
                            </select>
                        </div>

                        {/* Fracture */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Fracture</label>
                            <select
                                value={data.fractureType || ''}
                                onChange={(e) => updateField('fractureType', e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="">None</option>
                                <option value="simple_crown">Simple Crown</option>
                                <option value="complicated_crown">Complicated Crown</option>
                                <option value="simple_root">Simple Root</option>
                                <option value="complicated_root">Complicated Root</option>
                            </select>
                        </div>

                        {/* Gingivitis Index */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Gingivitis Index</label>
                            <div className="flex space-x-2">
                                {[0, 1, 2, 3].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => updateField('gingivitis', val)}
                                        className={`flex-1 py-1 text-sm border rounded ${data.gingivitis === val ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white text-gray-600'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calculus Index */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Calculus Index</label>
                            <div className="flex space-x-2">
                                {[0, 1, 2, 3].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => updateField('calculus', val)}
                                        className={`flex-1 py-1 text-sm border rounded ${data.calculus === val ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white text-gray-600'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* X-ray Findings */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">X-ray Findings</label>
                            <textarea
                                value={data.xrayOne || ''}
                                onChange={(e) => updateField('xrayOne', e.target.value)}
                                className="w-full border rounded p-2 text-sm h-20"
                                placeholder="Notes..."
                            />
                        </div>
                    </div>
                )}

                {/* 2. Treatment & Procedures */}
                <SectionHeader title="2. Treatment & Procedures" isOpen={treatmentsOpen} toggle={() => setTreatmentsOpen(!treatmentsOpen)} />
                {treatmentsOpen && (
                    <div className="p-4 space-y-3">
                        {[
                            { key: 'perio', label: 'Periodontics' },
                            { key: 'endo', label: 'Endodontics' },
                            { key: 'restore', label: 'Restorations' },
                            { key: 'extract', label: 'Extractions' },
                            { key: 'flap', label: 'Flap Surgery' },
                        ].map((item) => {
                            const isExtraction = !!data.treatments?.extract;
                            const isDisabled = isExtraction && ['perio', 'endo', 'restore'].includes(item.key);

                            return (
                                <label
                                    key={item.key}
                                    className={`flex items-center space-x-2 p-2 rounded transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!data.treatments?.[item.key as keyof typeof data.treatments]}
                                        onChange={(e) => !isDisabled && updateTreatment(item.key as keyof typeof data.treatments, e.target.checked)}
                                        disabled={isDisabled}
                                        className={`w-4 h-4 rounded focus:ring-green-500 ${isDisabled ? 'text-gray-400' : 'text-green-600'}`}
                                    />
                                    <span className="text-gray-700 text-sm font-medium">{item.label}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 pb-[calc(1rem+env(safe-area-inset-bottom,20px))] md:pb-4">
                <button onClick={onClose} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all">
                    <Save className="w-5 h-5" />
                    <span>Done</span>
                </button>
            </div>
        </div>
    );
};

export default DataEntryPanel;
