import React from 'react';
import { PawPrint, User, FileText, ChevronDown, Calendar } from 'lucide-react';

export interface PatientInfo {
    ownerName: string;
    petName: string;
    recordNumber: string;
    date: string;
    species: 'dog' | 'cat';
    breed: string; // Not strictly required by prompt but good to have, prompt says "Species" implies selection for chart.
    age: string;
    gender: 'M' | 'F' | 'FS' | 'MN' | ''; // Male, Female, Female Spayed, Male Neutered
    neutered: boolean;
}

interface PatientInfoFormProps {
    info: PatientInfo;
    onChange: (info: PatientInfo) => void;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ info, onChange }) => {
    const [isExpanded, setIsExpanded] = React.useState(window.innerWidth >= 768);

    const handleChange = (field: keyof PatientInfo, value: any) => {
        onChange({ ...info, [field]: value });
    };

    const hasData = info.ownerName || info.petName || info.recordNumber;

    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            {/* Header / Toggle for Desktop & Mobile */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2 overflow-hidden">
                    <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-700 truncate">
                        {hasData ? `${info.petName || 'Pet'} (${info.ownerName || 'Owner'})` : 'Patient Information'}
                    </span>
                    {info.species && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded capitalize">
                            {info.species}
                        </span>
                    )}
                </div>
                <div className="flex items-center text-blue-600 text-xs font-bold">
                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                    <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Form Content */}
            <div className={`p-4 ${!isExpanded ? 'hidden' : 'block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Owner Name */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner Name</label>
                        <div className="flex items-center mt-1">
                            <User className="w-4 h-4 text-gray-400 absolute left-2" />
                            <input
                                type="text"
                                value={info.ownerName}
                                onChange={(e) => handleChange('ownerName', e.target.value)}
                                className="pl-8 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Pet Name */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Pet Name</label>
                        <div className="flex items-center mt-1">
                            <PawPrint className="w-4 h-4 text-gray-400 absolute left-2" />
                            <input
                                type="text"
                                value={info.petName}
                                onChange={(e) => handleChange('petName', e.target.value)}
                                className="pl-8 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Fluffy"
                            />
                        </div>
                    </div>

                    {/* Record Number */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Record ID</label>
                        <div className="flex items-center mt-1">
                            <FileText className="w-4 h-4 text-gray-400 absolute left-2" />
                            <input
                                type="text"
                                value={info.recordNumber}
                                onChange={(e) => handleChange('recordNumber', e.target.value)}
                                className="pl-8 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="MRN-12345"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                        <div className="flex items-center mt-1">
                            <Calendar className="w-4 h-4 text-gray-400 absolute left-2" />
                            <input
                                type="date"
                                value={info.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="pl-8 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Species Select */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Species</label>
                        <div className="flex items-center mt-1">
                            <select
                                value={info.species}
                                onChange={(e) => handleChange('species', e.target.value as 'dog' | 'cat')}
                                className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                            >
                                <option value="dog">Dog (Canine)</option>
                                <option value="cat">Cat (Feline)</option>
                            </select>
                        </div>
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
                        <input
                            type="text"
                            value={info.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g. 5y 2m"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                        <select
                            value={info.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="MN">Male Neutered</option>
                            <option value="FS">Female Spayed</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientInfoForm;
