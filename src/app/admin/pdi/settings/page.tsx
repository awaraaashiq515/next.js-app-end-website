"use client"

import * as React from "react"
import { PDISection, PDIItem } from "@/components/pdi/pdi-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Plus, Trash2, Edit2, ChevronUp, ChevronDown,
    LayoutGrid, ListTodo, Save, Loader2, ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function PDISettingsPage() {
    const [sections, setSections] = React.useState<PDISection[]>([])
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState<string | null>(null)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")

    const fetchStructure = async () => {
        try {
            const res = await fetch('/api/admin/pdi/settings')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setSections(data)
        } catch (error) {
            console.error("Failed to load PDI structure")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchStructure()
    }, [])

    const handleAddSection = async () => {
        const name = prompt("Enter section name:")
        if (!name) return

        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'POST',
                body: JSON.stringify({ type: 'SECTION', name })
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert("Failed to add section")
        }
    }

    const handleAddItem = async (sectionId: string) => {
        const label = prompt("Enter item label:")
        if (!label) return

        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'POST',
                body: JSON.stringify({ type: 'ITEM', sectionId, label })
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert("Failed to add item")
        }
    }

    const handleDelete = async (id: string, type: 'SECTION' | 'ITEM') => {
        if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return

        try {
            const res = await fetch(`/api/admin/pdi/settings?id=${id}&type=${type}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert(`Failed to delete ${type.toLowerCase()}`)
        }
    }

    const handleUpdate = async (id: string, type: 'SECTION' | 'ITEM', value: string) => {
        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'PUT',
                body: JSON.stringify({ type, id, name: value, label: value }) // sending both for simplicity
            })
            if (!res.ok) throw new Error()
            setEditingId(null)
            fetchStructure()
        } catch (error) {
            alert("Failed to update")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pdi">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            PDI <span className="text-amber-500">Settings</span>
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">Configure inspection sections and items.</p>
                    </div>
                </div>
                <Button
                    onClick={handleAddSection}
                    className="bg-amber-500 text-black hover:bg-white font-bold uppercase italic tracking-wider rounded-none px-6"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Section
                </Button>
            </div>

            <div className="grid gap-8">
                {sections.map((section) => (
                    <Card key={section.id} className="bg-[#111318]/40 border-white/[0.08] rounded-none backdrop-blur-md overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 group">
                                    <LayoutGrid className="w-5 h-5 text-amber-500/50" />
                                    {editingId === section.id ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-8 bg-white/5 border-white/10 text-white w-[300px]"
                                            />
                                            <Button size="sm" onClick={() => handleUpdate(section.id, 'SECTION', editValue)}>Save</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-lg font-black italic tracking-wider text-white uppercase">
                                                {section.name}
                                            </CardTitle>
                                            <button
                                                onClick={() => {
                                                    setEditingId(section.id)
                                                    setEditValue(section.name)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-500 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDelete(section.id, 'SECTION')}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Section
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-amber-500 hover:bg-amber-500/10"
                                        onClick={() => handleAddItem(section.id)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/[0.05]">
                                {section.items?.map((item: any) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <ListTodo className="w-4 h-4 text-gray-600" />
                                            {editingId === item.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-8 bg-white/5 border-white/10 text-white w-[400px]"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdate(item.id, 'ITEM', editValue)}>Save</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">{item.label}</span>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(item.id)
                                                            setEditValue(item.label)
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-500 transition-all"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id, 'ITEM')}
                                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!section.items || section.items.length === 0) && (
                                    <div className="p-8 text-center text-gray-600 italic text-sm">
                                        No items in this section. Add one to get started.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
