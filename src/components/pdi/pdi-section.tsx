"use client"

import * as React from "react"
import { PDISection, PDIStatus } from "./pdi-types"
import { PDIItemRow } from "./pdi-item-row"

interface PDISectionProps {
    section: PDISection
    responses: Record<string, { status: PDIStatus; notes: string }>
    onItemChange: (itemId: string, status: PDIStatus, notes: string) => void
}

export function PDISectionComponent({ section, responses, onItemChange }: PDISectionProps) {
    // Calculate section progress
    const totalItems = section.items.length
    const answeredItems = section.items.filter(item => responses[item.id]).length
    const passItems = section.items.filter(item => responses[item.id]?.status === "PASS").length
    const failItems = section.items.filter(item => responses[item.id]?.status === "FAIL").length
    const warnItems = section.items.filter(item => responses[item.id]?.status === "WARN").length

    return (
        <div className="rounded-lg border border-white/10 bg-[#111318] overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-3 py-2.5 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {section.name}
                    </h4>
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {answeredItems > 0 && (
                            <>
                                {passItems > 0 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">
                                        {passItems}
                                    </span>
                                )}
                                {failItems > 0 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                                        {failItems}
                                    </span>
                                )}
                                {warnItems > 0 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                        {warnItems}
                                    </span>
                                )}
                            </>
                        )}
                        <span className="text-[10px] text-gray-500">
                            {answeredItems}/{totalItems}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table Layout */}
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="text-left py-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Item
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-green-500/20 text-green-400 text-[10px] font-bold">
                                Y
                            </span>
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-red-500/20 text-red-400 text-[10px] font-bold">
                                X
                            </span>
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                !
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {section.items.map((item) => (
                        <PDIItemRow
                            key={item.id}
                            item={item}
                            status={responses[item.id]?.status}
                            notes={responses[item.id]?.notes || ""}
                            onChange={onItemChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
