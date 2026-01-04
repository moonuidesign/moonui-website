'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

type EmailType = 'otp' | 'asset-release' | 'discount' | 'general';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState<EmailType>('otp');
  const [email, setEmail] = useState('');

  // OTP fields
  const [otp, setOtp] = useState('123456');
  const [title, setTitle] = useState('MoonUI Verification');
  const [buttonText, setButtonText] = useState('Verify Email');
  const [buttonUrl, setButtonUrl] = useState('https://moonui.design');

  // Asset Release fields
  const [assetName, setAssetName] = useState('Sample Template');
  const [assetType, setAssetType] = useState('templates');
  const [imageUrl, setImageUrl] = useState('https://moonui.design/placeholder.png');
  const [description, setDescription] = useState('Check out our latest addition to the library.');
  const [badgeText, setBadgeText] = useState('New');

  // Discount fields
  const [discountAmount, setDiscountAmount] = useState('50%');
  const [discountCode, setDiscountCode] = useState('MOONUI50');
  const [ctaLink, setCtaLink] = useState('https://moonui.design/pricing');

  // General fields
  const [generalContent, setGeneralContent] = useState('This is a test email from MoonUI.');

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      let data: Record<string, unknown> = {};

      switch (emailType) {
        case 'otp':
          data = { title, otp, buttonText, buttonUrl, subject: `Test: ${title}` };
          break;
        case 'asset-release':
          data = {
            assetName,
            assetType,
            imageUrl,
            description,
            badgeText,
            subject: `Test: New ${assetName}`,
          };
          break;
        case 'discount':
          data = {
            title,
            discountAmount,
            description,
            code: discountCode,
            ctaLink,
            subject: `Test: ${discountAmount} Off!`,
          };
          break;
        case 'general':
          data = { content: generalContent, subject: 'Test: General Email' };
          break;
      }

      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: emailType, email, data }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Email sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('An error occurred while sending email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    window.open(`/api/test-email?type=${emailType}&preview=true`, '_blank');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Test Email Templates</h1>
        <p className="mt-1 text-gray-500">Send test emails to preview email designs</p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Email Type Selection */}
        <div className="space-y-2">
          <Label>Email Type</Label>
          <Select value={emailType} onValueChange={(v) => setEmailType(v as EmailType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="otp">OTP / Verification</SelectItem>
              <SelectItem value="asset-release">Asset Release</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipient Email */}
        <div className="space-y-2">
          <Label>Recipient Email</Label>
          <Input
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* OTP Fields */}
        {emailType === 'otp' && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700">OTP Email Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>OTP Code</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              </div>
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Button URL</Label>
                <Input value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Asset Release Fields */}
        {emailType === 'asset-release' && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700">Asset Release Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="components">Components</SelectItem>
                    <SelectItem value="gradients">Gradients</SelectItem>
                    <SelectItem value="designs">Designs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Image URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Discount Fields */}
        {emailType === 'discount' && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700">Discount Email Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Black Friday Sale!"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Amount</Label>
                <Input
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="50%"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Discount Code</Label>
                <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* General Fields */}
        {emailType === 'general' && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700">General Email Settings</h3>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                rows={5}
                value={generalContent}
                onChange={(e) => setGeneralContent(e.target.value)}
                placeholder="Enter your email content..."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSendEmail} disabled={loading || !email} className="flex-1">
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            Preview HTML
          </Button>
        </div>
      </div>

      {/* Quick Preview Links */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-3 font-medium text-gray-700">Quick Preview Links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/test-email?type=otp&preview=true"
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            OTP Email
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/api/test-email?type=asset-release&preview=true"
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Asset Release
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/api/test-email?type=discount&preview=true"
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Discount
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/api/test-email?type=general&preview=true"
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            General
          </a>
        </div>
      </div>
    </div>
  );
}
