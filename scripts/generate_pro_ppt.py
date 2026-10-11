import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_professional_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Executive Modern Dark Palette
    C_BG_DEEP = RGBColor(10, 15, 29)       # Ultra deep slate #0A0F1D
    C_CARD_BG = RGBColor(18, 26, 47)       # Polished card slate #121A2F
    C_CARD_BORDER = RGBColor(38, 52, 85)   # Border slate #263455
    C_TEXT_WHITE = RGBColor(255, 255, 255) # Pure white
    C_TEXT_LIGHT = RGBColor(226, 232, 240) # Slate 200
    C_TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    
    # Premium Accents
    C_INDIGO = RGBColor(99, 102, 241)      # #6366F1
    C_CYAN = RGBColor(6, 182, 212)         # #06B6D4
    C_EMERALD = RGBColor(16, 185, 129)     # #10B981
    C_AMBER = RGBColor(245, 158, 11)       # #F59E0B
    C_ROSE = RGBColor(244, 63, 94)         # #F43F5E

    def apply_canvas_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG_DEEP
        bg.line.fill.background()

        # Top subtle ambient bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.08))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = C_INDIGO
        top_bar.line.fill.background()

    def add_slide_header(slide, slide_num, total_slides, badge_text, title_text, subtitle_text):
        # Badge Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(3.2), Inches(0.35))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(26, 38, 68)
        pill.line.color.rgb = C_CYAN
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        tf_pill.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = f"• {badge_text.upper()}"
        p_pill.font.size = Pt(9.5)
        p_pill.font.bold = True
        p_pill.font.color.rgb = C_CYAN
        p_pill.alignment = PP_ALIGN.LEFT

        # Slide Page Counter
        counter = slide.shapes.add_textbox(Inches(10.5), Inches(0.4), Inches(2.0), Inches(0.35))
        p_cnt = counter.text_frame.paragraphs[0]
        p_cnt.text = f"{slide_num:02d} / {total_slides:02d}"
        p_cnt.font.size = Pt(11)
        p_cnt.font.bold = True
        p_cnt.font.color.rgb = C_TEXT_MUTED
        p_cnt.alignment = PP_ALIGN.RIGHT

        # Main Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.7), Inches(0.65))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(23)
        p_t.font.bold = True
        p_t.font.color.rgb = C_TEXT_WHITE

        # Subtitle / Context
        s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.38), Inches(11.7), Inches(0.4))
        p_s = s_box.text_frame.paragraphs[0]
        p_s.text = subtitle_text
        p_s.font.size = Pt(11.5)
        p_s.font.color.rgb = C_TEXT_MUTED

    def add_footer_brand(slide):
        f_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.7), Inches(0.3))
        p_f = f_box.text_frame.paragraphs[0]
        p_f.text = "SiteForge v2.4  |  Autonomous Verified AI Website Builder  |  Playwright Verified  |  Zero Lock-in ZIP"
        p_f.font.size = Pt(8.5)
        p_f.font.color.rgb = RGBColor(71, 85, 105)

    slides_info = [
        # SLIDE 1: COVER
        {
            "type": "cover",
            "title": "SiteForge",
            "subtitle": "Autonomous Verified AI Website Builder & Hostinger-Style Template Engine",
            "tagline": "Build websites you can trust — verified down to the byte.",
            "tech_tags": ["Next.js 15 App Router", "Groq Llama-3.3-70B", "Playwright Verification", "Grounded RAG Citations", "1-Click Offline ZIP"],
            "notes": "Good morning judges and audience! Today we present SiteForge: an autonomous verified AI website builder that transforms user prompts and live web research into production-grade multi-page websites verified by Playwright browser testing and grounded web research."
        },
        # SLIDE 2: THE PROBLEM
        {
            "type": "cards_3",
            "badge": "Market Failure",
            "title": "The 3 Critical Flaws of Existing AI Website Builders",
            "subtitle": "Why 84% of AI-generated websites require complete manual rewrites before production deployment.",
            "notes": "Existing AI website builders suffer from 3 critical flaws: hallucinating fake facts, generating dead links and 404 pages, and destroying adjacent layout sections during visual edits. SiteForge solves all three.",
            "cards": [
                {
                    "num": "01",
                    "title": "Hallucinated Facts & Claims",
                    "desc": "Generic LLM builders fabricate phone numbers, non-existent addresses, and unbacked corporate awards that misrepresent real businesses.",
                    "tag": "UNVERIFIED CONTENT",
                    "accent": C_ROSE
                },
                {
                    "num": "02",
                    "title": "Dead Links & 404 Form Submits",
                    "desc": "Generated code is littered with dead anchor tags, missing subpages, unlinked CTA buttons, and mock forms that fail to handle user inputs.",
                    "tag": "BROKEN INTERACTION",
                    "accent": C_ROSE
                },
                {
                    "num": "03",
                    "title": "Overwrite & Collateral Damage",
                    "desc": "Prompting an AI to edit a single paragraph frequently mutates, restyles, or breaks surrounding, perfectly styled layout components.",
                    "tag": "SIDE-EFFECT MUTATIONS",
                    "accent": C_ROSE
                }
            ]
        },
        # SLIDE 3: OUR SOLUTION
        {
            "type": "cards_3",
            "badge": "Core Innovation",
            "title": "The SiteForge Solution: Architecture Built on Verification",
            "subtitle": "Bridging the trust gap between generative AI prototypes and production-ready deployments.",
            "notes": "SiteForge introduces verified web architecture. We combine real-time web research, Playwright automated browser verification, SHA-256 section proofs, and 1-click zero-lockin ZIP export.",
            "cards": [
                {
                    "num": "01",
                    "title": "Grounded Web Research (RAG)",
                    "desc": "Tavily & DuckDuckGo APIs search live sources. Every generated business fact carries an active URL citation or explicit 'Needs Review' flag.",
                    "tag": "FACTUAL CITATIONS",
                    "accent": C_EMERALD
                },
                {
                    "num": "02",
                    "title": "Playwright Engine Verification",
                    "desc": "Headless browser automatically crawls every internal page, CTA button, and form across desktop (1280px) and mobile (375px) viewports.",
                    "tag": "0 DEAD LINKS GUARANTEE",
                    "accent": C_CYAN
                },
                {
                    "num": "03",
                    "title": "SHA-256 Section Isolation",
                    "desc": "Mathematical checksums assert that editing section A leaves sections B, C, and D 100% byte-identical with zero collateral overwrite.",
                    "tag": "ZERO-COLLATERAL EDITS",
                    "accent": C_INDIGO
                }
            ]
        },
        # SLIDE 4: SYSTEM PIPELINE (4 STEPS)
        {
            "type": "process_4",
            "badge": "Pipeline Architecture",
            "title": "Autonomous Multi-Agent Generation Pipeline",
            "subtitle": "How SiteForge progresses from natural language prompt to a verified multi-page codebase.",
            "notes": "Here is our 4-step pipeline: Intake & Web Research via Tavily/DuckDuckGo, Zod Spec synthesis via Groq Llama-3.3-70B, multi-page HTML compilation, and SSE streaming progress logs.",
            "steps": [
                {
                    "step": "STAGE 01",
                    "title": "Web Research Engine",
                    "desc": "Executes real-time Tavily API queries to gather verified facts, competitor context, and business details.",
                    "accent": C_CYAN
                },
                {
                    "step": "STAGE 02",
                    "title": "Zod Schema Synthesis",
                    "desc": "Groq Llama-3.3-70B synthesizes a structured SiteSpec contract validated strictly by TypeScript Zod schemas.",
                    "accent": C_INDIGO
                },
                {
                    "step": "STAGE 03",
                    "title": "Multi-Page Compiler",
                    "desc": "Compiles index.html, about.html, services.html, contact.html, styles.css, script.js with working state.",
                    "accent": C_AMBER
                },
                {
                    "step": "STAGE 04",
                    "title": "Browser Verification",
                    "desc": "Playwright executes headless browser test suite; passes human approval gate before enabling 1-click export.",
                    "accent": C_EMERALD
                }
            ]
        },
        # SLIDE 5: PLAYWRIGHT VERIFICATION DEEP DIVE
        {
            "type": "cards_3",
            "badge": "Quality Assurance (Metric U1)",
            "title": "Automated Playwright Crawl & Accessibility Engine",
            "subtitle": "Guaranteed zero 404 links, verified form submission handlers, and WCAG AA contrast compliance.",
            "notes": "Metric U1: Before export is permitted, Playwright headless Chromium crawls every page, button, and form across mobile 375px and desktop 1280px viewports to assert 0 dead links.",
            "cards": [
                {
                    "num": "01",
                    "title": "100% Link & Form Crawl",
                    "desc": "Automatically clicks all anchor elements, navigation menus, and validates that contact forms log submissions without broken routes.",
                    "tag": "0 DEAD LINKS",
                    "accent": C_CYAN
                },
                {
                    "num": "02",
                    "title": "Responsive Viewport Suite",
                    "desc": "Tests mobile (375px), tablet (768px), and desktop (1280px) viewports to guarantee fluid layout scaling without horizontal overflow.",
                    "tag": "MULTI-VIEWPORT",
                    "accent": C_EMERALD
                },
                {
                    "num": "03",
                    "title": "WCAG 2.2 AA Contrast Audit",
                    "desc": "Evaluates foreground/background text contrast across both light and dark themes to ensure strict accessibility compliance.",
                    "tag": "ACCESSIBILITY PASS",
                    "accent": C_AMBER
                }
            ]
        },
        # SLIDE 6: EVIDENCE PASS & HALLUCINATION GUARD
        {
            "type": "cards_3",
            "badge": "Content Integrity (Metrics U2, U3)",
            "title": "Evidence-Backed Content & Hallucination Guard",
            "subtitle": "Replacing fabricated AI claims with verifiable web research citations and human approval flags.",
            "notes": "Metrics U2 & U3: Grounded RAG citations attach source links to factual claims. Any unverified numerical stat or price is flagged with a visible 'Needs Review' badge in preview.",
            "cards": [
                {
                    "num": "01",
                    "title": "Source Grounding Engine (U2)",
                    "desc": "Every corporate claim, pricing figure, or service feature carries active hyperlinked citations to scraped knowledge documents.",
                    "tag": "CITATION ATTACHMENT",
                    "accent": C_EMERALD
                },
                {
                    "num": "02",
                    "title": "Hallucination Guard (U3)",
                    "desc": "Heuristic scanner flags ungrounded numerical metrics, awards, or assertions with prominent 'Needs Review' warning pills.",
                    "tag": "HEURISTIC SCANNER",
                    "accent": C_AMBER
                },
                {
                    "num": "03",
                    "title": "Human Approval Gate (U6)",
                    "desc": "Download export button remains locked until the user acknowledges verified sources and resolves unreviewed markers.",
                    "tag": "HUMAN-IN-THE-LOOP",
                    "accent": C_INDIGO
                }
            ]
        },
        # SLIDE 7: VISUAL STUDIO & SHA-256 ISOLATION
        {
            "type": "cards_3",
            "badge": "Precision Editing (Metric U4)",
            "title": "Visual Studio & SHA-256 Zero-Collateral Editing",
            "subtitle": "Point-and-click edits and bounded AI refinement with mathematical layout integrity proofs.",
            "notes": "Metric U4: Zero-collateral section editing uses JSON Patch and SHA-256 checksums to modify target sections while mathematically proving non-target sections remain 100% byte-identical.",
            "cards": [
                {
                    "num": "01",
                    "title": "Point-and-Click Visual Canvas",
                    "desc": "Edit text inline, swap typography tokens, modify color palettes, and toggle section visibility with instantaneous live preview.",
                    "tag": "INLINE STUDIO",
                    "accent": C_CYAN
                },
                {
                    "num": "02",
                    "title": "Section-Bounded AI Prompts",
                    "desc": "Instruct the AI to rewrite only the Hero or Testimonials without letting the model modify or touch other sections.",
                    "tag": "SCOPED INFERENCE",
                    "accent": C_INDIGO
                },
                {
                    "num": "03",
                    "title": "SHA-256 Checksum Proofs",
                    "desc": "Calculates SHA-256 hashes before and after edits. Proves that non-target components remain 100% byte-identical.",
                    "tag": "INTEGRITY GUARANTEE",
                    "accent": C_EMERALD
                }
            ]
        },
        # SLIDE 8: TEMPLATE GALLERY
        {
            "type": "cards_3",
            "badge": "Design System",
            "title": "Hostinger-Style Starter Template Gallery",
            "subtitle": "12 curated, visually distinct categories for instant deployment and customization.",
            "notes": "SiteForge features a Hostinger-style template gallery with 12 distinct categories. Each template can be inspected in a live preview sandbox and customized with 1 click.",
            "cards": [
                {
                    "num": "01",
                    "title": "12 Category Showcase",
                    "desc": "Portfolio, SaaS Startup, Restaurant, Medical Clinic, Law Firm, E-commerce, NGO, Real Estate, Education, Photography, Agency, Blog.",
                    "tag": "CURATED TEMPLATES",
                    "accent": C_INDIGO
                },
                {
                    "num": "02",
                    "title": "Sandboxed Iframe Previews",
                    "desc": "Each template runs inside an isolated iframe sandbox, allowing users to test interactions and responsive views before selecting.",
                    "tag": "INTERACTIVE PREVIEWS",
                    "accent": C_CYAN
                },
                {
                    "num": "03",
                    "title": "1-Click 'Use Template'",
                    "desc": "Instantly clones template specifications into the AI builder, enabling complete content adaptation in under 15 seconds.",
                    "tag": "RAPID FORKING",
                    "accent": C_AMBER
                }
            ]
        },
        # SLIDE 9: STUDENT KNOWLEDGE LIBRARY
        {
            "type": "cards_3",
            "badge": "Academic Research Mode",
            "title": "Student Knowledge Library & RAG Document Ingestion",
            "subtitle": "Transform lecture notes, research papers, and textbooks into verified revision websites.",
            "notes": "The Knowledge Library allows students and researchers to upload PDFs and study notes. SiteForge constructs revision sites and study flashcards grounded in exact source pages.",
            "cards": [
                {
                    "num": "01",
                    "title": "PDF & Note Vector Ingestion",
                    "desc": "Upload syllabi, lecture slides, and PDF chapters. SiteForge parses and chunks source materials into grounded retrieval blocks.",
                    "tag": "DOCUMENT INGESTION",
                    "accent": C_AMBER
                },
                {
                    "num": "02",
                    "title": "Grounded Study Flashcards",
                    "desc": "Synthesizes interactive revision quizzes, summary cheat sheets, and flashcards carrying exact document page citations.",
                    "tag": "STUDY PLATFORMS",
                    "accent": C_EMERALD
                },
                {
                    "num": "03",
                    "title": "Zero-Hallucination Guardrail",
                    "desc": "Strictly bounds answers to uploaded materials. If a topic is absent, it displays 'Not found in uploaded source' rather than fabricating.",
                    "tag": "ACADEMIC INTEGRITY",
                    "accent": C_CYAN
                }
            ]
        },
        # SLIDE 10: INDIA-FIRST LOCALIZATION & VOICE
        {
            "type": "cards_3",
            "badge": "Accessibility & Commerce (Metrics U14, U15)",
            "title": "India-First Localization & Voice-to-Website Input",
            "subtitle": "Native Indic script generation, regional payment integrations, and hands-free voice prompt synthesis.",
            "notes": "Metrics U14 & U15: Built for India-first localization with native English, Telugu, and Hindi generation, Web Speech API voice input, INR formatting, UPI QR payments, and WhatsApp integration.",
            "cards": [
                {
                    "num": "01",
                    "title": "Multi-Lingual Generation (U14)",
                    "desc": "Complete website compilation in English, Telugu (తెలుగు), and Hindi (हिन्दी) with native typography fallbacks.",
                    "tag": "INDIC LOCALIZATION",
                    "accent": C_EMERALD
                },
                {
                    "num": "02",
                    "title": "Voice-to-Website Input (U15)",
                    "desc": "Web Speech API integration enables voice prompt dictation in Telugu and English for seamless non-keyboard onboarding.",
                    "tag": "VOICE INPUT",
                    "accent": C_CYAN
                },
                {
                    "num": "03",
                    "title": "UPI & WhatsApp Integration",
                    "desc": "Renders working UPI QR payment codes with INR currency formatting and 1-click WhatsApp customer support action buttons.",
                    "tag": "COMMERCE INTEGRATION",
                    "accent": C_AMBER
                }
            ]
        },
        # SLIDE 11: SEO, ACCESSIBILITY & SECURITY
        {
            "type": "cards_3",
            "badge": "Compliance & Security (Metrics U7, U17, U18)",
            "title": "Built-In SEO Package, Accessibility & Security Scanner",
            "subtitle": "Production-grade search visibility, WCAG 2.2 AA accessibility, and security scanning out of the box.",
            "notes": "Metrics U7, U17, U18: Includes automated sitemap.xml, Schema.org JSON-LD data, WCAG 2.2 AA contrast auditing, and honest security scanning for CSP meta tags and script injection.",
            "cards": [
                {
                    "num": "01",
                    "title": "Automated SEO Suite (U17)",
                    "desc": "Auto-generates sitemap.xml, robots.txt, dynamic OpenGraph meta tags, and Schema.org JSON-LD structured data for rich snippets.",
                    "tag": "SEARCH ENGINE READY",
                    "accent": C_CYAN
                },
                {
                    "num": "02",
                    "title": "Accessibility Scanner (U18)",
                    "desc": "Audits image alt text, keyboard tab indexing, skip-to-content links, and ARIA labels with automatic baseline fixes.",
                    "tag": "WCAG 2.2 AA AUDIT",
                    "accent": C_EMERALD
                },
                {
                    "num": "03",
                    "title": "Honest Security Scanner (U7)",
                    "desc": "Scans for inline XSS vulnerabilities, untrusted third-party script CDN tags, and enforces Content Security Policy (CSP) headers.",
                    "tag": "SECURITY HARDENING",
                    "accent": C_ROSE
                }
            ]
        },
        # SLIDE 12: DASHBOARD & VERSION CONTROL
        {
            "type": "cards_3",
            "badge": "Project Management (Metrics U5, U9, U12)",
            "title": "Project Dashboard, Real-time Inbox & Version Rollback",
            "subtitle": "Complete lifecycle management from initial generation to continuous maintenance.",
            "notes": "Metrics U5, U9, U12: Project Dashboard displays verification pass rate (100%), version history timeline (v1, v2) with 1-click rollback, and real-time form submission inbox.",
            "cards": [
                {
                    "num": "01",
                    "title": "Project Insights Hub (U9)",
                    "desc": "Centralized dashboard displaying verification pass rates, edit counts, responsive health scores, and project configurations.",
                    "tag": "MONITORING DASHBOARD",
                    "accent": C_INDIGO
                },
                {
                    "num": "02",
                    "title": "1-Click Version Rollback (U5)",
                    "desc": "Maintains an immutable timeline of site revisions (v1, v2, v3...). Instant 1-click rollback if an experiment is rejected.",
                    "tag": "VERSION TIMELINE",
                    "accent": C_CYAN
                },
                {
                    "num": "03",
                    "title": "Live Form Submissions Inbox (U12)",
                    "desc": "Real-time inbox logging user contact forms and booking requests directly in the dashboard without third-party email tools.",
                    "tag": "LEAD CAPTURE",
                    "accent": C_EMERALD
                }
            ]
        },
        # SLIDE 13: 100% FREE-TIER TECH STACK
        {
            "type": "cards_3",
            "badge": "Architecture & Cost (Free-Tier Stack)",
            "title": "100% Free-Tier Architecture & Zero Operating Cost",
            "subtitle": "Engineered for maximum performance and complete zero-credit-card accessibility.",
            "notes": "SiteForge is engineered on a 100% free-tier stack using Next.js 15, Groq Llama-3.3-70B for fast inference, Tavily for web search, and Playwright for automated browser testing.",
            "cards": [
                {
                    "num": "01",
                    "title": "Next.js 15 & Tailwind CSS",
                    "desc": "Built on React 19, TypeScript, Lucide Icons, and Next.js App Router for serverless streaming and lightning-fast rendering.",
                    "tag": "MODERN APPLICATION",
                    "accent": C_CYAN
                },
                {
                    "num": "02",
                    "title": "Groq Llama-3.3-70B & Tavily",
                    "desc": "Utilizes free-tier Groq API for sub-second LLM inference, OpenRouter fallback, and Tavily free search with zero credit card required.",
                    "tag": "FREE-TIER AI ENGINE",
                    "accent": C_AMBER
                },
                {
                    "num": "03",
                    "title": "Playwright & FFmpeg Pipeline",
                    "desc": "Headless Chromium automated crawl test runner and FFmpeg media pipeline for automated demonstration video production.",
                    "tag": "AUTOMATION SUITE",
                    "accent": C_EMERALD
                }
            ]
        },
        # SLIDE 14: CONCLUSION & EXPORT
        {
            "type": "cards_3",
            "badge": "Final Deliverable (Metrics U10, U19)",
            "title": "Conclusion, Offline ZIP Export & Live Demonstration",
            "subtitle": "100% code ownership with zero vendor lock-in and instant multi-cloud deployment.",
            "notes": "Metrics U10 & U19: SiteForge outputs 100% offline-ready HTML/CSS/JS ZIP packages with zero vendor lock-in and free deployment guides for Vercel, Netlify, and GitHub Pages. Thank you!",
            "cards": [
                {
                    "num": "01",
                    "title": "No Vendor Lock-in (U10)",
                    "desc": "Download standalone ZIP packages containing standard HTML5, CSS3, JS, and JSON spec files that run anywhere without subscriptions.",
                    "tag": "100% CODE OWNERSHIP",
                    "accent": C_EMERALD
                },
                {
                    "num": "02",
                    "title": "Free Hosting Deploy Kit (U19)",
                    "desc": "Includes automated 1-click deployment instructions for Vercel, Netlify, Cloudflare Pages, and GitHub Pages free hosting.",
                    "tag": "FREE CLOUD DEPLOY",
                    "accent": C_CYAN
                },
                {
                    "num": "03",
                    "title": "Live Demonstration & Q&A",
                    "desc": "Experience our live interactive studio and automated 2-minute demo video. Thank you for your time and feedback!",
                    "tag": "THANK YOU",
                    "accent": C_INDIGO
                }
            ]
        }
    ]

    total_slides = len(slides_info)

    for idx, s in enumerate(slides_info):
        slide = prs.slides.add_slide(blank_layout)
        apply_canvas_background(slide)

        # Set speaker notes
        slide.notes_slide.notes_text_frame.text = s["notes"]

        if s["type"] == "cover":
            # High-impact Cover Layout
            # Top pill
            pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.3), Inches(4.2), Inches(0.4))
            pill.fill.solid()
            pill.fill.fore_color.rgb = RGBColor(26, 38, 68)
            pill.line.color.rgb = C_CYAN
            pill.line.width = Pt(1.5)
            p_pill = pill.text_frame.paragraphs[0]
            p_pill.text = "• AUTONOMOUS VERIFIED AI WEBSITE BUILDER v2.4"
            p_pill.font.size = Pt(10)
            p_pill.font.bold = True
            p_pill.font.color.rgb = C_CYAN

            # Massive Title
            t_box = slide.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(1.5))
            p_t = t_box.text_frame.paragraphs[0]
            p_t.text = s["title"]
            p_t.font.size = Pt(62)
            p_t.font.bold = True
            p_t.font.color.rgb = C_TEXT_WHITE

            # Subtitle
            sub_box = slide.shapes.add_textbox(Inches(1.0), Inches(3.6), Inches(11.0), Inches(0.9))
            p_sub = sub_box.text_frame.paragraphs[0]
            p_sub.text = s["subtitle"]
            p_sub.font.size = Pt(21)
            p_sub.font.bold = True
            p_sub.font.color.rgb = C_CYAN

            # Tagline
            tag_box = slide.shapes.add_textbox(Inches(1.0), Inches(4.5), Inches(11.0), Inches(0.6))
            p_tag = tag_box.text_frame.paragraphs[0]
            p_tag.text = f'"{s["tagline"]}"'
            p_tag.font.size = Pt(15)
            p_tag.font.italic = True
            p_tag.font.color.rgb = C_TEXT_LIGHT

            # Technology Tags Bar
            left_tag = Inches(1.0)
            for tag_text in s["tech_tags"]:
                tag_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_tag, Inches(5.4), Inches(2.1), Inches(0.4))
                tag_shape.fill.solid()
                tag_shape.fill.fore_color.rgb = C_CARD_BG
                tag_shape.line.color.rgb = C_CARD_BORDER
                p_tt = tag_shape.text_frame.paragraphs[0]
                p_tt.text = tag_text
                p_tt.font.size = Pt(9.5)
                p_tt.font.color.rgb = C_TEXT_LIGHT
                p_tt.alignment = PP_ALIGN.CENTER
                left_tag += Inches(2.25)

            add_footer_brand(slide)

        elif s["type"] == "cards_3":
            add_slide_header(slide, idx + 1, total_slides, s["badge"], s["title"], s["subtitle"])
            cards = s["cards"]
            c_width = Inches(3.64)
            c_gap = Inches(0.39)
            start_x = Inches(0.8)
            start_y = Inches(2.05)
            c_height = Inches(4.65)

            for c_i, card in enumerate(cards):
                c_x = start_x + c_i * (c_width + c_gap)
                
                # Outer Card Container
                card_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_x, start_y, c_width, c_height)
                card_shape.fill.solid()
                card_shape.fill.fore_color.rgb = C_CARD_BG
                card_shape.line.color.rgb = card["accent"]
                card_shape.line.width = Pt(1.5)

                # Card Header Bar inside
                h_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_x + Inches(0.2), start_y + Inches(0.2), c_width - Inches(0.4), Inches(0.05))
                h_bar.fill.solid()
                h_bar.fill.fore_color.rgb = card["accent"]
                h_bar.line.fill.background()

                # Inner Content
                tb = slide.shapes.add_textbox(c_x + Inches(0.25), start_y + Inches(0.4), c_width - Inches(0.5), c_height - Inches(0.6))
                tf = tb.text_frame
                tf.word_wrap = True

                # Step Number / Category Tag
                p_tag = tf.paragraphs[0]
                p_tag.text = f"{card['num']}  |  {card['tag']}"
                p_tag.font.size = Pt(10)
                p_tag.font.bold = True
                p_tag.font.color.rgb = card["accent"]
                p_tag.space_after = Pt(12)

                # Title
                p_title = tf.add_paragraph()
                p_title.text = card["title"]
                p_title.font.size = Pt(17)
                p_title.font.bold = True
                p_title.font.color.rgb = C_TEXT_WHITE
                p_title.space_after = Pt(14)

                # Description
                p_desc = tf.add_paragraph()
                p_desc.text = card["desc"]
                p_desc.font.size = Pt(12.5)
                p_desc.font.color.rgb = C_TEXT_MUTED

            add_footer_brand(slide)

        elif s["type"] == "process_4":
            add_slide_header(slide, idx + 1, total_slides, s["badge"], s["title"], s["subtitle"])
            steps = s["steps"]
            s_width = Inches(2.7)
            s_gap = Inches(0.3)
            start_x = Inches(0.8)
            start_y = Inches(2.2)
            s_height = Inches(4.5)

            for s_i, st in enumerate(steps):
                s_x = start_x + s_i * (s_width + s_gap)
                
                # Step Shape
                step_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, s_x, start_y, s_width, s_height)
                step_shape.fill.solid()
                step_shape.fill.fore_color.rgb = C_CARD_BG
                step_shape.line.color.rgb = st["accent"]
                step_shape.line.width = Pt(1.5)

                tb = slide.shapes.add_textbox(s_x + Inches(0.2), start_y + Inches(0.3), s_width - Inches(0.4), s_height - Inches(0.5))
                tf = tb.text_frame
                tf.word_wrap = True

                # Stage Pill
                p_stage = tf.paragraphs[0]
                p_stage.text = st["step"]
                p_stage.font.size = Pt(11)
                p_stage.font.bold = True
                p_stage.font.color.rgb = st["accent"]
                p_stage.space_after = Pt(12)

                # Title
                p_st = tf.add_paragraph()
                p_st.text = st["title"]
                p_st.font.size = Pt(16)
                p_st.font.bold = True
                p_st.font.color.rgb = C_TEXT_WHITE
                p_st.space_after = Pt(12)

                # Desc
                p_sd = tf.add_paragraph()
                p_sd.text = st["desc"]
                p_sd.font.size = Pt(12)
                p_sd.font.color.rgb = C_TEXT_MUTED

            add_footer_brand(slide)

    out_file = os.path.join(os.path.dirname(__file__), '..', 'generated', 'SiteForge_Executive_Master_14_Slides.pptx')
    prs.save(out_file)
    print(f"[SUCCESS] Executive Master 14-Slide Presentation saved to: {out_file}")

    # Copy to public download directory
    pub_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'downloads')
    os.makedirs(pub_dir, exist_ok=True)
    pub_copy = os.path.join(pub_dir, 'SiteForge_Executive_Master_14_Slides.pptx')
    shutil.copy(out_file, pub_copy)
    print(f"[SUCCESS] Web download copy updated at: {pub_copy}")

if __name__ == '__main__':
    build_professional_deck()
