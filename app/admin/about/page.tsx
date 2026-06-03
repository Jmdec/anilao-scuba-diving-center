"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createPortal } from "react-dom";
import {
    Shield, Star, Heart, Leaf, Zap, Globe, Users, Award,
    Anchor, Fish, Waves, Sun, Wind, Eye, Compass, Map,
    BookOpen, Clock, ThumbsUp, CheckCircle, Lightbulb, Smile,
    Camera, Wrench, Lock, Unlock, Key, Target, Flame, Droplets,
    Mountain, Binoculars, Search, MessageCircle, Handshake,
    Sparkles, Crown, Diamond, Trophy, Medal, Gem, GraduationCap,
} from "lucide-react";

export type TeamLevel = "owner" | "manager" | "staff" | "guide" | "support";

interface StoryItem {
    id?: number;
    heading: string;
    content: string;
    sort_order?: number;
}

interface ValueItem {
    id?: number;
    icon: string;
    title: string;
    body: string;
    accent?: string;
    sort_order?: number;
}

interface TeamMember {
    id?: number;
    name: string;
    role: string;
    bio: string;
    level: TeamLevel;
    sort_order?: number;
}

interface AboutData {
    title: string;
    slug: string;
    stories: StoryItem[];
    values: ValueItem[];
    teamMembers: TeamMember[];
    storyImages: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_LEVELS: { value: TeamLevel; label: string; color: string; badge: string }[] = [
    { value: "owner", label: "Owner / Founder", color: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
    { value: "manager", label: "Management", color: "bg-sky-50 border-sky-200", badge: "bg-sky-100 text-sky-700" },
    { value: "guide", label: "Dive Guides", color: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700" },
    { value: "staff", label: "Staff", color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-slate-600" },
    { value: "support", label: "Support", color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
];

const LEVEL_ORDER: TeamLevel[] = ["owner", "manager", "guide", "staff", "support"];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield, Star, Heart, Leaf, Zap, Globe, Users, Award,
    Anchor, Fish, Waves, Sun, Wind, Eye, Compass, Map,
    BookOpen, Clock, ThumbsUp, CheckCircle, Lightbulb, Smile,
    Camera, Wrench, Lock, Unlock, Key, Target, Flame, Droplets,
    Mountain, Binoculars, Search, MessageCircle, Handshake,
    Sparkles, Crown, Diamond, Trophy, Medal, Gem, GraduationCap,
};

const KEYWORD_ICON_MAP: [RegExp, string][] = [
    [/safe|secur|protect|helmet/i, "Shield"],
    [/award|excel|best|top|honor/i, "Award"],
    [/star|premium|quality|rate/i, "Star"],
    [/heart|care|passion|love|warm/i, "Heart"],
    [/eco|green|sustain|environ|nature/i, "Leaf"],
    [/fast|quick|speed|energy|power/i, "Zap"],
    [/world|global|international|reach/i, "Globe"],
    [/team|community|group|family/i, "Users"],
    [/ancho|stable|ground|base/i, "Anchor"],
    [/marine|fish|sea\s?life|ocean life/i, "Fish"],
    [/wave|water|ocean|sea|dive|diving/i, "Waves"],
    [/sun|bright|light|day|warm/i, "Sun"],
    [/wind|breath|air|fresh/i, "Wind"],
    [/vision|sight|see|observe/i, "Eye"],
    [/compass|direction|guid|navig/i, "Compass"],
    [/explor|adventure|map|discov/i, "Map"],
    [/train|learn|educat|certif|book/i, "BookOpen"],
    [/time|punctu|schedul|reliab/i, "Clock"],
    [/satisf|happi|approva|thumb/i, "ThumbsUp"],
    [/commit|promise|trust|verif/i, "CheckCircle"],
    [/innovat|idea|creat|inspir/i, "Lightbulb"],
    [/fun|enjoy|smile|friendl/i, "Smile"],
    [/photo|camera|film|record/i, "Camera"],
    [/equip|tool|gear|maintain/i, "Wrench"],
    [/privat|confid|discret/i, "Lock"],
    [/open|transpar|honest/i, "Unlock"],
    [/access|key|unlock|entry/i, "Key"],
    [/goal|target|focus|aim/i, "Target"],
    [/passion|fire|enthus/i, "Flame"],
    [/clean|pure|fresh|crystal/i, "Droplets"],
    [/challeng|summit|climb|peak/i, "Mountain"],
    [/watch|observ|monitor|spot/i, "Binoculars"],
    [/research|search|find|discov/i, "Search"],
    [/communic|connect|chat|talk/i, "MessageCircle"],
    [/partner|collab|cooperat|handshak/i, "Handshake"],
    [/magic|special|unique|spark/i, "Sparkles"],
    [/leader|chief|head|direct/i, "Crown"],
    [/luxury|premium|exclus|diamond/i, "Diamond"],
    [/trophy|win|champion|first/i, "Trophy"],
    [/medal|achieve|accomplish/i, "Medal"],
    [/gem|rare|valuabl|precious/i, "Gem"],
];

function iconFromTitle(title: string): string {
    for (const [pattern, icon] of KEYWORD_ICON_MAP) {
        if (pattern.test(title)) return icon;
    }
    return "Star";
}

// A URL is "stored" only if it exactly matches one of the preset options
function isStoredUrl(url: string): boolean {
    return STORY_IMAGE_OPTIONS.some((o) => o.value === url);
}

function toArray<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val as T[];
    if (val && typeof val === "object") return Object.values(val) as T[];
    return [];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultAboutData: AboutData = {
    title: "About Us",
    slug: "about-us",
    stories: [],
    values: [],
    teamMembers: [],
    storyImages: [],
};

type Tab = "story" | "images" | "values" | "team";
type StoryImageMode = "stored" | "upload";

const STORY_IMAGE_OPTIONS = [
    { label: "Choose a story image", value: "" },
    { label: "Underwater tropical scene", value: "/uploads/1755248496669_underwater-tropical-scene.png" },
    { label: "Diving coral reef", value: "/underwater-coral-reef-with-colorful-fish-and-marin.png" },
    { label: "Anilao reef adventure", value: "/underwater-coral-reef-anilao-diving.png" },
    { label: "Diver exploring coral reef", value: "/scuba-diver-exploring-coral-reef.png" },
];

const TABS: { id: Tab; label: string }[] = [
    { id: "story", label: "Story Blocks" },
    { id: "images", label: "Story Images" },
    { id: "values", label: "Core Values" },
    { id: "team", label: "Team Members" },
];

// ─── IconPreview ──────────────────────────────────────────────────────────────

function IconPreview({ name }: { name: string }) {
    const Icon = ICON_MAP[name] ?? Star;
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-2 text-cyan-600">
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{name}</span>
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AboutAdminPage() {
    const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
    const [loading, setLoading] = useState(true);
    const [localPreviews, setLocalPreviews] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("story");
    const [pendingConfirmation, setPendingConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const [storyImageModes, setStoryImageModes] = useState<StoryImageMode[]>([]);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const lastAddedRef = useRef<HTMLDivElement | null>(null);

    // ── Load ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch("/api/about");
                if (!response.ok) throw new Error("Failed to load about content");
                const result = await response.json();

                if (result?.data) {
                    const d = result.data;

                    const storyImages = toArray<string>(d.storyImages);
                    const teamMembers = toArray<TeamMember>(d.teamMembers).map((m) => ({
                        ...m, level: (m.level ?? "staff") as TeamLevel,
                    }));
                    const values = toArray<ValueItem>(d.values);
                    const stories = toArray<StoryItem>(d.stories);

                    setAboutData({
                        title: d.title || "About Us",
                        slug: d.slug || "about-us",
                        stories,
                        values,
                        teamMembers,
                        storyImages,
                    });

                    // Derive mode from the URL itself — base64 or non-preset = upload
                    setStoryImageModes(
                        storyImages.map((url) => (isStoredUrl(url) ? "stored" : "upload"))
                    );
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load about content.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // ── Scroll to last added ──────────────────────────────────────────────────
    useEffect(() => {
        lastAddedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [
        aboutData.stories.length,
        aboutData.storyImages.length,
        aboutData.values.length,
        aboutData.teamMembers.length,
    ]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const notify = (title: string, description: string, variant?: "default" | "destructive") =>
        toast({ title, description, variant });

    const confirmToast = (msg: string, onConfirm: () => void) =>
        setPendingConfirmation({ message: msg, onConfirm });

    const cancelConfirmation = () => setPendingConfirmation(null);
    const confirmPending = () => {
        if (!pendingConfirmation) return;
        pendingConfirmation.onConfirm();
        setPendingConfirmation(null);
    };

    // ── Story ─────────────────────────────────────────────────────────────────
    const updateStoryItem = (index: number, field: keyof StoryItem, value: string) =>
        setAboutData((cur) => {
            const stories = [...cur.stories];
            stories[index] = { ...stories[index], [field]: value };
            return { ...cur, stories };
        });

    const addStoryBlock = () =>
        confirmToast("Add a new story block?", () => {
            setAboutData((cur) => ({
                ...cur,
                stories: [...cur.stories, { heading: "New Heading", content: "New content." }],
            }));
            notify("Story block added", "A new story block has been created.");
        });

    const removeStoryItem = (index: number) =>
        confirmToast("Remove this story block?", () => {
            setAboutData((cur) => ({ ...cur, stories: cur.stories.filter((_, i) => i !== index) }));
            notify("Story block removed", "The story block has been deleted.");
        });

    // ── Story Images ──────────────────────────────────────────────────────────
    const updateStoryImage = (index: number, url: string) =>
        setAboutData((cur) => {
            const storyImages = [...cur.storyImages];
            storyImages[index] = url;
            return { ...cur, storyImages };
        });

    const setImageMode = (index: number, mode: StoryImageMode) =>
        setStoryImageModes((cur) => { const n = [...cur]; n[index] = mode; return n; });

    // Remove fileToDataUrl entirely — no longer needed

    const uploadStoryImageFile = async (index: number, file: File) => {
        setUploadingIndex(index);
        setUploadError(null);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Upload failed");
            }

            // Store the returned URL (e.g. /storage/uploads/abc123.jpg)
            updateStoryImage(index, result.url);
            notify("Image uploaded", "Image saved — click Save Changes to persist.");
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : "Could not upload image.";
            setUploadError(msg);
            notify("Upload failed", msg, "destructive");
        } finally {
            setUploadingIndex(null);
        }
    };

    const addStoryImage = () =>
        confirmToast("Add a new story image?", () => {
            setAboutData((cur) => ({ ...cur, storyImages: [...cur.storyImages, ""] }));
            setStoryImageModes((cur) => [...cur, "stored"]);
            notify("Story image added", "Select a stored image or upload a new one.");
        });

    const removeStoryImage = (index: number) =>
        confirmToast("Remove this story image?", () => {
            setAboutData((cur) => ({
                ...cur,
                storyImages: cur.storyImages.filter((_, i) => i !== index),
            }));
            setStoryImageModes((cur) => cur.filter((_, i) => i !== index));
            notify("Story image removed", "The image has been removed.");
        });

    // ── Values ────────────────────────────────────────────────────────────────
    const updateValueItem = (index: number, field: keyof ValueItem, value: string) =>
        setAboutData((cur) => {
            const values = [...cur.values];
            const updated = { ...values[index], [field]: value };
            if (field === "title") updated.icon = iconFromTitle(value);
            values[index] = updated;
            return { ...cur, values };
        });

    const addValueCard = () =>
        confirmToast("Add a new core value?", () => {
            setAboutData((cur) => ({
                ...cur,
                values: [...cur.values, { icon: "Star", title: "New Value", body: "Describe this value." }],
            }));
            notify("Value added", "A new core value has been added.");
        });

    const removeValueItem = (index: number) =>
        confirmToast("Remove this core value?", () => {
            setAboutData((cur) => ({ ...cur, values: cur.values.filter((_, i) => i !== index) }));
            notify("Value removed", "The core value has been deleted.");
        });

    // ── Team ─────────────────────────────────────────────────────────────────
    // FIX: separate handlers for string fields vs level enum
    const updateTeamField = (index: number, field: "name" | "role" | "bio", value: string) =>
        setAboutData((cur) => {
            const teamMembers = [...cur.teamMembers];
            teamMembers[index] = { ...teamMembers[index], [field]: value };
            return { ...cur, teamMembers };
        });

    const updateTeamLevel = (index: number, value: TeamLevel) =>
        setAboutData((cur) => {
            const teamMembers = [...cur.teamMembers];
            teamMembers[index] = { ...teamMembers[index], level: value };
            return { ...cur, teamMembers };
        });

    const addTeamMember = () =>
        confirmToast("Add a new team member?", () => {
            setAboutData((cur) => ({
                ...cur,
                teamMembers: [
                    ...cur.teamMembers,
                    { name: "New Team Member", role: "Role / title", bio: "Short biography.", level: "staff" },
                ],
            }));
            notify("Team member added", "A new team member has been added.");
        });

    const removeTeamMember = (index: number) =>
        confirmToast("Remove this team member?", () => {
            setAboutData((cur) => ({
                ...cur,
                teamMembers: cur.teamMembers.filter((_, i) => i !== index),
            }));
            notify("Team member removed", "The team member has been deleted.");
        });

    // ── Save ──────────────────────────────────────────────────────────────────
    const saveChanges = async () =>
        confirmToast("Save all changes to the About page?", async () => {
            setSaving(true);
            setMessage(null);
            setError(null);
            try {
                const response = await fetch("/api/about", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: aboutData.title,
                        slug: aboutData.slug,
                        stories: aboutData.stories,
                        values: aboutData.values,
                        teamMembers: aboutData.teamMembers,
                        storyImages: aboutData.storyImages,
                    }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
                setMessage("Saved successfully.");
                notify("Saved successfully", "Your About page content was saved.");
            } catch (err) {
                console.error(err);
                setError("Unable to save content. Please try again.");
                notify("Save failed", "Unable to save content. Please try again.", "destructive");
            } finally {
                setSaving(false);
            }
        });

    // ── Styles ────────────────────────────────────────────────────────────────
    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none";
    const textareaClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none min-h-[100px]";
    const labelClass = "mb-1 block text-sm font-medium text-slate-700";
    const cardClass = "relative rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-4 space-y-4";

    const teamByLevel = LEVEL_ORDER.reduce<Record<TeamLevel, { member: TeamMember; globalIndex: number }[]>>(
        (acc, lvl) => {
            acc[lvl] = aboutData.teamMembers
                .map((m, i) => ({ member: m, globalIndex: i }))
                .filter(({ member }) => (member.level ?? "staff") === lvl);
            return acc;
        },
        {} as Record<TeamLevel, { member: TeamMember; globalIndex: number }[]>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="rounded-3xl bg-white/95">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">About Page Editor</h1>
                        <p className="text-sm text-slate-500">Manage story, images, values, and team members.</p>
                    </div>
                    <Button onClick={saveChanges} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
                {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Confirmation Modal */}
            {pendingConfirmation && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={cancelConfirmation}>
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
                    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 px-8 py-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">Confirm Action</h3>
                                    <p className="mt-1 text-sm text-white/80">Please review before proceeding</p>
                                </div>
                                <button onClick={cancelConfirmation} className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30">×</button>
                            </div>
                        </div>
                        <div className="px-8 py-7">
                            <p className="text-slate-600 text-base">{pendingConfirmation.message}</p>
                            <div className="mt-8 flex justify-end gap-3">
                                <Button variant="outline" onClick={cancelConfirmation}>Cancel</Button>
                                <Button onClick={confirmPending}>Confirm</Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Tabs */}
            <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? "border-b-2 border-cyan-500 text-cyan-600 bg-cyan-50/60"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">

                    {/* ── Story Blocks ────────────────────────────────────── */}
                    {activeTab === "story" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.stories.length} block{aboutData.stories.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addStoryBlock}>Add Block</Button>
                            </div>
                            {loading ? (
                                <p className="text-slate-500 text-sm">Loading…</p>
                            ) : aboutData.stories.length === 0 ? (
                                <EmptyState label="No story blocks yet." />
                            ) : (
                                aboutData.stories.map((item, index) => (
                                    <div key={index} ref={index === aboutData.stories.length - 1 ? lastAddedRef : null} className={cardClass}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Block {index + 1}</span>
                                            <RemoveButton onClick={() => removeStoryItem(index)} />
                                        </div>
                                        <label className="block">
                                            <span className={labelClass}>Heading</span>
                                            <input className={inputClass} value={item.heading}
                                                onChange={(e) => updateStoryItem(index, "heading", e.target.value)}
                                                onBlur={() => notify("Story updated", "Heading updated.")}
                                            />
                                        </label>
                                        <label className="block">
                                            <span className={labelClass}>Content</span>
                                            <textarea className={textareaClass} value={item.content}
                                                onChange={(e) => updateStoryItem(index, "content", e.target.value)}
                                                onBlur={() => notify("Story updated", "Content updated.")}
                                            />
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Story Images ─────────────────────────────────────── */}
                    {activeTab === "images" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.storyImages.length} image{aboutData.storyImages.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addStoryImage}>Add Image</Button>
                            </div>
                            {aboutData.storyImages.length === 0 ? (
                                <EmptyState label="No story images added yet." />
                            ) : (
                                aboutData.storyImages.map((src, index) => {
                                    const mode = storyImageModes[index] ?? "stored";
                                    const previewSrc = (uploadingIndex === index ? localPreviews[index] : null) ?? src ?? localPreviews[index];
                                    return (
                                        <div
                                            key={index}
                                            ref={index === aboutData.storyImages.length - 1 ? lastAddedRef : null}
                                            className={cardClass}
                                        >
                                            {/* Card header */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                                    Image {index + 1}
                                                </span>
                                                <RemoveButton onClick={() => removeStoryImage(index)} />
                                            </div>

                                            {/* Two-column: controls left, preview right */}
                                            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">

                                                {/* Left: source + picker stacked */}
                                                <div className="space-y-4">
                                                    <label className="block">
                                                        <span className={labelClass}>Source</span>
                                                        <select
                                                            className={inputClass}
                                                            value={mode}
                                                            onChange={(e) => {
                                                                const next = e.target.value as StoryImageMode;
                                                                setImageMode(index, next);
                                                                if (next === "stored") {
                                                                    updateStoryImage(index, "");
                                                                    setLocalPreviews((prev) => { const n = { ...prev }; delete n[index]; return n; });
                                                                }
                                                            }}
                                                        >
                                                            <option value="stored">Stored image</option>
                                                            <option value="upload">Upload new image</option>
                                                        </select>
                                                    </label>

                                                    <label className="block">
                                                        <span className={labelClass}>Image</span>
                                                        {mode === "upload" ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className={inputClass}
                                                                    disabled={uploadingIndex === index}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const objectUrl = URL.createObjectURL(file);
                                                                        setLocalPreviews((prev) => ({ ...prev, [index]: objectUrl }));
                                                                        uploadStoryImageFile(index, file);
                                                                    }}
                                                                />
                                                                {src && uploadingIndex !== index && (
                                                                    <p className="text-xs text-green-600 truncate">✓ {src}</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <select
                                                                className={inputClass}
                                                                value={src}
                                                                onChange={(e) => {
                                                                    updateStoryImage(index, e.target.value);
                                                                    notify("Image changed", "Story image updated.");
                                                                }}
                                                            >
                                                                {STORY_IMAGE_OPTIONS.map((o) => (
                                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </label>

                                                    {uploadError && index === uploadingIndex && (
                                                        <p className="text-sm text-red-600">{uploadError}</p>
                                                    )}
                                                </div>

                                                {/* Right: preview */}
                                                {previewSrc ? (
                                                    <div className="flex items-start relative">
                                                        <img
                                                            src={previewSrc}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-36 w-48 object-cover rounded-xl border border-slate-200 shrink-0"
                                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                                        />
                                                        {uploadingIndex === index && (
                                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm">
                                                                <p className="text-xs font-medium text-blue-500 animate-pulse">Uploading…</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start">
                                                        <div className="h-36 w-48 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0">
                                                            <span className="text-xs text-slate-400">No preview</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── Core Values ──────────────────────────────────────── */}
                    {activeTab === "values" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.values.length} value{aboutData.values.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addValueCard}>Add Value</Button>
                            </div>
                            {aboutData.values.length === 0 ? (
                                <EmptyState label="No values added yet." />
                            ) : (
                                aboutData.values.map((item, index) => (
                                    <div key={index} ref={index === aboutData.values.length - 1 ? lastAddedRef : null} className={cardClass}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Value {index + 1}</span>
                                            <RemoveButton onClick={() => removeValueItem(index)} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className={labelClass}>Icon</p>
                                                <IconPreview name={item.icon || iconFromTitle(item.title)} />
                                            </div>
                                            <label className="block flex-1">
                                                <span className={labelClass}>Title</span>
                                                <input className={inputClass} value={item.title}
                                                    onChange={(e) => updateValueItem(index, "title", e.target.value)}
                                                    onBlur={() => notify("Value updated", "Title and icon updated.")}
                                                />
                                            </label>
                                        </div>
                                        <label className="block">
                                            <span className={labelClass}>Description</span>
                                            <textarea className={textareaClass} value={item.body}
                                                onChange={(e) => updateValueItem(index, "body", e.target.value)}
                                                onBlur={() => notify("Value updated", "Description updated.")}
                                            />
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Team Members ─────────────────────────────────────── */}
                    {activeTab === "team" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.teamMembers.length} member{aboutData.teamMembers.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addTeamMember}>Add Member</Button>
                            </div>
                            {aboutData.teamMembers.length === 0 ? (
                                <EmptyState label="No team members added yet." />
                            ) : (
                                LEVEL_ORDER.map((lvl) => {
                                    const group = teamByLevel[lvl];
                                    if (group.length === 0) return null;
                                    const meta = TEAM_LEVELS.find((t) => t.value === lvl)!;
                                    return (
                                        <div key={lvl} className="mb-8">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${meta.badge} ${meta.color}`}>
                                                    {meta.label}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {group.length} member{group.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>

                                            {group.map(({ member, globalIndex }) => (
                                                <div key={globalIndex}
                                                    ref={globalIndex === aboutData.teamMembers.length - 1 ? lastAddedRef : null}
                                                    className={`relative rounded-2xl border p-5 mb-3 space-y-4 ${meta.color}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                                            {member.name || "Unnamed"}
                                                        </span>
                                                        <RemoveButton onClick={() => removeTeamMember(globalIndex)} />
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <label className="block">
                                                            <span className={labelClass}>Name</span>
                                                            {/* FIX: use updateTeamField, not the old generic handler */}
                                                            <input className={inputClass} value={member.name}
                                                                onChange={(e) => updateTeamField(globalIndex, "name", e.target.value)}
                                                                onBlur={() => notify("Team updated", "Name updated.")}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className={labelClass}>Role</span>
                                                            <input className={inputClass} value={member.role}
                                                                onChange={(e) => updateTeamField(globalIndex, "role", e.target.value)}
                                                                onBlur={() => notify("Team updated", "Role updated.")}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className={labelClass}>Level</span>
                                                            {/* FIX: use updateTeamLevel with proper TeamLevel cast */}
                                                            <select className={inputClass} value={member.level ?? "staff"}
                                                                onChange={(e) => {
                                                                    updateTeamLevel(globalIndex, e.target.value as TeamLevel);
                                                                    notify("Team updated", "Level updated.");
                                                                }}
                                                            >
                                                                {TEAM_LEVELS.map((t) => (
                                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                        </label>
                                                    </div>

                                                    <label className="block">
                                                        <span className={labelClass}>Bio</span>
                                                        <textarea className={textareaClass} value={member.bio}
                                                            onChange={(e) => updateTeamField(globalIndex, "bio", e.target.value)}
                                                            onBlur={() => notify("Team updated", "Bio updated.")}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function RemoveButton({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" onClick={onClick}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
            Remove
        </button>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            {label}
        </div>
    );
}