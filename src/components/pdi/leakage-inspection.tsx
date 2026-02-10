"use client"

import * as React from "react"
import { PDILeakageItem, PDILeakageResponse } from "./pdi-types"
import { AlertTriangle, Check, Droplets } from "lucide-react"

interface LeakageInspectionProps {
    items: PDILeakageItem[]
    responses: Record<string, PDILeakageResponse>
    onChange: (itemId: string, found: boolean, notes?: string) => void
}

export function LeakageInspection({ items, responses, onChange }: LeakageInspectionProps) {
    return (
        <div className="rounded-lg border border-white/10 bg-[#111318] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                        Leakage Inspection
                    </h3>
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-xs text-gray-400">FOUND</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-xs text-gray-400">NOT FOUND</span>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
                {items.map((item) => {
                    const response = responses[item.id]
                    const found = response?.found ?? false
                    const isSet = response !== undefined

                    return (
                        <div
                            key={item.id}
                            className="p-4 bg-[#111318] hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-300 flex-1">
                                    {item.label}
                                </span>
                                <div className="flex gap-1">
                                    {/* FOUND Button */}
                                    <button
                                        type="button"
                                        onClick={() => onChange(item.id, true)}
                                        className={`
                                            w-20 h-8 rounded text-[10px] font-bold uppercase tracking-wider
                                            transition-all duration-200
                                            ${isSet && found
                                                ? 'bg-red-500/30 border-2 border-red-500 text-red-400 shadow-lg shadow-red-500/20'
                                                : 'bg-white/[0.03] border border-white/10 text-gray-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                                            }
                                        `}
                                    >
                                        Found
                                    </button>
                                    {/* NOT FOUND Button */}
                                    <button
                                        type="button"
                                        onClick={() => onChange(item.id, false)}
                                        className={`
                                            w-20 h-8 rounded text-[10px] font-bold uppercase tracking-wider
                                            transition-all duration-200
                                            ${isSet && !found
                                                ? 'bg-green-500/30 border-2 border-green-500 text-green-400 shadow-lg shadow-green-500/20'
                                                : 'bg-white/[0.03] border border-white/10 text-gray-500 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                            }
                                        `}
                                    >
                                        Not Found
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
