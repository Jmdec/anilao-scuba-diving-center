"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createPortal } from "react-dom";
import {
    Shield, Star, Heart, Leaf, Zap, Globe, Users, Award,
    Anchor, Fish, Waves, Sun, Wind, Eye, Compass, Map,
    BookOpen, Clock, ThumbsUp, CheckCircle, Lightbulb, Smile,
    Camera, Wrench, Lock, Unlock, Key, Target, Flame, Droplets,
    Mountain, Binoculars, Search, MessageCircle, Handshake,
    Sparkles, Crown, Diamond, Trophy, Medal, Gem,
} from "lucide-react";

// Types 

interface StoryItem {
    heading: string;
    content: string;
}

interface ValueItem {
    icon: string; // kept in data for persistence; auto-derived on title change
    title: string;
    body: string;
    accent?: string;
}

export type TeamLevel = "owner" | "manager" | "staff" | "guide" | "support";

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    level: TeamLevel;
}

interface AboutData {
    story: StoryItem[];
    values: ValueItem[];
    team: TeamMember[];
    storyImages: string[];
}

// Constants 

const TEAM_LEVELS: { value: TeamLevel; label: string; color: string; badge: string }[] = [
    { value: "owner", label: "Owner / Founder", color: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
    { value: "manager", label: "Management", color: "bg-sky-50 border-sky-200", badge: "bg-sky-100 text-sky-700" },
    { value: "guide", label: "Dive Guides", color: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700" },
    { value: "staff", label: "Staff", color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-slate-600" },
    { value: "support", label: "Support", color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
];

const LEVEL_ORDER: TeamLevel[] = ["owner", "manager", "guide", "staff", "support"];

/** Map of lucide icon names → components, used for rendering */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield, Star, Heart, Leaf, Zap, Globe, Users, Award,
    Anchor, Fish, Waves, Sun, Wind, Eye, Compass, Map,
    BookOpen, Clock, ThumbsUp, CheckCircle, Lightbulb, Smile,
    Camera, Wrench, Lock, Unlock, Key, Target, Flame, Droplets,
    Mountain, Binoculars, Search, MessageCircle, Handshake,
    Sparkles, Crown, Diamond, Trophy, Medal, Gem,
};

/** Keyword → icon name mapping for auto-suggestion */
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
    return "Star"; // sensible default
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

// Defaults 

const defaultAboutData: AboutData = {
    story: [
        {
            heading: "From Local Roots to Global Recognition",
            content:
                "Founded in 2010, Anilao Scuba Dive Center has grown from a small family-run operation into one of the Philippines' premier diving destinations.",
        },
    ],
    values: [
        {
            icon: "Shield",
            title: "Safety First",
            body: "Your safety is our top priority. We maintain the highest standards in equipment, training, and dive protocols.",
        },
    ],
    team: [
        {
            name: "Lina Santos",
            role: "Lead PADI Instructor",
            bio: "Lina has trained hundreds of divers and keeps safety at the center of every dive experience.",
            level: "guide",
        },
    ],
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

const STORY_IMAGE_SOURCE_OPTIONS = [
    { label: "Stored image", value: "stored" },
    { label: "Upload new image", value: "upload" },
];

const TABS: { id: Tab; label: string }[] = [
    { id: "story", label: "Story Blocks" },
    { id: "images", label: "Story Images" },
    { id: "values", label: "Core Values" },
    { id: "team", label: "Team Members" },
];

// IconPreview 

function IconPreview({ name }: { name: string }) {
    const Icon = ICON_MAP[name] ?? Star;
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-2 text-cyan-600">
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{name}</span>
        </span>
    );
}

// Main Component

export default function AboutAdminPage() {
    const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("story");
    const [pendingConfirmation, setPendingConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const [storyImageModes, setStoryImageModes] = useState<StoryImageMode[]>([]);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const lastAddedRef = useRef<HTMLDivElement | null>(null);

    const [storyCount, setStoryCount] = useState(0);
    const [imageCount, setImageCount] = useState(0);
    const [valueCount, setValueCount] = useState(0);
    const [teamCount, setTeamCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch("/api/about");
                if (!response.ok) throw new Error("Failed to load about content");
                const result = await response.json();
                if (result?.data) {
                    const storyImages: string[] = result.data.storyImages || [];
                    const team: TeamMember[] = (result.data.team || []).map((m: TeamMember) => ({
                        ...m,
                        level: m.level ?? "staff",
                    }));
                    setAboutData({
                        story: result.data.story || [],
                        values: result.data.values || [],
                        team,
                        storyImages,
                    });
                    setStoryImageModes(
                        storyImages.map((url: string) =>
                            STORY_IMAGE_OPTIONS.some((o) => o.value === url) ? "stored" : "upload"
                        )
                    );
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load about content. Using fallback values.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helpers 

    const notify = (title: string, description: string, variant?: "default" | "destructive") =>
        toast({ title, description, variant });

    const confirmToast = (message: string, onConfirm: () => void) =>
        setPendingConfirmation({ message, onConfirm });

    const cancelConfirmation = () => setPendingConfirmation(null);

    const confirmPending = () => {
        if (!pendingConfirmation) return;
        pendingConfirmation.onConfirm();
        setPendingConfirmation(null);
    };

    // Story 

    const updateStoryItem = (index: number, field: keyof StoryItem, value: string) =>
        setAboutData((cur) => {
            const story = [...cur.story];
            story[index] = { ...story[index], [field]: value };
            return { ...cur, story };
        });

    const addStoryBlock = () =>
        confirmToast("Add a new story block?", () => {
            setAboutData((cur) => ({
                ...cur,
                story: [
                    ...cur.story,
                    {
                        heading: "New Heading",
                        content: "New content.",
                    },
                ],
            }));

            notify("Story block added", "A new story block has been created.");
        });

    const removeStoryItem = (index: number) =>
        confirmToast("Remove this story block?", () => {
            setAboutData((cur) => ({ ...cur, story: cur.story.filter((_, i) => i !== index) }));
            notify("Story block removed", "The story block has been deleted.");
        });

    // Story Images 

    const updateStoryImage = (index: number, url: string) =>
        setAboutData((cur) => {
            const storyImages = [...(cur.storyImages ?? [])];
            storyImages[index] = url;
            return { ...cur, storyImages };
        });

    const setStoryImageMode = (index: number, mode: StoryImageMode) =>
        setStoryImageModes((cur) => { const n = [...cur]; n[index] = mode; return n; });

    const uploadStoryImageFile = async (index: number, file: File) => {
        setUploadingIndex(index);
        setUploadError(null);
        try {
            const dataUrl = await fileToDataUrl(file);
            updateStoryImage(index, dataUrl);
            setStoryImageMode(index, "upload");
            notify("Image ready", "The image has been loaded and is ready to save.");
        } catch (err) {
            console.error(err);
            const msg = "Could not read the image file. Please try again.";
            setUploadError(msg);
            notify("Upload failed", msg, "destructive");
        } finally {
            setUploadingIndex(null);
        }
    };

    const addStoryImage = () =>
        confirmToast("Add a new story image?", () => {
            setAboutData((cur) => ({
                ...cur,
                storyImages: [...(cur.storyImages ?? []), ""],
            }));

            setStoryImageModes((cur) => [...cur, "stored"]);

            notify(
                "Story image added",
                "Select a stored image or upload a new one."
            );
        });

    const removeStoryImage = (index: number) =>
        confirmToast("Remove this story image?", () => {
            setAboutData((cur) => ({
                ...cur,
                storyImages: (cur.storyImages ?? []).filter((_, i) => i !== index),
            }));
            setStoryImageModes((cur) => cur.filter((_, i) => i !== index));
            notify("Story image removed", "The image has been removed from the story carousel.");
        });

    // Values 

    const updateValueItem = (index: number, field: keyof ValueItem, value: string) =>
        setAboutData((cur) => {
            const values = [...cur.values];
            const updated = { ...values[index], [field]: value };
            // When title changes, auto-update the icon
            if (field === "title") updated.icon = iconFromTitle(value);
            values[index] = updated;
            return { ...cur, values };
        });

    const addValueCard = () =>
        confirmToast("Add a new core value?", () => {
            setAboutData((cur) => ({
                ...cur,
                values: [
                    ...cur.values,
                    {
                        icon: "Star",
                        title: "New Value",
                        body: "Describe this value.",
                    },
                ],
            }));

            notify("Value added", "A new core value has been added.");
        });

    const removeValueItem = (index: number) =>
        confirmToast("Remove this core value?", () => {
            setAboutData((cur) => ({ ...cur, values: cur.values.filter((_, i) => i !== index) }));
            notify("Value removed", "The core value has been deleted.");
        });

    // Team 

    const updateTeamMember = (index: number, field: keyof TeamMember, value: string) =>
        setAboutData((cur) => {
            const team = [...cur.team];
            team[index] = { ...team[index], [field]: value as TeamLevel };
            return { ...cur, team };
        });

    const addTeamMember = () =>
        confirmToast("Add a new team member?", () => {
            setAboutData((cur) => ({
                ...cur,
                team: [
                    ...cur.team,
                    {
                        name: "New Team Member",
                        role: "Role / title",
                        bio: "Short biography.",
                        level: "staff",
                    },
                ],
            }));

            notify("Team member added", "A new team member has been added.");
        });

    const removeTeamMember = (index: number) =>
        confirmToast("Remove this team member?", () => {
            setAboutData((cur) => ({ ...cur, team: cur.team.filter((_, i) => i !== index) }));
            notify("Team member removed", "The team member has been deleted.");
        });

    useEffect(() => {
        lastAddedRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [
        aboutData.story.length,
        aboutData.storyImages.length,
        aboutData.values.length,
        aboutData.team.length,
    ]);

    // Save 

    const saveChanges = async () =>
        confirmToast("Save all changes to the About page?", async () => {
            setSaving(true);
            setMessage(null);
            setError(null);
            try {
                const response = await fetch("/api/about", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(aboutData),
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

    // Styles

    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none";
    const textareaClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none min-h-[100px]";
    const labelClass = "mb-1 block text-sm font-medium text-slate-700";
    const cardClass = "relative rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-4 space-y-4";

    // Grouped team by hierarchy
    const teamByLevel = LEVEL_ORDER.reduce<Record<TeamLevel, { member: TeamMember; globalIndex: number }[]>>(
        (acc, lvl) => {
            acc[lvl] = aboutData.team
                .map((m, i) => ({ member: m, globalIndex: i }))
                .filter(({ member }) => (member.level ?? "staff") === lvl);
            return acc;
        },
        {} as Record<TeamLevel, { member: TeamMember; globalIndex: number }[]>
    );

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
            </div>

            {/* Confirmation Modal */}
            {pendingConfirmation &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                        onClick={cancelConfirmation}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

                        {/* Modal */}
                        <div
                            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.4)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 px-8 py-8 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">Confirm Action</h3>
                                        <p className="mt-1 text-sm text-white/80">
                                            Please review before proceeding
                                        </p>
                                    </div>

                                    <button
                                        onClick={cancelConfirmation}
                                        className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-8 py-7">
                                <p className="text-slate-600 text-base">
                                    {pendingConfirmation.message}
                                </p>

                                <div className="mt-8 flex justify-end gap-3">
                                    <Button variant="outline" onClick={cancelConfirmation}>
                                        Cancel
                                    </Button>
                                    <Button onClick={confirmPending}>
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* Tabs */}
            <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
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

                    {/*  Story Blocks  */}
                    {activeTab === "story" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.story.length} block{aboutData.story.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addStoryBlock}>Add Block</Button>
                            </div>
                            {loading ? (
                                <p className="text-slate-500 text-sm">Loading…</p>
                            ) : aboutData.story.length === 0 ? (
                                <EmptyState label="No story blocks yet." />
                            ) : (
                                aboutData.story.map((item, index) => (
                                    <div
                                        key={index}
                                        ref={index === aboutData.story.length - 1 ? lastAddedRef : null}
                                        className={cardClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Block {index + 1}</span>
                                            <RemoveButton onClick={() => removeStoryItem(index)} />
                                        </div>
                                        <label className="block">
                                            <span className={labelClass}>Heading</span>
                                            <input
                                                className={inputClass}
                                                value={item.heading}
                                                onChange={(e) => updateStoryItem(index, "heading", e.target.value)}
                                                onBlur={() => notify("Story updated", "Story heading has been updated.")}
                                            />
                                            <button
                                                onClick={() => removeStoryItem(index)}
                                                className="h-9 w-9 rounded-fulls bg-white/20 text-white hover:bg-white/30"
                                            >
                                                ×
                                            </button>
                                        </label>
                                        <label className="block">
                                            <span className={labelClass}>Content</span>
                                            <textarea
                                                className={textareaClass}
                                                value={item.content}
                                                onChange={(e) => updateStoryItem(index, "content", e.target.value)}
                                                onBlur={() => notify("Story updated", "Story content has been updated.")}
                                            />
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/*  Story Images  */}
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
                                aboutData.storyImages.map((src, index) => (
                                    <div
                                        key={index}
                                        ref={index === aboutData.storyImages.length - 1 ? lastAddedRef : null}
                                        className={cardClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Image {index + 1}</span>
                                            <RemoveButton onClick={() => removeStoryImage(index)} />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="block">
                                                <span className={labelClass}>Source</span>
                                                <select
                                                    className={inputClass}
                                                    value={storyImageModes[index] ?? "stored"}
                                                    onChange={(e) => {
                                                        const mode = e.target.value as StoryImageMode;
                                                        setStoryImageMode(index, mode);
                                                        if (mode === "stored") updateStoryImage(index, "");
                                                    }}
                                                >
                                                    {STORY_IMAGE_SOURCE_OPTIONS.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className={labelClass}>Image</span>
                                                {storyImageModes[index] === "upload" ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className={inputClass}
                                                            disabled={uploadingIndex === index}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) uploadStoryImageFile(index, file);
                                                            }}
                                                        />
                                                        {uploadingIndex === index && (
                                                            <p className="text-xs text-slate-500">Reading image…</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <select
                                                        className={inputClass}
                                                        value={src}
                                                        onChange={(e) => {
                                                            updateStoryImage(index, e.target.value);
                                                            notify("Story image changed", "The story image selection was updated.");
                                                        }}
                                                    >
                                                        {STORY_IMAGE_OPTIONS.map((o) => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </label>
                                        </div>
                                        {uploadError && uploadingIndex === index && (
                                            <p className="text-sm text-red-600">{uploadError}</p>
                                        )}
                                        {src && (
                                            <img
                                                src={src}
                                                alt={`Preview ${index + 1}`}
                                                className="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200"
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/*  Core Values  */}
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
                                    <div
                                        key={index}
                                        ref={index === aboutData.values.length - 1 ? lastAddedRef : null}
                                        className={cardClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Value {index + 1}</span>
                                            <RemoveButton onClick={() => removeValueItem(index)} />
                                        </div>

                                        {/* Icon preview — auto-generated, read-only */}
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="mb-1 block text-sm font-medium text-slate-700">Icon</p>
                                                <IconPreview name={item.icon || iconFromTitle(item.title)} />
                                            </div>

                                            <label className="block">
                                                <span className={labelClass}>Title</span>
                                                <input
                                                    className={inputClass}
                                                    value={item.title}
                                                    onChange={(e) => updateValueItem(index, "title", e.target.value)}
                                                    onBlur={() => notify("Value updated", "Value title and icon have been updated.")}
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className={labelClass}>Description</span>
                                            <textarea
                                                className={textareaClass}
                                                value={item.body}
                                                onChange={(e) => updateValueItem(index, "body", e.target.value)}
                                                onBlur={() => notify("Value updated", "Value description has been updated.")}
                                            />
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Team Members (Hierarchy) ─────────────────────────── */}
                    {activeTab === "team" && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-slate-500">
                                    {aboutData.team.length} member{aboutData.team.length !== 1 ? "s" : ""}
                                </p>
                                <Button variant="secondary" onClick={addTeamMember}>Add Member</Button>
                            </div>
                            {aboutData.team.length === 0 ? (
                                <EmptyState label="No team members added yet." />
                            ) : (
                                LEVEL_ORDER.map((lvl) => {
                                    const group = teamByLevel[lvl];
                                    if (group.length === 0) return null;
                                    const meta = TEAM_LEVELS.find((t) => t.value === lvl)!;
                                    return (
                                        <div key={lvl} className="mb-8">
                                            {/* Level heading */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${meta.badge} ${meta.color}`}>
                                                    {meta.label}
                                                </span>
                                                <span className="text-xs text-slate-400">{group.length} member{group.length !== 1 ? "s" : ""}</span>
                                            </div>

                                            {group.map(({ member, globalIndex }) => (
                                                <div
                                                    key={globalIndex}
                                                    ref={
                                                        globalIndex === aboutData.team.length - 1
                                                            ? lastAddedRef
                                                            : null
                                                    }
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
                                                            <input
                                                                className={inputClass}
                                                                value={member.name}
                                                                onChange={(e) => updateTeamMember(globalIndex, "name", e.target.value)}
                                                                onBlur={() => notify("Team updated", "Team member name has been updated.")}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className={labelClass}>Role</span>
                                                            <input
                                                                className={inputClass}
                                                                value={member.role}
                                                                onChange={(e) => updateTeamMember(globalIndex, "role", e.target.value)}
                                                                onBlur={() => notify("Team updated", "Team member role has been updated.")}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className={labelClass}>Level</span>
                                                            <select
                                                                className={inputClass}
                                                                value={member.level ?? "staff"}
                                                                onChange={(e) => {
                                                                    updateTeamMember(globalIndex, "level", e.target.value);
                                                                    notify("Team updated", "Member level changed.");
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
                                                        <textarea
                                                            className={textareaClass}
                                                            value={member.bio}
                                                            onChange={(e) => updateTeamMember(globalIndex, "bio", e.target.value)}
                                                            onBlur={() => notify("Team updated", "Team member bio has been updated.")}
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

// Small helpers

function RemoveButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
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