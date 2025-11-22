// frontend/src/components/Layout/Footer.jsx
import React from 'react';
import { Cpu, Shield, Mail, Sparkles } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-16 mb-8">
            <div className="container mx-auto px-6">
                {/* Frosted Glass Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    {/* Frosted Glass Background with subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-2xl"></div>

                    {/* Animated Border Glow */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary-500/20"></div>

                    {/* Content */}
                    <div className="relative px-8 py-6">
                        {/* Main Grid - 3 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-5">

                            {/* Left: AI Technology */}
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                        <Cpu className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white">
                                        AI-Powered Analysis
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    <strong className="text-blue-400">Sightengine AI</strong> multi-model detection (NSFW, Violence, Gore) with <strong className="text-green-400">professional accuracy</strong>
                                </p>
                            </div>

                            {/* Center: Sensitivity Legend - Compact */}
                            <div className="flex flex-col space-y-2.5">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white">
                                        Sensitivity Guide
                                    </h3>
                                </div>

                                {/* Compact Badges */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50"></div>
                                        <div className="text-[10px]">
                                            <p className="font-bold text-green-400">Safe 0-49%</p>
                                            <p className="text-gray-400">All audiences</p>
                                        </div>
                                    </div>

                                    <div className="w-px h-8 bg-gray-600"></div>

                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/50"></div>
                                        <div className="text-[10px]">
                                            <p className="font-bold text-red-400">Flagged 50-100%</p>
                                            <p className="text-gray-400">Needs review</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Attribution */}
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white">
                                        Built By
                                    </h3>
                                </div>
                                <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    Ravish Kumar
                                </p>
                                <a
                                    href="mailto:ravishrk124@gmail.com"
                                    className="text-[10px] text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center space-x-1"
                                >
                                    <Mail className="w-3 h-3" />
                                    <span>ravishrk124@gmail.com</span>
                                </a>
                            </div>
                        </div>

                        {/* Compact How It Works */}
                        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl px-4 py-3 border border-blue-500/20">
                            <p className="text-[9px] text-gray-300 leading-relaxed text-center">
                                <strong className="text-blue-300">Sightengine Multi-Model AI:</strong> Extracts 12 frames → Smart samples 6 key frames →
                                <strong className="text-purple-300"> 3 Specialized Detectors</strong> (Nudity 2.0, Gore, Offensive) →
                                <strong className="text-pink-300"> Weighted Composite Scoring</strong> →
                                Risk classification (Low/Medium/High) → Auto-flags ≥50% confidence
                            </p>
                        </div>
                        {/* Copyright - Ultra Compact */}
                        <div className="mt-3 text-center">
                            <p className="text-[8px] text-gray-500">
                                © 2025 VideoSafe AI · React · Node.js · MongoDB · FFmpeg
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
