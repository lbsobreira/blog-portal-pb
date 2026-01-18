"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImagePositionEditor from "@/components/admin/ImagePositionEditor";
import LogoPositionEditor from "@/components/admin/LogoPositionEditor";
import HelpTip from "@/components/ui/HelpTip";

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

interface SkillGroup {
  category: string;
  items: string[];
}

interface Badge {
  name: string;
  imageUrl: string;
  link?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    siteName: "",
    siteTagline: "",
    siteLogo: "",
    siteLogoZoom: 100,
    siteLogoX: 0,
    siteLogoY: 0,
    profileName: "",
    profileTitle: "",
    profileLocation: "",
    profileBio: "",
    profileImage: "",
    profileImageZoom: 100,
    profileImageX: 0,
    profileImageY: 0,
    coverImage: "",
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    contactEmail: "",
  });

  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      const settings = data.settings;

      setFormData({
        siteName: settings.siteName || "",
        siteTagline: settings.siteTagline || "",
        siteLogo: settings.siteLogo || "",
        siteLogoZoom: settings.siteLogoZoom || 100,
        siteLogoX: settings.siteLogoX || 0,
        siteLogoY: settings.siteLogoY || 0,
        profileName: settings.profileName || "",
        profileTitle: settings.profileTitle || "",
        profileLocation: settings.profileLocation || "",
        profileBio: settings.profileBio || "",
        profileImage: settings.profileImage || "",
        profileImageZoom: settings.profileImageZoom || 100,
        profileImageX: settings.profileImageX || 0,
        profileImageY: settings.profileImageY || 0,
        coverImage: settings.coverImage || "",
        githubUrl: settings.githubUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        twitterUrl: settings.twitterUrl || "",
        contactEmail: settings.contactEmail || "",
      });

      try {
        setExperience(JSON.parse(settings.experience || "[]"));
        setSkills(JSON.parse(settings.skills || "[]"));
        setCertifications(JSON.parse(settings.certifications || "[]"));
        setBadges(JSON.parse(settings.badges || "[]"));
      } catch {
        setExperience([]);
        setSkills([]);
        setCertifications([]);
        setBadges([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience,
          skills,
          certifications,
          badges,
        }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Experience handlers
  const addExperience = () => {
    setExperience([...experience, { role: "", company: "", period: "", description: "" }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Skills handlers
  const addSkillGroup = () => {
    setSkills([...skills, { category: "", items: [] }]);
  };

  const updateSkillCategory = (index: number, category: string) => {
    const updated = [...skills];
    updated[index].category = category;
    setSkills(updated);
  };

  const updateSkillItems = (index: number, items: string) => {
    const updated = [...skills];
    updated[index].items = items.split(",").map((s) => s.trim()).filter(Boolean);
    setSkills(updated);
  };

  const removeSkillGroup = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Certifications handlers
  const addCertification = () => {
    setCertifications([...certifications, ""]);
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Badges handlers
  const addBadge = () => {
    setBadges([...badges, { name: "", imageUrl: "", link: "" }]);
  };

  const updateBadge = (index: number, field: keyof Badge, value: string) => {
    const updated = [...badges];
    updated[index] = { ...updated[index], [field]: value };
    setBadges(updated);
  };

  const removeBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your About page and profile information
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Site Branding */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Site Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                placeholder="IT Blog"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">Displayed in header and browser tab</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo URL
                <HelpTip text="Recommended: PNG or SVG with transparent background. Height should be around 40px for best display in the header." />
              </label>
              <input
                type="url"
                value={formData.siteLogo}
                onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Site Tagline</label>
              <input
                type="text"
                value={formData.siteTagline}
                onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                placeholder="A personal space to showcase IT projects and share technical knowledge"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">Short description for homepage, footer, and SEO</p>
            </div>
          </div>
          {/* Logo Position Editor */}
          {formData.siteLogo && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <LogoPositionEditor
                imageUrl={formData.siteLogo}
                zoom={formData.siteLogoZoom}
                positionX={formData.siteLogoX}
                positionY={formData.siteLogoY}
                onZoomChange={(zoom) => setFormData({ ...formData, siteLogoZoom: zoom })}
                onPositionChange={(x, y) => setFormData({ ...formData, siteLogoX: x, siteLogoY: y })}
              />
            </div>
          )}
        </div>

        {/* Basic Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.profileName}
                onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.profileTitle}
                onChange={(e) => setFormData({ ...formData, profileTitle: e.target.value })}
                placeholder="IT Professional | Developer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.profileLocation}
                onChange={(e) => setFormData({ ...formData, profileLocation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Cover/Header Image URL
                <HelpTip text="Recommended: 1200x400px or wider. Use a landscape image. Will be displayed as the banner at the top of the About page." />
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Image URL
                <HelpTip text="Minimum: 200x200px. Square images work best. Use the editor below to zoom and position your photo within the circle." />
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />

              {/* Image Position Editor */}
              {formData.profileImage && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <ImagePositionEditor
                    imageUrl={formData.profileImage}
                    zoom={formData.profileImageZoom}
                    positionX={formData.profileImageX}
                    positionY={formData.profileImageY}
                    onZoomChange={(zoom) => setFormData({ ...formData, profileImageZoom: zoom })}
                    onPositionChange={(x, y) => setFormData({ ...formData, profileImageX: x, profileImageY: y })}
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.profileBio}
                onChange={(e) => setFormData({ ...formData, profileBio: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Twitter URL</label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(index, "role", e.target.value)}
                    placeholder="Role/Title"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    placeholder="Company"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateExperience(index, "period", e.target.value)}
                    placeholder="2020 - Present"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Description of your role..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            ))}
            {experience.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No experience added yet</p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Skills</h2>
            <button
              type="button"
              onClick={addSkillGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Skill Group
            </button>
          </div>
          <div className="space-y-4">
            {skills.map((group, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex gap-4 mb-2">
                  <input
                    type="text"
                    value={group.category}
                    onChange={(e) => updateSkillCategory(index, e.target.value)}
                    placeholder="Category (e.g., Security, Development)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkillGroup(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={group.items.join(", ")}
                  onChange={(e) => updateSkillItems(index, e.target.value)}
                  placeholder="Skills separated by commas (e.g., Python, JavaScript, React)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Certifications</h2>
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Certification
            </button>
          </div>
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => updateCertification(index, e.target.value)}
                  placeholder="e.g., AWS Solutions Architect, CISSP"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {certifications.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No certifications added yet</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Badges</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add certification badges from Credly, AWS, Azure, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={addBadge}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Badge
            </button>
          </div>
          <div className="space-y-4">
            {badges.map((badge, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Badge Name</label>
                    <input
                      type="text"
                      value={badge.name}
                      onChange={(e) => updateBadge(index, "name", e.target.value)}
                      placeholder="e.g., AWS Solutions Architect"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={badge.imageUrl}
                      onChange={(e) => updateBadge(index, "imageUrl", e.target.value)}
                      placeholder="https://images.credly.com/..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Verification Link (optional)</label>
                    <input
                      type="url"
                      value={badge.link || ""}
                      onChange={(e) => updateBadge(index, "link", e.target.value)}
                      placeholder="https://credly.com/badges/..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {badge.imageUrl && (
                    <img
                      src={badge.imageUrl}
                      alt={badge.name || "Badge preview"}
                      className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeBadge(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {badges.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No badges added yet</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/about"
            target="_blank"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Preview About Page
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
