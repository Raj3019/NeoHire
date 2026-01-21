'use client';
import React, { useState, useRef } from 'react';
import { NeoButton, NeoCard, NeoBadge } from '@/components/ui/neo';
import { tryAPI } from '@/lib/api';
import { Upload, Flame, AlertCircle, FileText, CheckCircle2, Download, RefreshCw, Sparkles, Ghost, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function RoastPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roastData, setRoastData] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('PDF ONLY. We don\'t speak Word or JPG here.');
                setFile(null);
                return;
            }
            
            // 2MB limit
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('FILE TOO LARGE! Maximum size is 2MB. Please compress your resume.');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const [loadingStage, setLoadingStage] = useState('Analyzing Resume...');
    const [progress, setProgress] = useState(0);
    
    const handleRoast = async () => {
        if (!file) {
            setError('Select a resume first, champ.');
            return;
        }

        setLoading(true);
        setProgress(0); // Reset progress immediately
        setError(null);
        setRoastData(null);
        
        // Sequence of humorous loading stages
        const stages = [
            { text: 'Scanning for Lies...', p: 15 },
            { text: 'Analyzing Buzzword Overdose...', p: 35 },
            { text: 'Cultivating Disappointment...', p: 65 },
            { text: 'Preparing Burn Wards...', p: 85 },
            { text: 'Generating Emotional Damage...', p: 95 }
        ];

        let stageIndex = 0;
        const stageInterval = setInterval(() => {
            if (stageIndex < stages.length) {
                setLoadingStage(stages[stageIndex].text);
                setProgress(stages[stageIndex].p);
                stageIndex++;
            }
        }, 1500);

        try {
            const formData = new FormData();
            formData.append('roastResume', file);
            const result = await tryAPI.roastResume(formData);
            
            if (result.success) {
                clearInterval(stageInterval);
                setProgress(100);
                setRoastData(result.data);
                setTimeout(() => {
                    document.getElementById('roast-result')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                setError(result.message || 'The AI is too stunned by your resume to roast it. Try again.');
            }
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message);
            // setError(err.response?.data?.message || 'Server had a breakdown reading your resume. Try again?');
        } finally {
            clearInterval(stageInterval);
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setRoastData(null);
        setError(null);
        setProgress(0); // Ensure progress is reset
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-neo-bg py-12 px-4 selection:bg-neo-yellow selection:text-neo-black">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-3 transform -rotate-1">
                        <NeoBadge variant="red" className="text-sm md:text-md px-3 py-1.5 border-2 shadow-neo-sm">
                            <span className="flex items-center gap-2">
                                <Flame className="w-4 h-4 fill-current" />
                                RESUME ROASTER v1.0
                                <Flame className="w-4 h-4 fill-current" />
                            </span>
                        </NeoBadge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-neo-black dark:text-white mb-2 drop-shadow-[2px_2px_0px_#FFD700]">
                        Emotional <span className="text-neo-red">Damage</span> <br/> 
                        <span className="italic text-2xl md:text-4xl">as a Service.</span>
                    </h1>
                    <p className="text-sm md:text-base font-mono font-bold bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white px-4 py-2 inline-block shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff] transform rotate-1">
                        Upload your resume and let our AI tell you <br className="hidden md:block"/> why you're still unemployed.
                    </p>
                </div>

                {/* Upload Section */}
                {!roastData && (
                    <NeoCard className="border-2 md:border-3 shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] p-5 md:p-8 relative overflow-hidden bg-white dark:bg-zinc-900 border-neo-black dark:border-white">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Ghost className="w-16 h-16" />
                        </div>

                        {!loading ? (
                            <div className="flex flex-col items-center justify-center text-center space-y-6">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full max-w-md p-5 md:p-6 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center group
                                        ${file ? 'border-neo-green bg-neo-green/5' : 'border-neo-black dark:border-white hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                                >
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                    />
                                    {file ? (
                                        <>
                                            <div className="w-12 h-12 bg-neo-green border-2 border-neo-black flex items-center justify-center mb-2 shadow-neo-sm text-white">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <p className="text-lg font-black uppercase mb-0.5">{file.name}</p>
                                            <p className="text-xs font-bold text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • READY TO BURN</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-neo-yellow border-2 border-neo-black flex items-center justify-center mb-2 shadow-neo-sm group-hover:-translate-y-1 transition-transform">
                                                <Upload className="w-6 h-6 text-neo-black" />
                                            </div>
                                            <p className="text-lg font-black uppercase">Click to feed the beast</p>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">PDF ONLY (MAX 2MB). No mercy.</p>
                                        </>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-neo-red text-white border-2 border-neo-black p-3 text-sm flex items-center gap-3 animate-shake">
                                        <AlertCircle className="shrink-0 w-4 h-4" />
                                        <span className="font-black uppercase">{error}</span>
                                    </div>
                                ) }

                                <NeoButton 
                                    variant="danger"
                                    className="text-lg md:text-xl py-3 md:py-4 px-8 w-full max-w-md border-2 md:border-3 shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff]"
                                    onClick={handleRoast}
                                    disabled={!file}
                                >
                                    ROAST MY RESUME
                                </NeoButton>
                            </div>
                        ) : (
                            <div className="py-8 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="relative">
                                    <div className="w-24 h-24 border-6 border-neo-black border-t-neo-red rounded-full animate-spin"></div>
                                    <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-neo-red animate-pulse" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl md:text-4xl font-black uppercase italic animate-pulse text-neo-black dark:text-white">
                                        {loadingStage}
                                    </h3>
                                    <p className="text-lg font-mono font-bold animate-bounce text-gray-500">
                                        (The AI is laughing too hard)
                                    </p>
                                </div>
                                
                                <div className="w-full max-w-xs bg-gray-100 dark:bg-zinc-800 border-2 border-neo-black h-6 relative overflow-hidden shadow-neo-sm">
                                     <div className="absolute inset-y-0 left-0 bg-neo-red transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                                     <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
                                         <span className="text-white font-black text-xs">{progress}%</span>
                                     </div>
                                </div>
                            </div>
                        )}
                    </NeoCard>
                )}

                {/* Result Section */}
                {roastData && (
                    <div id="roast-result" className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <NeoCard className="border-2 md:border-3 border-neo-black dark:border-white shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] p-0 overflow-hidden bg-white dark:bg-zinc-900">
                            <div className="bg-neo-black dark:bg-zinc-800 text-white p-4 md:p-5 border-b-2 md:border-b-3 border-neo-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-neo-green p-1.5 border-2 border-white shadow-neo-sm">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter">THE VERDICT</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <NeoButton variant="ghost" size="sm" onClick={reset} className="text-white hover:text-neo-red text-xs uppercase font-black">
                                        [ Reset ]
                                    </NeoButton>
                                </div>
                            </div>

                            {/* Critical Metrics Bar */}
                            <div className="bg-neo-yellow border-b-2 border-neo-black p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-neo-black/60">Employability</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-white border border-neo-black overflow-hidden">
                                            <div className="h-full bg-neo-red" style={{ width: '12%' }}></div>
                                        </div>
                                        <span className="font-black text-xs italic">CRITICAL</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-neo-black/60">Cringe Level</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-white border border-neo-black overflow-hidden">
                                            <div className="h-full bg-neo-red" style={{ width: '98%' }}></div>
                                        </div>
                                        <span className="font-black text-xs italic text-neo-red">MAX</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-neo-black/60">Resume Health</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-white border border-neo-black overflow-hidden">
                                            <div className="h-full bg-neo-green" style={{ width: '4%' }}></div>
                                        </div>
                                        <span className="font-black text-xs italic">TERMINAL</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-8">
                                <div className="bg-zinc-50 dark:bg-zinc-800 border-2 md:border-3 border-neo-black dark:border-white p-5 md:p-8 shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff] transform rotate-1 relative">
                                    <div className="absolute -top-4 -left-4 bg-neo-yellow border-2 border-neo-black p-2 shadow-neo-sm">
                                        <Sparkles className="w-5 h-5 text-black" />
                                    </div>
                                    
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-xl md:text-2xl font-black uppercase mb-6 border-b-4 border-neo-black dark:border-white pb-2 text-neo-blue" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-lg md:text-xl font-black uppercase mb-4 mt-8 text-neo-red" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-md md:text-lg font-black uppercase mb-3 mt-6 text-neo-black dark:text-white" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-6 font-mono font-bold leading-relaxed text-neo-black dark:text-white border-l-4 border-neo-red/20 pl-4" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-6" {...props} />,
                                                li: ({node, ...props}) => (
                                                    <li className="flex items-start gap-3 font-mono font-bold text-neo-black dark:text-white bg-neo-yellow/5 p-3 border-2 border-dashed border-neo-black/10">
                                                        <span className="text-neo-red mt-1 shrink-0">💀</span>
                                                        <span>{props.children}</span>
                                                    </li>
                                                ),
                                                strong: ({node, ...props}) => <strong className="font-black px-1 bg-neo-yellow text-neo-black" {...props} />,
                                                em: ({node, ...props}) => <em className="italic font-bold text-neo-blue" {...props} />,
                                            }}
                                        >
                                            {roastData.roast.replace(/\n(?!\n)/g, '\n\n')}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neo-yellow border-t-2 md:border-t-3 border-neo-black p-2 text-center">
                                <p className="font-black uppercase tracking-widest text-[10px] md:text-xs text-neo-black">
                                    ROAST COMPLETE. HUMILITY GAINED.
                                </p>
                            </div>
                        </NeoCard>
                        
                        <div className="flex justify-center">
                            <NeoButton 
                                variant="danger"
                                className="text-lg md:text-xl py-4 md:py-5 px-10 border-2 md:border-4 shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] hover:scale-105 active:scale-95 transition-transform"
                                onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just got my resume roasted by NeoHire AI and I'm crying. Send help!`, '_blank')}
                            >
                                SHARE ON X (AND CRY)
                            </NeoButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
