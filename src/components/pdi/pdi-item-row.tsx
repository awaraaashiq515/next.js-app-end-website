"use client"

import * as React from "react"
import { PDIItem, PDIStatus } from "./pdi-types"
import { Check, X, AlertTriangle } from "lucide-react"

interface PDIItemRowProps {
    item: PDIItem
    status?: PDIStatus
    notes?: string
    onChange: (itemId: string, status: PDIStatus, notes: string) => void
}

export function PDIItemRow({ item, status, notes = "", onChange }: PDIItemRowProps) {
    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            {/* Item Label */}
            <td className="py-1.5 px-2.5 text-sm text-gray-300">
                {item.label}
            </td>

            {/* Y (Pass) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "PASS", notes)}
                    className={`
                        w-8 h-8 rounded-sm text-xs font-bold
                        transition-all duration-150
                        ${status === "PASS"
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-white/[0.03] border border-white/10 text-gray-500 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400'
                        }
                    `}
                    title="Satisfactory / Passed"
                >
                    Y
                </button>
            </td>

            {/* X (Fail) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "FAIL", notes)}
                    className={`
                        w-8 h-8 rounded-sm text-xs font-bold
                        transition-all duration-150
                        ${status === "FAIL"
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-white/[0.03] border border-white/10 text-gray-500 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400'
                        }
                    `}
                    title="Unsatisfactory / Failed"
                >
                    X
                </button>
            </td>

            {/* ! (Advisory) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "WARN", notes)}
                    className={`
                        w-8 h-8 rounded-sm text-xs font-bold
                        transition-all duration-150
                        ${status === "WARN"
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                            : 'bg-white/[0.03] border border-white/10 text-gray-500 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400'
                        }
                    `}
                    title="Advisory / Attention Required"
                >
                    !
                </button>
            </td>
        </tr>
    )
}
