export const IsolatedRenderer = ({
  htmlCode,
  scale = 1,
}: {
  htmlCode: string;
  scale?: number;
}) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
          #root { transform-origin: center center; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        </style>
      </head>
      <body>
        <div id="root" style="transform: scale(${scale})">
          ${htmlCode}
        </div>
      </body>
    </html>
  `;
  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
