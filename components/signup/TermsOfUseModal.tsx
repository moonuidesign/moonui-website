// components/signup/TermsOfUseModal.tsx
// Modal for displaying Terms of Use with scroll detection

'use client';

import { useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2 } from 'lucide-react';

// Default Terms of Use content in HTML format
const DEFAULT_TERMS_CONTENT = `
<h3>1. Introduction</h3>
<p>
  Welcome to MoonUI Design. By accessing and using our services, you agree
  to be bound by these Terms and Conditions. If you do not agree with these
  terms, please do not use our services.
</p>

<h3>2. Definitions</h3>
<p>
  <strong>"Services"</strong> refers to all digital products, including
  templates, UI components, gradients, and other design assets provided by
  MoonUI Design.
  <br />
  <strong>"User"</strong> refers to individuals or entities that use our
  Services.
  <br />
  <strong>"License"</strong> refers to the usage rights granted to Users
  according to the purchased plan.
</p>

<h3>3. License Terms</h3>
<p>
  By purchasing a license from MoonUI Design, you are granted a non-exclusive
  and non-transferable right to use digital assets under the following terms:
</p>
<ul>
  <li>
    <strong>Personal License:</strong> For use on personal projects without
    commercial purposes.
  </li>
  <li>
    <strong>Pro License:</strong> For commercial use on client projects or
    business.
  </li>
  <li>
    You are NOT permitted to resell, redistribute, or share assets with
    third parties.
  </li>
  <li>
    You are NOT permitted to claim assets as your own work.
  </li>
</ul>

<h3>4. Payment & Refunds</h3>
<p>
  All payments are final. Due to the nature of digital products, we do not
  provide refunds after access is granted, except in special circumstances
  that will be reviewed on a case-by-case basis.
</p>

<h3>5. Data Privacy</h3>
<p>
  We value your privacy. The data we collect includes:
</p>
<ul>
  <li>Account information (name, email)</li>
  <li>Transaction data for bookkeeping purposes</li>
  <li>Service usage data for quality improvement</li>
</ul>
<p>
  We will not sell or share your data with third parties without your
  consent, unless required by law.
</p>

<h3>6. Changes to Terms</h3>
<p>
  MoonUI Design reserves the right to modify these Terms and Conditions at
  any time. Changes will be notified via email or notification on our
  platform.
</p>

<h3>7. Contact</h3>
<p>
  If you have any questions regarding these Terms and Conditions, please
  contact us at
  <a href="mailto:hey@moonui.design" class="terms-link">
    hey@moonui.design
  </a>.
</p>

<div class="terms-notice">
  <p>
    By continuing with registration, you acknowledge that you have read,
    understood, and agreed to our Terms and Conditions and Privacy Policy.
  </p>
</div>
`;

interface TermsOfUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
  isPending?: boolean;
  submitType: 'credentials' | 'google';
  /** HTML content for Terms of Use. If not provided, use default. */
  termsContent?: string;
}

export function TermsOfUseModal({
  open,
  onOpenChange,
  onAgree,
  isPending = false,
  submitType,
  termsContent = DEFAULT_TERMS_CONTENT,
}: TermsOfUseModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setHasScrolledToBottom(false);
      setIsChecked(false);
    }
    onOpenChange(newOpen);
  };

  // Detect scroll to bottom
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Consider reached bottom if remaining scroll is less than 20px
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  // Scroll to bottom manually
  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const canAgree = hasScrolledToBottom && isChecked;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col sm:max-w-[600px]"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms of Use & Privacy Policy</DialogTitle>
          <DialogDescription>
            Please read and agree to the following terms and conditions before continuing with
            registration.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Terms Content with dangerouslySetInnerHTML */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="terms-content h-[300px] overflow-y-auto rounded-lg border bg-gray-50 p-4 text-sm leading-relaxed dark:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: termsContent }}
          />

          {/* Scroll indicator - show if not scrolled to bottom */}
          {!hasScrolledToBottom && (
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex justify-center pb-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="pointer-events-auto animate-bounce shadow-lg"
                onClick={scrollToBottom}
              >
                <ChevronDown className="mr-1 h-4 w-4" />
                Scroll to read
              </Button>
            </div>
          )}
        </div>

        {/* Checkbox Agreement */}
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="terms-agree"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked === true)}
            disabled={!hasScrolledToBottom || isPending}
          />
          <label
            htmlFor="terms-agree"
            className={`cursor-pointer text-sm leading-tight ${
              !hasScrolledToBottom ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            I have read, understood, and agree to the <strong>Terms and Conditions</strong> and{' '}
            <strong>Privacy Policy</strong> of MoonUI Design.
          </label>
        </div>

        {/* Helper text */}
        {!hasScrolledToBottom && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ Please scroll down to read all terms first.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onAgree}
            disabled={!canAgree || isPending}
            className="bg-[#2E2E2E] text-white hover:bg-black"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitType === 'google' ? 'Agree & Continue with Google' : 'Agree & Sign Up'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* CSS for styling terms content */}
      <style jsx global>{`
        .terms-content h3 {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.75rem;
          margin-top: 1rem;
        }
        .terms-content h3:first-child {
          margin-top: 0;
        }
        .terms-content p {
          margin-bottom: 1rem;
        }
        .terms-content ul {
          list-style-type: disc;
          list-style-position: inside;
          margin-bottom: 1rem;
        }
        .terms-content li {
          margin-bottom: 0.25rem;
        }
        .terms-content .terms-link {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .terms-content .terms-notice {
          background-color: rgb(239 246 255);
          border: 1px solid rgb(191 219 254);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        .terms-content .terms-notice p {
          color: rgb(30 64 175);
          font-weight: 500;
          margin-bottom: 0;
        }
        .dark .terms-content .terms-notice {
          background-color: rgba(30, 58, 138, 0.2);
          border-color: rgb(30 64 175);
        }
        .dark .terms-content .terms-notice p {
          color: rgb(147 197 253);
        }
      `}</style>
    </Dialog>
  );
}
