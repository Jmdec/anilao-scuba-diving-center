"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Award, Users, Star, Shield, Heart, Anchor,
    GraduationCap, Hotel, Crown, Briefcase, Compass,
    Headphones, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { BubbleAnimation } from "@/components/ui/bubble-animation";
import {
    Shield as ShieldIcon, Star as StarIcon, Heart as HeartIcon,
    Leaf, Zap, Globe, Fish, Waves, Sun, Wind, Eye,
    Map, BookOpen, Clock, ThumbsUp, CheckCircle, Lightbulb,
    Smile, Camera, Wrench, Lock, Unlock, Key, Target, Flame,
    Droplets, Mountain, Binoculars, Search, MessageCircle,
    Handshake, Sparkles, Diamond, Trophy, Medal, Gem,
} from "lucide-react";

interface StoryItem { heading: string; content: string; }
interface ValueItem { icon: string; title: string; body: string; accent: string; }
export type TeamLevel = "owner" | "manager" | "guide" | "staff" | "support";
interface TeamMember { name: string; role: string; bio: string; level?: TeamLevel; }

interface AboutData {
    story: StoryItem[];
    values: ValueItem[];
    team: TeamMember[];
    storyImages: string[];
}

const ICON_MAP: Record<string, React.ElementType> = {
    Shield: ShieldIcon, Star: StarIcon, Heart: HeartIcon, Leaf, Zap, Globe,
    Users, Award, Anchor, Fish, Waves, Sun, Wind, Eye, Compass, Map, BookOpen,
    Clock, ThumbsUp, CheckCircle, Lightbulb, Smile, Camera, Wrench, Lock,
    Unlock, Key, Target, Flame, Droplets, Mountain, Binoculars, Search,
    MessageCircle, Handshake, Sparkles, Crown, Diamond, Trophy, Medal, Gem,
    GraduationCap,
};

//  Team hierarchy config 
const LEVEL_CONFIG: Record<TeamLevel, {
    label: string; icon: React.ElementType; gradient: string;
    badge: string; border: string; ring: string; avatarGrad: string;
}> = {
    owner: {
        label: "Owner / Founder", icon: Crown,
        gradient: "from-amber-50 to-orange-50",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        border: "border-amber-200", ring: "ring-amber-400",
        avatarGrad: "from-amber-500 to-orange-500",
    },
    manager: {
        label: "Management", icon: Briefcase,
        gradient: "from-sky-50 to-blue-50",
        badge: "bg-sky-100 text-sky-800 border-sky-300",
        border: "border-sky-200", ring: "ring-sky-400",
        avatarGrad: "from-sky-500 to-blue-500",
    },
    guide: {
        label: "Dive Guides", icon: Compass,
        gradient: "from-teal-50 to-cyan-50",
        badge: "bg-teal-100 text-teal-800 border-teal-300",
        border: "border-teal-200", ring: "ring-teal-400",
        avatarGrad: "from-teal-500 to-cyan-500",
    },
    staff: {
        label: "Staff", icon: Users,
        gradient: "from-slate-50 to-gray-50",
        badge: "bg-slate-100 text-slate-700 border-slate-300",
        border: "border-slate-200", ring: "ring-slate-400",
        avatarGrad: "from-slate-500 to-gray-500",
    },
    support: {
        label: "Support", icon: Headphones,
        gradient: "from-violet-50 to-purple-50",
        badge: "bg-violet-100 text-violet-800 border-violet-300",
        border: "border-violet-200", ring: "ring-violet-400",
        avatarGrad: "from-violet-500 to-purple-500",
    },
};

const LEVEL_ORDER: TeamLevel[] = ["owner", "manager", "guide", "staff", "support"];

function toArray<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val as T[];
    if (val && typeof val === "object") return Object.values(val) as T[];
    return [];
}

//  TeamCard 

function TeamCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
    const cfg = LEVEL_CONFIG[member.level ?? "staff"];
    return (
        <button
            onClick={onClick}
            className={`group text-left w-full rounded-2xl border bg-gradient-to-br ${cfg.gradient} ${cfg.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
        >
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br ${cfg.avatarGrad} text-white font-bold text-lg flex items-center justify-center shadow-md`}>
                    {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{member.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors rotate-[-90deg]" />
            </div>
        </button>
    );
}

//  TeamModal 

function TeamModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
    const cfg = LEVEL_CONFIG[member.level ?? "staff"];
    const LevelIcon = cfg.icon;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`bg-gradient-to-br ${cfg.avatarGrad} px-8 pt-10 pb-16 relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-lg transition-colors"
                        aria-label="Close"
                    >×</button>
                    <div className="flex items-end gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/25 text-white font-bold text-2xl flex items-center justify-center shadow-lg border border-white/30">
                            {member.name.charAt(0)}
                        </div>
                        <div className="pb-1">
                            <h3 className="text-2xl font-bold text-white leading-tight">{member.name}</h3>
                            <p className="text-white/80 text-sm font-medium">{member.role}</p>
                        </div>
                    </div>
                </div>
                <div className="-mt-8 rounded-t-3xl bg-white relative z-10 px-8 pt-7 pb-8">
                    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 mb-5 ${cfg.badge} text-xs font-semibold`}>
                        <LevelIcon className="h-3.5 w-3.5" />
                        {cfg.label}
                    </div>
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-2">About</p>
                    <p className="text-slate-600 leading-7 text-sm">{member.bio}</p>
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    const [aboutData, setAboutData] = useState<AboutData>({
        story: [], values: [], team: [], storyImages: [],
    });
    const [loading, setLoading] = useState(true);
    const [activeStoryImage, setActiveStoryImage] = useState(0);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    //  Load 
    useEffect(() => {
        async function loadAbout() {
            try {
                const res = await fetch("/api/about");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const result = await res.json();

                if (result?.data) {
                    const d = result.data;
                    setAboutData({
                        story: toArray<StoryItem>(d.stories),
                        values: toArray<ValueItem>(d.values),
                        team: toArray<TeamMember>(d.teamMembers).map((m) => ({
                            ...m, level: m.level ?? "staff",
                        })),
                        storyImages: toArray<string>(d.storyImages),
                    });
                }
            } catch (err) {
                console.error("Failed to load about data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadAbout();
    }, []);

    // Image carousel auto-advance 
    useEffect(() => {
        const count = aboutData.storyImages.length;
        if (!count) return;
        const t = setInterval(
            () => setActiveStoryImage((p) => (p >= count - 1 ? 0 : p + 1)),
            5000
        );
        return () => clearInterval(t);
    }, [aboutData.storyImages]);

    //  Group team by level 
    const teamByLevel = LEVEL_ORDER.reduce<Record<TeamLevel, TeamMember[]>>(
        (acc, lvl) => {
            acc[lvl] = aboutData.team.filter((m) => (m.level ?? "staff") === lvl);
            return acc;
        },
        {} as Record<TeamLevel, TeamMember[]>
    );

    //  Render 
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-slate-50 via-blue-50 to-teal-50">
            <Navigation />

            {/*  Hero  */}
            <section className="relative min-h-[200px] flex items-center justify-center py-20">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-blue-600/10 to-teal-600/20" />
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        About{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
                            Anilao Scuba Dive Center
                        </span>
                    </h1>
                    <p className="text-md sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed font-light bg-white/80 p-6 rounded-2xl backdrop-blur-sm border border-teal-200 shadow-sm">
                        Your gateway to world-class diving experiences in the Philippines' diving capital since 2010
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Badge className="bg-teal-100 border-teal-300 text-teal-700 px-4 py-2 text-base">
                            <Award className="h-4 w-4 mr-2" /> PADI 5-Star Resort
                        </Badge>
                        <Badge className="bg-cyan-100 border-cyan-300 text-cyan-700 px-4 py-2 text-base">
                            <Users className="h-4 w-4 mr-2" /> 2000+ Happy Divers
                        </Badge>
                        <Badge className="bg-blue-100 border-blue-300 text-blue-700 px-4 py-2 text-base">
                            <Star className="h-4 w-4 mr-2 fill-current" /> 4.9/5 Rating
                        </Badge>
                    </div>
                </div>
                <BubbleAnimation />
            </section>

            {/*  Story  */}
            <section className="relative py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-4">Our Journey</p>
                    <h2 className="text-center text-4xl sm:text-5xl font-bold text-slate-900 mb-14 leading-tight">
                        A Legacy Built Beneath the Waves
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Carousel */}
                        <div className="lg:sticky lg:top-24 self-start">
                            <div
                                className="relative overflow-hidden rounded-[2rem] border border-teal-200/40 shadow-2xl bg-slate-100"
                                style={{ height: "580px" }}
                            >
                                {loading ? (
                                    <div className="absolute inset-0 animate-pulse bg-slate-200" />
                                ) : aboutData.storyImages.length === 0 ? (
                                    <img
                                        src="/placeholder.jpg"
                                        alt="Placeholder"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    aboutData.storyImages.map((src, index) => (
                                        <img
                                            key={index}
                                            src={src}
                                            alt={`Story ${index + 1}`}
                                            className="absolute inset-0 h-full w-full object-cover"
                                            style={{
                                                opacity: activeStoryImage === index ? 1 : 0,
                                                transition: "opacity 0.8s ease-in-out",
                                            }}
                                        />
                                    ))
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-slate-900">
                                        Discover Anilao Through ASDC
                                    </div>
                                </div>
                            </div>

                            {aboutData.storyImages.length > 1 && (
                                <>
                                    <div className="flex justify-center gap-2 mt-5">
                                        {aboutData.storyImages.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveStoryImage(i)}
                                                className={`transition-all duration-300 rounded-full ${activeStoryImage === i
                                                    ? "w-8 h-2.5 bg-teal-600"
                                                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-center gap-2 mt-4">
                                        {(["←", "→"] as const).map((arrow, di) => (
                                            <button
                                                key={arrow}
                                                onClick={() => {
                                                    const c = aboutData.storyImages.length;
                                                    setActiveStoryImage((p) =>
                                                        di === 0
                                                            ? p === 0 ? c - 1 : p - 1
                                                            : p === c - 1 ? 0 : p + 1
                                                    );
                                                }}
                                                className="h-9 w-9 rounded-full bg-white shadow border border-slate-200 hover:bg-slate-50 text-slate-600"
                                            >
                                                {arrow}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Story blocks */}
                        <div className="space-y-4 max-w-xl mx-auto w-full">
                            {loading ? (
                                // Skeleton
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-md animate-pulse">
                                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                                            <div className="h-3 bg-slate-100 rounded w-full" />
                                            <div className="h-3 bg-slate-100 rounded w-5/6" />
                                        </div>
                                    </div>
                                ))
                            ) : aboutData.story.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-10">No story content yet.</p>
                            ) : (
                                aboutData.story.map((item, index) => (
                                    <div
                                        key={item.heading || index}
                                        className="flex gap-5 bg-white border border-teal-200/60 rounded-2xl p-6 shadow-md"
                                    >
                                        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 mb-1">{item.heading}</h3>
                                            <p className="text-sm leading-7 text-slate-600">{item.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/*  Core Values  */}
            <section className="relative py-20 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto max-w-6xl px-6">
                    <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 mb-4">What Drives Us</p>
                    <h2 className="text-center text-4xl sm:text-5xl font-bold text-slate-900 mb-14 leading-tight">Core Values</h2>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-md animate-pulse space-y-3">
                                    <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-100 rounded w-full" />
                                    <div className="h-3 bg-slate-100 rounded w-4/5" />
                                </div>
                            ))
                        ) : aboutData.values.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center col-span-3 py-10">No core values yet.</p>
                        ) : (
                            aboutData.values.map((value, i) => {
                                const Icon = ICON_MAP[value.icon] ?? ShieldIcon;
                                return (
                                    <div key={value.title || i} className="bg-white border border-teal-200/60 rounded-2xl p-7 shadow-md">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                            <Icon size={22} color={value.accent || "#0d9488"} strokeWidth={1.75} />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">{value.title}</h3>
                                        <p className="text-sm leading-7 text-slate-600">{value.body}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/*  Team  */}
            <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-600 mb-3">Meet Our Team</p>
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
                            The People Who Make Every Dive Special
                        </h2>
                        <p className="text-sm text-slate-500">Click any card to learn more</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-slate-100 p-5 animate-pulse flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-slate-200 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        <div className="h-2 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : aboutData.team.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-10">No team members yet.</p>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block" />
                            <div className="space-y-2">
                                {LEVEL_ORDER.map((lvl) => {
                                    const members = teamByLevel[lvl];
                                    if (!members?.length) return null;

                                    const cfg = LEVEL_CONFIG[lvl];
                                    const LevelIcon = cfg.icon;
                                    const count = members.length;

                                    const gridClass =
                                        lvl === "owner" || lvl === "manager" || lvl === "support" || lvl === "guide" || lvl === "staff"
                                            ? count === 1
                                                ? "flex justify-center"
                                                : count === 2
                                                    ? "grid grid-cols-2 gap-6 max-w-2xl mx-auto"
                                                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                            : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6";

                                    const cardClass =
                                        (lvl === "owner" || lvl === "manager") && count === 1
                                            ? "w-full sm:w-80"
                                            : "";

                                    return (
                                        <div key={lvl} className="relative">
                                            <div className="flex items-center justify-center mb-10">
                                                <div className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm ${cfg.badge}`}>
                                                    <LevelIcon className="h-4 w-4" />
                                                    {cfg.label}
                                                </div>
                                            </div>
                                            <div className="flex justify-center mb-8">
                                                <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow" />
                                            </div>
                                            <div className={gridClass}>
                                                {members.map((member) => (
                                                    <div key={member.name} className={`relative z-10 ${cardClass}`}>
                                                        <TeamCard
                                                            member={member}
                                                            onClick={() => setSelectedMember(member)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {lvl !== "support" && (
                                                <div className="flex justify-center mt-10">
                                                    <div className="w-px h-10 bg-slate-200" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {selectedMember && (
                    <TeamModal member={selectedMember} onClose={() => setSelectedMember(null)} />
                )}
            </section>

            {/*  CTA  */}
            <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20,184,166,0.6) 0%, transparent 70%)" }}
                />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                        Ready to go{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">deeper?</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 text-base leading-relaxed">
                        Join thousands of divers who've discovered the magic of Anilao's underwater world. Book your dive or certification course today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/booking">
                            <Button size="lg" className="min-w-[220px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-5 text-base font-bold rounded-2xl shadow-xl border-0">
                                <Hotel className="mr-2 h-5 w-5" /> Book Your Dive
                            </Button>
                        </Link>
                        <Link href="/certification">
                            <Button size="lg" variant="outline" className="min-w-[220px] border-2 border-teal-500/50 text-teal-300 hover:bg-teal-900/40 bg-transparent px-8 py-5 text-base font-bold rounded-2xl">
                                <GraduationCap className="mr-2 h-5 w-5" /> Get Certified
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}