import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-md-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SiteForge</span>
      </Link>

      <div className="space-y-3 border-b border-md-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-md-primary font-bold text-xs uppercase tracking-wider">
          <Mail className="w-5 h-5" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-sm text-md-on-surface-variant">Get in touch with the SiteForge engineering team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 text-sm text-md-on-surface">
          <div className="flex items-start gap-4 p-4 rounded-md-lg bg-md-surface border border-md-outline-variant/40">
            <Mail className="w-5 h-5 text-md-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-base">Email Support</p>
              <p className="text-xs text-md-on-surface-variant mt-0.5">Reach out for technical questions, feedback, or bug reports.</p>
              <p className="text-sm font-semibold text-md-primary mt-2">support@siteforge.ai</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-md-lg bg-md-surface border border-md-outline-variant/40">
            <MapPin className="w-5 h-5 text-md-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-base">Engineering HQ</p>
              <p className="text-xs text-md-on-surface-variant mt-0.5">SiteForge Open Platform Project</p>
              <p className="text-sm font-semibold text-md-on-surface mt-2">Jubilee Hills, Hyderabad, Telangana, India</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for reaching out! We will reply via email shortly.'); }} className="space-y-4 p-6 rounded-md-xl bg-md-surface border border-md-outline-variant/40">
          <h3 className="font-bold text-base">Send us a message</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-md-on-surface-variant">Your Name</label>
            <input type="text" required placeholder="Enter your full name..." className="w-full px-3 py-2 text-sm rounded-md-sm bg-md-surface-container border border-md-outline-variant text-md-on-surface outline-none focus:border-md-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-md-on-surface-variant">Your Email</label>
            <input type="email" required placeholder="name@domain.com" className="w-full px-3 py-2 text-sm rounded-md-sm bg-md-surface-container border border-md-outline-variant text-md-on-surface outline-none focus:border-md-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-md-on-surface-variant">Message</label>
            <textarea required rows={4} placeholder="How can we help you?" className="w-full px-3 py-2 text-sm rounded-md-sm bg-md-surface-container border border-md-outline-variant text-md-on-surface outline-none focus:border-md-primary"></textarea>
          </div>
          <button type="submit" className="w-full py-2.5 bg-md-primary text-md-on-primary font-bold text-sm rounded-md-sm hover:opacity-90 transition-opacity">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
