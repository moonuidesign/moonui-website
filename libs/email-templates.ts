export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moonui.design';
export const LOGO_URL = `https://moonui.design/logo.svg`;
export const BG_COLOR = '#f6f6f6';

export const generateFooterHtml = () => `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
      We are MoonUI Studio and we bring free and premium design resources of the highest quality to the professional community.
    </p>

    <!-- Footer Links Grid -->
    <!-- Footer Links Grid -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 30px; border-collapse: separate; border-spacing: 0;">
      <tr>
        <!-- Products -->
        <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
          <h4 style="color: #111827; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Products</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/assets?type=templates" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">MoonUI Templates</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/assets?type=components" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">MoonUI Components</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/assets?type=components" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">MoonUI Assets</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/assets?type=gradients" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">MoonUI Gradients</a>
            </li>
          </ul>
        </td>
        
        <!-- Premium -->
        <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
          <h4 style="color: #111827; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Premium</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/pricing" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Upgrade Pro</a>
            </li>
            <li style="margin-bottom: 8px;">
             <a href="https://moonui.design/pricing" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Upgrade Pro Plus</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/contact" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Contact Support</a>
            </li>
          </ul>
        </td>

        <!-- MoonUI Design -->
        <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
          <h4 style="color: #111827; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">MoonUI Design</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/assets" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Explore Now</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/about" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Become an Affiliate</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/about" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">About Us</a>
            </li>
          </ul>
        </td>
      </tr>
      
      <!-- Second Row -->
      <tr>
        <!-- Account -->
        <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
          <h4 style="color: #111827; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Account</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/verify-license" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Active License</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/signin" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Sign In</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/forgot-password" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Reset Password</a>
            </li>
          </ul>
        </td>

        <!-- Company -->
        <td style="vertical-align: top; padding-bottom: 20px; width: 33%;">
          <h4 style="color: #111827; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Company</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/privacy-policy" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Privacy Policy</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/terms-of-use" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Terms of Use</a>
            </li>
            <li style="margin-bottom: 8px;">
              <a href="https://moonui.design/contact" target="_blank" style="display: block; padding: 2px 0; color: #111827; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer;">Contact Us</a>
            </li>
          </ul>
        </td>
        <td style="width: 33%;"></td>
      </tr>
    </table>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 30px;">
      <p style="color: #374151; font-family: 'Inter', sans-serif; font-size: 13px; margin: 0 0 15px 0;">
        Copyright © ${new Date().getFullYear()} MoonUI Design, All rights reserved.
      </p>
      
      <!-- Social Icons -->
      <div>
        <a href="https://x.com/moonuidesign" target="_blank" style="text-decoration: none; margin-right: 15px;">
           <img src="https://moonui.design/x.svg" alt="X" style="width: 20px; height: 20px; opacity: 0.8; vertical-align: middle;">
        </a>
        <a href="https://instagram.com/moonuidesign" target="_blank" style="text-decoration: none; margin-right: 15px;">
           <img src="https://moonui.design/instagram.svg" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.8; vertical-align: middle;">
        </a>
        <a href="https://linkedin.com/company/moonuidesign" target="_blank" style="text-decoration: none;">
           <img src="https://moonui.design/linkedin.svg" alt="LinkedIn" style="width: 20px; height: 20px; opacity: 0.8; vertical-align: middle;">
        </a>
      </div>
    </div>
  </div>
`;

export const generateOTPEmailHtml = (
  title: string,
  otp: string,
  buttonText: string,
  buttonUrl: string = '#',
) => `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
  
  <!-- Top Header -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 40px;">
    <tr>
      <td style="text-align: left;">
        <img src="${LOGO_URL}" alt="MoonUI Logo" style="width: 120px; height: auto;">
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span style="color: #111827; font-size: 14px; font-weight: 600;">MoonUI Studio</span>
        <div style="color: #6b7280; font-size: 12px;">Login with magic link</div>
      </td>
    </tr>
  </table>

  <!-- Main Card -->
  <div style="background-color: #f9fafb; border-radius: 12px; padding: 40px; text-align: left; border: 1px solid #e5e7eb;">
    
    <!-- Icon -->
    <div style="margin-bottom: 20px;">
       <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; border: 1px solid #e5e7eb; background: white;">
         <span style="font-size: 24px;">***</span>
       </div>
    </div>

    <!-- Title -->
    <h1 style="color: #111827; font-size: 20px; font-weight: bold; margin: 0 0 10px 0;">${title}</h1>
    
    <p style="color: #374151; font-size: 14px; margin: 0 0 25px 0;">
      Click the button below to ${buttonText.toLowerCase()}.
    </p>

    <!-- Button -->
    <div style="margin-bottom: 30px;">
      <a href="${buttonUrl}" style="display: block; width: 100%; background-color: #1f2937; color: white; text-decoration: none; padding: 14px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;">
        Click to ${buttonText.toLowerCase()}
      </a>
    </div>

    <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">
      Or copy and paste the following code:
    </p>

    <!-- OTP Code -->
    <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 30px;">
      <span style="font-family: monospace; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: 8px;">
        ${otp}
      </span>
    </div>

    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      If you didn't try to ${buttonText.toLowerCase()}, ignore this email.
    </p>

  </div>

  ${generateFooterHtml()}

</div>
`;

export const generateGeneralEmailHtml = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 20px;">
      <div style="color: #333; line-height: 1.6;">${content}</div>
      ${generateFooterHtml()}
    </div>
  </div>
`;

export const generateDiscountEmailHtml = (data: any) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BG_COLOR}; padding: 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 20px;">
      <h1 style="color: #111827; text-align: center;">${data.title}</h1>
      <p style="text-align: center; font-size: 24px; font-weight: bold;">${data.discountAmount}</p>
      <p style="text-align: center;">${data.description}</p>
       <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
         <span style="font-weight: bold; font-size: 20px; letter-spacing: 2px;">${data.code}</span>
       </div>
       <div style="text-align: center;">
         <a href="${data.ctaLink}" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Claim Offer</a>
       </div>
      ${generateFooterHtml()}
    </div>
  </div>
`;

export const generateAssetCardHtml = (
  item: {
    title: string;
    imageUrl: string;
    tier?: string;
    badge?: string;
    url?: string;
    type?: string;
    author?: string;
  },
  isMain: boolean = false,
) => {
  const isTemplate = item.type === 'templates';
  // Aspect Ratios: Templates (360/480 -> 133.33%), Others (360/260 -> 72.22%)
  const paddingBottom = isTemplate ? '133.33%' : '72.22%';
  const objectPosition = isTemplate ? 'top' : 'center';

  return `
    <a href="${item.url || '#'}" target="_blank" style="
      background-color: white; 
      border: 1px solid #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
      width: 100%; 
      font-family: 'Inter', sans-serif;
    ">
      
      <!-- Image Container -->
      <div style="
          position: relative; 
          width: 100%; 
          padding-bottom: ${paddingBottom}; 
          height: 0; 
          overflow: hidden; 
          background-color: #f3f4f6;
          border-radius: 8px; 
        ">
        <a href="${item.url || '#'}" target="_blank" style="display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-decoration: none; z-index: 10;">
           ${
             item.imageUrl
               ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${objectPosition}; border: 0;" />`
               : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">No Preview</div>`
           }
        </a>
      </div>
      
      <!-- Meta Info -->
      <div style="padding: 12px 8px;">
        
        <!-- Top Row: Title, Badge, Tier -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
             <!-- Title -->
             <a href="${item.url || '#'}" target="_blank" style="
                font-family: 'Inter', sans-serif; 
                color: #3D3D3D; 
                font-size: 14px; 
                font-weight: 500; 
                line-height: 24px; 
                text-decoration: none; 
                white-space: nowrap; 
                overflow: hidden; 
                text-overflow: ellipsis;
                display: block;
                max-width: 100px; /* Force ellipsis in table context */
             ">
               ${item.title}
             </a>
             
             <!-- Badge -->
             ${
               item.badge
                 ? `<div style="
                      background-color: #ea580c; 
                      color: white; 
                      font-size: 10px; 
                      font-weight: 600; 
                      line-height: 10px;
                      padding: 4px 6px; 
                      border-radius: 6px; 
                      white-space: nowrap;
                      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    ">${item.badge}</div>`
                 : ''
             }
          </div>

          <!-- Tier -->
          <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
             ${item.tier && item.tier !== 'free' ? `<img src="https://moonui.design/ic-diamond-small.svg" width="14" height="14" alt="Pro" style="display: block;" />` : ''}
             <span style="
               font-family: 'Inter', sans-serif; 
               color: #3D3D3D; 
               font-size: 14px; 
               font-weight: 600;
               line-height: 24px;
             ">
               ${item.tier === 'pro_plus' ? 'Pro Plus' : item.tier === 'pro' ? 'Pro' : 'Free'}
             </span>
          </div>

        </div>
        
        <!-- Author -->
        ${
          item.author
            ? `<div style="font-family: 'Inter', sans-serif; color: #71717a; font-size: 12px; font-weight: 400; margin-top: 2px;">by ${item.author}</div>`
            : ''
        }
      </div>
    </a>
  `;
};

export const generateAssetReleaseEmailHtml = (data: any) => {
  const mainAssetCard = generateAssetCardHtml(
    {
      title: data.assetName,
      imageUrl: data.imageUrl,
      tier: 'pro',
      badge: data.badgeText || 'New',
      url: `https://moonui.design/${data.assetType}/${data.assetId}`,
      type: data.assetType,
    },
    true,
  );

  let relatedAssetsSection = '';
  if (data.relatedAssets && data.relatedAssets.length > 0) {
    const totalCols = 3; // 12 grid / 4 col-span = 3 columns
    const cards = Array.from({ length: totalCols })
      .map((_, index) => {
        const asset = data.relatedAssets[index];

        if (asset) {
          return `
          <!-- Column: 4/12 (33.33%) -->
          <td style="width: 33.33%; padding: 0 8px; vertical-align: top; box-sizing: border-box;">
             ${generateAssetCardHtml({
               title: asset.title,
               imageUrl: asset.imageUrl,
               tier: asset.tier,
               url: `https://moonui.design/${asset.type === 'undefined' ? data.assetType : asset.type || 'assets'}/${asset.id}`,
               type: asset.type || data.assetType,
               author: asset.author,
             })}
          </td>
        `;
        } else {
          // Empty column to maintain grid structure
          return `
          <td style="width: 33.33%; padding: 0 8px; vertical-align: top; box-sizing: border-box;"></td>
        `;
        }
      })
      .join('');

    relatedAssetsSection = `
      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 30px;">
        <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px;">
          More like this
        </h3>
        
        <!-- Grid System: 12 Cols -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed; border-collapse: separate; border-spacing: 0;">
          <tr>
            ${cards}
          </tr>
        </table>
      </div>
    `;
  }

  return `
  <!-- Load Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="${LOGO_URL}" alt="MoonUI Logo" style="width: 40px; height: auto; margin-bottom: 20px;">
      <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; color: #111827; font-size: 24px; font-weight: bold; margin: 0;">New Release</h1>
      <p style="color: #6b7280; font-size: 16px; margin-top: 8px;">Check out our latest addition to the library.</p>
    </div>

    <!-- Main Asset -->
    ${mainAssetCard}

    <!-- Description -->
    <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px; margin-top: 30px;">
      ${data.description.replace(/\n/g, '<br/>')}
    </div>

    ${relatedAssetsSection}

    ${generateFooterHtml()}
  </div>
`;
};
