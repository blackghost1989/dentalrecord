import React from 'react';
import { X, Trash2, Clock, User, Download, FileText } from 'lucide-react';
import { PatientInfo } from './PatientInfoForm';
import { TeethMap } from './DentalChart';

export interface StoredRecord {
    id: string;
    timestamp: number;
    patientInfo: PatientInfo;
    teethData: TeethMap;
}

interface HistoryPanelProps {
    records: StoredRecord[];
    onLoad: (record: StoredRecord) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    onImportJson: (file: File) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ records, onLoad, onDelete, onClose, onImportJson }) => {
    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportJson(file);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white shadow-xl md:border-r border-gray-200 overflow-hidden rounded-t-2xl md:rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 pt-[max(1rem,env(safe-area-inset-top,0px))]">
                <div className="flex items-center space-x-3">
                    <div className="bg-amber-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 leading-tight">History Records</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Local Storage</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Import Button (Mobile/Secondary) */}
                <label className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer mb-2 group">
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">Import JSON File</span>
                    <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                </label>

                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm italic">No history found</p>
                    </div>
                ) : (
                    [...records].sort((a, b) => b.timestamp - a.timestamp).map(record => (
                        <div key={record.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">
                                        {record.patientInfo.petName || 'Unnamed Pet'}
                                    </span>
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">
                                        {record.patientInfo.species}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onDelete(record.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {formatDate(record.timestamp)}
                                </span>
                                <button
                                    onClick={() => onLoad(record)}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
                                >
                                    Load Record
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 text-center">
                Records are stored locally on this device.
            </div>
        </div>
    );
};

export default HistoryPanel;
