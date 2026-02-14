import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PatientInfoForm, { PatientInfo } from './components/PatientInfoForm';
import DentalChart, { TeethMap, ToothData } from './components/DentalChart';
import DataEntryPanel from './components/DataEntryPanel';
import HistoryPanel, { StoredRecord } from './components/HistoryPanel';
import CalibrationPanel from './components/CalibrationPanel';
import { ToothDef, DOG_TEETH, CAT_TEETH } from './constants/teeth';
import { Save, History, Upload } from 'lucide-react';

const mobilityLabels: Record<number, string> = {
    1: '1(slight)',
    2: '2(moderate)',
    3: '3(severe)',
    0: '0(stable)'
};

const fractureLabels: Record<string, string> = {
    'simple_crown': 'Simple Crown',
    'complicated_crown': 'Complicated Crown',
    'simple_root': 'Simple Root',
    'complicated_root': 'Complicated Root',
    'other': 'Other'
};

const treatmentLabels: Record<string, string> = {
    perio: 'Periodontics',
    endo: 'Endodontics',
    restore: 'Restorations',
    extract: 'Extraction',
    flap: 'Flap Surgery'
};

const formatToothSummary = (id: string, data: ToothData) => {
    const findings: string[] = [];
    if (data.missing) findings.push('Missing');
    if (data.mobile && data.mobile !== 'M0') findings.push(`Mobility ${data.mobile}`);
    if (data.furcation && data.furcation !== 'none') findings.push(`Furcation ${data.furcation}`);

    // Periodontitis Logic
    let pdClass = '';
    if (data.boneLoss === '>50%' || data.furcation === 'F3') pdClass = 'PD4';
    else if (data.boneLoss === '25-50%' || data.furcation === 'F2') pdClass = 'PD3';
    else if (data.boneLoss === '<25%' || data.furcation === 'F1') pdClass = 'PD2';

    if (pdClass) findings.push(pdClass);

    if (data.recession) findings.push(`Recession ${data.recession}`);
    if (data.pocket) findings.push(`Pocket ${data.pocket}`);
    if (data.boneLoss && data.boneLoss !== 'none') findings.push(`Bone Loss ${data.boneLoss}`);
    if (data.fractureType) findings.push(`Fracture: ${data.fractureType}`);
    if (data.xrayOne) findings.push(`X-ray: ${data.xrayOne}`);

    const treatments: string[] = [];
    if (data.treatments.perio) treatments.push('Perio');
    if (data.treatments.endo) treatments.push('Endo');
    if (data.treatments.restore) treatments.push('Restore');
    if (data.treatments.extract) treatments.push('Extract');
    if (data.treatments.flap) treatments.push('Flap');

    if (findings.length === 0 && treatments.length === 0) return null;

    let summary = `${id}-`;
    if (findings.length > 0) summary += ` ${findings.join(', ')}`;
    if (treatments.length > 0) {
        summary += findings.length > 0 ? `; Tx: ${treatments.join(', ')}` : ` Tx: ${treatments.join(', ')}`;
    }
    return summary;
};

function App() {
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        ownerName: '',
        petName: '',
        recordNumber: '',
        date: new Date().toISOString().split('T')[0],
        species: 'dog',
        breed: '',
        age: '',
        gender: '',
        neutered: false,
    });

    const [teethData, setTeethData] = useState<TeethMap>({});
    const [selectedTooth, setSelectedTooth] = useState<ToothDef | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [records, setRecords] = useState<StoredRecord[]>(() => {
        const saved = localStorage.getItem('vet_dental_records');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse records', e);
            return [];
        }
    });

    // Save records to localStorage whenever they change
    const syncRecords = (updater: (prev: StoredRecord[]) => StoredRecord[]) => {
        setRecords(prev => {
            const newRecords = updater(prev);
            localStorage.setItem('vet_dental_records', JSON.stringify(newRecords));
            return newRecords;
        });
    };

    // Layout Logic
    // If tooth selected on LEFT (x < 50), panel goes LEFT, chart moves RIGHT.
    // If tooth selected on RIGHT (x >= 50), panel goes RIGHT, chart moves LEFT.
    const isSelectedLeft = selectedTooth ? selectedTooth.x < 50 : false;

    const handleSaveRecord = () => {
        const newRecord: StoredRecord = {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
            timestamp: Date.now(),
            patientInfo: { ...patientInfo },
            teethData: { ...teethData }
        };
        syncRecords(prev => [...prev, newRecord]);
        alert('Record saved to browser history!');
    };

    const handleLoadRecord = (record: StoredRecord) => {
        if (confirm(`Load record for ${record.patientInfo.petName || 'Unnamed Pet'}? Current changes will be overwritten.`)) {
            setPatientInfo(record.patientInfo);
            setTeethData(record.teethData);
            setIsHistoryOpen(false);
        }
    };

    const handleDeleteRecord = (id: string) => {
        if (confirm('Delete this record?')) {
            syncRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleExportJson = () => {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            record: {
                patientInfo,
                teethData
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dental_record_${patientInfo.petName || 'unnamed'}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportJson = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.record && data.record.patientInfo && data.record.teethData) {
                    setPatientInfo(data.record.patientInfo);
                    setTeethData(data.record.teethData);
                    setIsHistoryOpen(false);
                    alert('Record imported successfully!');
                } else {
                    throw new Error('Invalid record format');
                }
            } catch (err) {
                alert('Failed to import JSON: ' + (err as Error).message);
            }
        };
        reader.readAsText(file);
    };

    const handleToothClick = (tooth: ToothDef) => {
        setSelectedTooth(tooth);
        // Initialize data if not present
        if (!teethData[tooth.id]) {
            setTeethData(prev => ({
                ...prev,
                [tooth.id]: {
                    treatments: {
                        perio: false,
                        endo: false,
                        restore: false,
                        extract: false,
                        flap: false
                    }
                }
            }));
        }
    };

    const handlePrevTooth = () => {
        if (!selectedTooth) return;
        const list = patientInfo.species === 'dog' ? DOG_TEETH : CAT_TEETH;
        const idx = list.findIndex(t => t.id === selectedTooth.id);
        const prevIdx = (idx - 1 + list.length) % list.length;
        handleToothClick(list[prevIdx]);
    };

    const handleNextTooth = () => {
        if (!selectedTooth) return;
        const list = patientInfo.species === 'dog' ? DOG_TEETH : CAT_TEETH;
        const idx = list.findIndex(t => t.id === selectedTooth.id);
        const nextIdx = (idx + 1) % list.length;
        handleToothClick(list[nextIdx]);
    };

    const handleDataUpdate = (data: ToothData) => {
        if (selectedTooth) {
            setTeethData(prev => ({
                ...prev,
                [selectedTooth.id]: data
            }));
        }
    };


    const exportPDF = async () => {
        setExportError(null);
        setIsExporting(true);

        const originalSelected = selectedTooth;
        setSelectedTooth(null); // Close layouts for clean capture

        setTimeout(async () => {
            try {
                const element = document.getElementById('print-area');
                if (!element) throw new Error("Print area not found");

                // Create a clone of the element to capture full content without scroll/viewport limits
                const clone = element.cloneNode(true) as HTMLElement;

                // 1. CLEANUP: Remove buttons from header (fixes "Calibrate" text appearing)
                const buttons = clone.querySelectorAll('button');
                buttons.forEach(btn => btn.remove());

                // 2. GLOBAL OFFSET: Nudge labels and small text up to fix html2canvas baseline drop
                const labels = clone.querySelectorAll('label, span');
                labels.forEach(el => {
                    const htmlEl = el as HTMLElement;
                    // Apply offset only if it's not a generic container
                    if (htmlEl.innerText.trim().length > 0) {
                        htmlEl.style.position = 'relative';
                        htmlEl.style.top = '-5px'; // Lift text up more
                    }
                });

                // 3. INPUT REPLACEMENT: Convert inputs to Text Divs
                // html2canvas often clips text within <input> elements. Divs render reliably.
                const originalInputs = element.querySelectorAll('input, select, textarea');
                const clonedInputs = clone.querySelectorAll('input, select, textarea');

                originalInputs.forEach((original, index) => {
                    const cloned = clonedInputs[index] as HTMLElement;
                    if (!cloned) return;

                    const tagName = original.tagName;
                    const type = (original as HTMLInputElement).type;

                    if (type === 'checkbox' || type === 'radio') {
                        // Replace native checkbox with a styled div for perfect alignment support in html2canvas
                        const checkboxDiv = document.createElement('div');
                        const computed = window.getComputedStyle(original);

                        // Exact dimensions mapping
                        checkboxDiv.style.width = computed.width;
                        checkboxDiv.style.height = computed.height;
                        checkboxDiv.style.border = '1px solid #d1d5db'; // gray-300 default
                        checkboxDiv.style.borderRadius = computed.borderRadius;
                        checkboxDiv.style.backgroundColor = 'white';
                        checkboxDiv.style.display = 'inline-flex';
                        checkboxDiv.style.alignItems = 'center';
                        checkboxDiv.style.justifyContent = 'center';
                        checkboxDiv.style.margin = computed.margin;
                        checkboxDiv.style.boxSizing = 'border-box';
                        // Copy classes to ensure spacing utilities work (like mr-2)
                        checkboxDiv.className = cloned.className;

                        // Vertical align fix for the checkbox box itself
                        checkboxDiv.style.position = 'relative';
                        checkboxDiv.style.top = '-1px'; // Slight nudge for the box too

                        if ((original as HTMLInputElement).checked) {
                            // Add SVG Checkmark
                            checkboxDiv.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                            checkboxDiv.style.borderColor = '#2563eb'; // blue-600
                        }

                        if (cloned.parentNode) {
                            cloned.parentNode.replaceChild(checkboxDiv, cloned);
                        }

                    } else {
                        // Text inputs and Selects -> Convert to Divs for clean rendering
                        const textDiv = document.createElement('div');

                        // Capture computed styles from the LIVE element
                        const computed = window.getComputedStyle(original);

                        textDiv.style.width = computed.width;
                        textDiv.style.height = computed.height;
                        // Important: Keep horizontal padding, kill vertical to fix "Too Low" issue
                        textDiv.style.paddingLeft = computed.paddingLeft;
                        textDiv.style.paddingRight = computed.paddingRight;
                        textDiv.style.paddingTop = '0px';
                        textDiv.style.paddingBottom = '6px'; // OFFSET: Increased to 6px to push text visual up significantly
                        textDiv.style.margin = computed.margin;
                        textDiv.style.boxSizing = 'border-box';

                        textDiv.style.fontFamily = computed.fontFamily;
                        textDiv.style.fontSize = computed.fontSize;
                        textDiv.style.fontWeight = computed.fontWeight;
                        textDiv.style.color = computed.color;
                        textDiv.style.letterSpacing = computed.letterSpacing;
                        textDiv.style.lineHeight = '1'; // Tighten line height for better centering control

                        textDiv.style.backgroundColor = computed.backgroundColor;
                        textDiv.style.border = computed.border;
                        textDiv.style.borderRadius = computed.borderRadius;

                        // Flexbox for perfect Vertical Centering
                        textDiv.style.display = 'flex';
                        textDiv.style.alignItems = 'center';

                        if (computed.textAlign === 'center') {
                            textDiv.style.justifyContent = 'center';
                        } else if (computed.textAlign === 'right') {
                            textDiv.style.justifyContent = 'flex-end';
                        } else {
                            textDiv.style.justifyContent = 'flex-start';
                        }

                        // Get value
                        let displayValue = (original as HTMLInputElement).value;
                        if (tagName === 'SELECT') {
                            const sel = original as HTMLSelectElement;
                            displayValue = sel.options[sel.selectedIndex]?.text || '';
                        }

                        textDiv.textContent = displayValue;
                        textDiv.style.whiteSpace = 'nowrap';
                        textDiv.style.overflow = 'hidden';

                        if (cloned.parentNode) {
                            cloned.parentNode.replaceChild(textDiv, cloned);
                        }
                    }
                });

                // Style the clone to force full expansion
                clone.style.position = 'absolute';
                clone.style.top = '-9999px';
                clone.style.left = '0';
                clone.style.width = '1280px'; // Force a nice wide desktop view
                clone.style.height = 'auto'; // Allow full height
                clone.style.overflow = 'visible';
                clone.style.zIndex = '-1';
                clone.style.backgroundColor = '#ffffff';

                // Ensure all scrollable containers in clone are expanded
                const scrollables = clone.querySelectorAll('.overflow-hidden, .overflow-auto');
                scrollables.forEach(el => {
                    (el as HTMLElement).style.overflow = 'visible';
                    (el as HTMLElement).style.height = 'auto';
                });

                // Fix header sticky in clone
                const stickyHeaders = clone.querySelectorAll('.sticky');
                stickyHeaders.forEach(el => {
                    (el as HTMLElement).style.position = 'static';
                });

                document.body.appendChild(clone);

                // Capture
                const canvas = await html2canvas(clone, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff',
                    windowWidth: 1280,
                    height: clone.scrollHeight // Explicitly capture full height
                });

                // Cleanup clone
                document.body.removeChild(clone);

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${patientInfo.petName || 'pet'}_dental_chart.pdf`);

            } catch (error: any) {
                console.error("PDF Export Failed:", error);
                setExportError(error.message || "Unknown error occurred during export.");
            } finally {
                // Restore state
                setSelectedTooth(originalSelected);
                setIsExporting(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans" id="print-area">
            {/* Header / Patient Info */}
            <div className={`bg-white shadow z-30 ${isExporting ? 'relative' : 'sticky top-0'} pt-[max(12px,env(safe-area-inset-top,44px))]`}>
                <div className="max-w-7xl mx-auto">
                    {exportError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-2 relative" role="alert">
                            <strong className="font-bold">Export Error: </strong>
                            <span className="block sm:inline">{exportError}</span>
                            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setExportError(null)}>
                                <span className="text-red-500 font-bold">×</span>
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                        <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate mr-2">Veterinary Dental Chart</h1>
                        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center space-x-1 md:space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm border border-amber-200 transition"
                                title="歷史紀錄"
                            >
                                <History className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">歷史</span>
                            </button>
                            <button
                                onClick={handleSaveRecord}
                                className="flex items-center space-x-1 md:space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm border border-blue-200 transition"
                                title="快速儲存"
                            >
                                <Save className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">儲存</span>
                            </button>
                            <button
                                onClick={handleExportJson}
                                className="flex items-center space-x-1 md:space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm border border-green-200 transition"
                                title="匯出備份 (JSON)"
                            >
                                <Upload className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">備份</span>
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button
                                onClick={exportPDF}
                                disabled={isExporting}
                                className={`flex items-center space-x-1 md:space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm transition ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Download className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">{isExporting ? '生成中...' : '導出 PDF'}</span>
                                <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
                            </button>
                        </div>
                    </div>
                    <PatientInfoForm info={patientInfo} onChange={setPatientInfo} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 relative flex flex-col md:flex-row ${isExporting ? 'overflow-visible' : 'overflow-hidden'}`}>

                {/* Left Panel Container (Desktop Side, Mobile Bottom Sheet style) */}
                <AnimatePresence>
                    {isHistoryOpen && (
                        <motion.div
                            initial={window.innerWidth < 768 ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
                            animate={window.innerWidth < 768 ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                            exit={window.innerWidth < 768 ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-50 md:relative md:inset-auto md:z-10 md:w-80 h-full"
                        >
                            <HistoryPanel
                                records={records}
                                onLoad={handleLoadRecord}
                                onDelete={handleDeleteRecord}
                                onImportJson={handleImportJson}
                                onClose={() => setIsHistoryOpen(false)}
                            />
                        </motion.div>
                    )}

                    {selectedTooth && (
                        <motion.div
                            initial={window.innerWidth < 768 ? { y: '100%', opacity: 0 } : { x: isSelectedLeft ? -320 : 320, opacity: 0 }}
                            animate={window.innerWidth < 768 ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                            exit={window.innerWidth < 768 ? { y: '100%', opacity: 0 } : { x: isSelectedLeft ? -320 : 320, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto z-40 md:z-20 border-t md:border-t-0 md:border-r md:border-l border-gray-200 bg-white ${window.innerWidth < 768 ? 'h-[80vh] w-full' : 'h-[calc(100vh-200px)] w-80 flex-shrink-0'}`}
                        >
                            <DataEntryPanel
                                toothId={selectedTooth.id}
                                data={teethData[selectedTooth.id] || { treatments: {} }}
                                species={patientInfo.species}
                                onUpdate={handleDataUpdate}
                                onPrev={handlePrevTooth}
                                onNext={handleNextTooth}
                                onClose={() => setSelectedTooth(null)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chart Container */}
                <motion.div
                    className="flex-1 flex items-start justify-center bg-gray-50 p-1 md:p-2 overflow-auto min-h-0"
                    layout
                >
                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-0 md:p-2">
                        <DentalChart
                            species={patientInfo.species}
                            teethData={teethData}
                            selectedToothId={selectedTooth?.id || null}
                            onToothClick={handleToothClick}
                        />
                    </div>
                </motion.div>
            </div>


            {/* Findings Summary Section */}
            <div className="bg-white border-t border-gray-200 p-4 pt-2">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Dental Examination Findings Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                        {Object.entries(teethData)
                            .map(([id, data]) => formatToothSummary(id, data))
                            .filter(summary => summary !== null)
                            .sort((a, b) => {
                                // Extract tooth ID for numeric sorting
                                const idA = a?.split('-')[0] || '';
                                const idB = b?.split('-')[0] || '';
                                return parseInt(idA) - parseInt(idB);
                            })
                            .map((summary, idx) => (
                                <div key={idx} className="text-sm text-gray-700 font-medium py-1 border-b border-gray-50 last:border-0">
                                    {summary}
                                </div>
                            ))}
                    </div>
                    {Object.keys(teethData).filter(id => formatToothSummary(id, teethData[id])).length === 0 && (
                        <p className="text-sm text-gray-400 italic">No clinical findings recorded.</p>
                    )}
                </div>
            </div>

        </div >
    );
}

export default App;
