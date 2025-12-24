'use client';

import React, { useState } from 'react';

export default function ContactSection() {
  const [charCount, setCharCount] = useState(0);

  const handleMailto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const fullname = formData.get('fullname');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const product = formData.get('product');

    const emailTujuan = 'hey@moonui.design';
    const mailSubject = encodeURIComponent(`[Contact Form] ${subject}`);
    const mailBody = encodeURIComponent(
      `Full Name: ${fullname}\n` +
      `Email: ${email}\n` +
      `Product: ${product}\n\n` +
      `Message:\n${message}`,
    );

    window.location.href = `mailto:${emailTujuan}?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-start pt-11 md:items-center md:pt-16 md:text-center font-sans">
        {/* Branding Icon Badge */}
        <div className="hidden size-10 items-center justify-center rounded-[13px] bg-[#3d3d3d] shadow-[0_0_0_1px_rgba(41,41,41,0.08)] md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
            className="size-[18px]"
          >
            <path
              fill="url(#contact_svg__a)"
              d="M16 10.125h.125V9a7.125 7.125 0 0 0-14.25 0v1.125H3A2.875 2.875 0 0 1 5.875 13v2a2.875 2.875 0 1 1-5.75 0V9A8.875 8.875 0 0 1 9 .125h.875v.042l.111.012A8.876 8.876 0 0 1 17.875 9v6a2.875 2.875 0 1 1-5.75 0v-2A2.875 2.875 0 0 1 15 10.125z"
            ></path>
            <path
              fill="#fff"
              fillOpacity="0.16"
              d="M16 10.125h.125V9a7.125 7.125 0 0 0-14.25 0v1.125H3A2.875 2.875 0 0 1 5.875 13v2a2.875 2.875 0 1 1-5.75 0V9A8.875 8.875 0 0 1 9 .125h.875v.042l.111.012A8.876 8.876 0 0 1 17.875 9v6a2.875 2.875 0 1 1-5.75 0v-2A2.875 2.875 0 0 1 15 10.125z"
            ></path>
            <defs>
              <linearGradient
                id="contact_svg__a"
                x1="2.721"
                x2="16.082"
                y1="0.025"
                y2="7.598"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#fff" stopOpacity="0.96"></stop>
                <stop offset="1" stopColor="#fff" stopOpacity="0.72"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-[16px] leading-[24px] tracking-[-0.01em] font-medium text-[rgb(143,143,143)] md:hidden">
          Contact with us
        </div>

        <h1 className="mt-2 text-[34px] leading-[40px] font-[550] tracking-[-0.022em] text-[rgb(46,46,46)] md:mt-6 xl:text-[40px] xl:leading-[48px] xl:tracking-[-0.028em]">
          Let&apos;s talk, we&apos;re here.
        </h1>

        <p className="mt-3 text-pretty text-[16px] leading-[24px] tracking-[-0.01em] font-normal text-[rgb(112,112,112)] xl:mt-2">
          We&apos;re here to help, so contact us with any questions or feedback.
          <br className="hidden md:inline" />
          <span className="md:hidden"> → </span>
          <a
            href="mailto:hey@moonui.design"
            className="font-medium text-[#5c5c5c]"
          >
            hey@moonui.design
          </a>
        </p>
      </div>

      <div className="mx-2 md:mx-0 ">
        <div className="w-full max-w-[440px] rounded-3xl bg-white p-6 shadow-[0_1px_1px_0.5px_rgba(41,41,41,0.04),0_3px_3px_-1.5px_rgba(41,41,41,0.02),0_6px_6px_-3px_rgba(41,41,41,0.04),0_12px_12px_-6px_rgba(41,41,41,0.04),0_24px_24px_-12px_rgba(41,41,41,0.04),0_48px_48px_-24px_rgba(41,41,41,0.04),0_0_0_1px_rgba(41,41,41,0.04),inset_0_-1px_1px_-0.5px_rgba(51,51,51,0.06)] xl:rounded-[28px] mx-auto mt-11 md:mt-12">
          <div className="text-[18px] font-bold text-[rgb(46,46,46)]">
            Contact Form
          </div>
          <p className="mt-1 text-[16px] leading-[24px] text-[#5c5c5c] xl:text-[14px]">
            Contact us to report issues, give feedback, and more.
          </p>

          <div
            className="h-1 w-full my-6 opacity-30"
            style={{
              background:
                'linear-gradient(90deg, #d1d1d1 4px, transparent 4px) 50% 50% / 8px 1px repeat-x',
            }}
            role="separator"
          ></div>

          <form onSubmit={handleMailto} className="block">
            <div className="flex flex-col gap-3">
              {/* Full Name */}
              <div className="flex w-full flex-col gap-1">
                <label
                  htmlFor="fullname"
                  className="text-[12px] font-semibold text-[#3d3d3d]"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 16"
                    className="pointer-events-none absolute left-[9px] top-1/2 size-[18px] -translate-y-1/2 text-[#a3a3a3] group-focus-within:text-[#ff4f00]"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334m2-8a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-2 6.667a5.32 5.32 0 0 1-3.81-1.601C5.08 10.67 6.404 10 8 10s2.922.67 3.81 1.733a5.32 5.32 0 0 1-3.81 1.6Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <input
                    name="fullname"
                    id="fullname"
                    required
                    className="h-9 w-full rounded-[9px] bg-white px-2.5 py-2 pl-[35px] text-[14px] text-[rgb(46,46,46)] shadow-[0_3px_6px_-1.5px_rgba(51,51,51,.06)] ring-1 ring-[#eeeeee] outline-none transition-all focus:ring-[#ff4f00] hover:bg-[#fcfcfc] placeholder:text-[#a3a3a3]"
                    placeholder="Enter your name..."
                    type="text"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex w-full flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-[12px] font-semibold text-[#3d3d3d]"
                >
                  Email
                </label>
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="pointer-events-none absolute left-[9px] top-1/2 size-[18px] -translate-y-1/2 text-[#a3a3a3] group-focus-within:text-[#ff4f00]"
                  >
                    <path
                      fill="currentColor"
                      d="M1.502 5.162A2.25 2.25 0 0 1 3.75 3h10.5a2.25 2.25 0 0 1 2.25 2.162L9.336 8.744a.75.75 0 0 1-.671 0z"
                    ></path>
                    <path
                      fill="currentColor"
                      d="M1.5 6.839v5.911A2.25 2.25 0 0 0 3.75 15h10.5a2.25 2.25 0 0 0 2.25-2.25V6.838l-6.494 3.247a2.25 2.25 0 0 1-2.012 0z"
                    ></path>
                  </svg>
                  <input
                    name="email"
                    id="email"
                    required
                    className="h-9 w-full rounded-[9px] bg-white px-2.5 py-2 pl-[35px] text-[14px] text-[rgb(46,46,46)] shadow-[0_3px_6px_-1.5px_rgba(51,51,51,.06)] ring-1 ring-[#eeeeee] outline-none transition-all focus:ring-[#ff4f00] hover:bg-[#fcfcfc]"
                    placeholder="Enter your email address..."
                    type="email"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex w-full flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#3d3d3d]">
                  Subject
                </label>
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="pointer-events-none absolute left-[9px] top-1/2 size-[18px] -translate-y-1/2 text-[#a3a3a3] group-focus-within:text-[#ff4f00]"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M6.121 1.5c-.395 0-.736 0-1.017.023a2.3 2.3 0 0 0-.875.222 2.25 2.25 0 0 0-.984.984 2.3 2.3 0 0 0-.222.875C3 3.884 3 4.226 3 4.62v9.58c0 .348 0 .66.023.908.022.247.075.573.29.85a1.5 1.5 0 0 0 1.131.583c.35.013.647-.134.86-.258.216-.126.47-.307.753-.51l2.681-1.915a5 5 0 0 1 .257-.178L9 13.678l.005.003c.053.033.123.082.257.178l2.681 1.915c.284.203.538.384.753.51.213.124.51.27.86.258a1.5 1.5 0 0 0 1.132-.583c.213-.277.267-.603.29-.85.022-.248.022-.56.022-.908v-9.58c0-.395 0-.736-.023-1.017a2.3 2.3 0 0 0-.222-.875 2.25 2.25 0 0 0-.984-.984 2.3 2.3 0 0 0-.875-.222c-.28-.023-.622-.023-1.017-.023zM9 4.5a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 1 1-1.5 0v-1.5h-1.5a.75.75 0 1 1 0-1.5h1.5v-1.5A.75.75 0 0 1 9 4.5"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <select
                    name="subject"
                    required
                    className="h-9 w-full appearance-none rounded-[9px] bg-white px-2.5 py-2 pl-[35px] pr-10 text-[14px] text-[rgb(46,46,46)] shadow-[0_3px_6px_-1.5px_rgba(51,51,51,.06)] ring-1 ring-[#eeeeee] outline-none transition-all focus:ring-[#ff4f00] hover:bg-[#fcfcfc]"
                  >
                    <option value="">Select a subject...</option>
                    <option value="Feedback">Give Feedback</option>
                    <option value="Issue">Report an Issue/Bug</option>
                    <option value="Feature">Request a Feature</option>
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(143,143,143)]">
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex w-full flex-col gap-1">
                <label
                  htmlFor="message"
                  className="text-[12px] font-semibold text-[#3d3d3d]"
                >
                  Message
                </label>
                <div className="group/textarea relative flex w-full flex-col rounded-[11px] bg-white pb-3 shadow-[0_3px_6px_-1.5px_rgba(51,51,51,.06)] ring-1 ring-[#eeeeee] transition duration-200 focus-within:ring-[#ff4f00]">
                  <textarea
                    name="message"
                    id="message"
                    required
                    maxLength={200}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    className="block w-full resize-none text-[14px] text-[rgb(46,46,46)] h-full min-h-[76px] bg-transparent p-3 outline-none"
                    placeholder="Enter your message..."
                  ></textarea>
                  <div className="pointer-events-none flex items-center justify-end gap-1.5 px-3">
                    <span className="text-[11px] tracking-[0.02em] text-[#d1d1d1]">
                      {charCount}/200
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M9.11111 2L2 9.11111M10 6.44444L6.44444 10"
                        stroke="#d1d1d1"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div className="flex w-full flex-col gap-1">
                <label
                  htmlFor="product"
                  className="text-[12px] font-semibold text-[#3d3d3d]"
                >
                  Product Name
                </label>
                <input
                  name="product"
                  id="product"
                  className="h-9 w-full rounded-[9px] bg-white px-2.5 py-2 text-[14px] text-[rgb(46,46,46)] shadow-[0_3px_6px_-1.5px_rgba(51,51,51,.06)] ring-1 ring-[#eeeeee] outline-none transition-all focus:ring-[#ff4f00]"
                  placeholder="Which product is this about?"
                  type="text"
                />
              </div>

              {/* Submit Button */}
              <button
                className="mt-3 flex h-10 items-center justify-center rounded-[11px] bg-[rgb(46,46,46)] px-3.5 text-[13px] font-bold text-white shadow-md hover:bg-[#3d3d3d] active:scale-95 transition duration-200"
                type="submit"
              >
                Submit Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
