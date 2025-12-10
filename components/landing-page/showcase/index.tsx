import { ComponentBadge } from './badge-component';
import { GradientBlurOverlay } from './component-blur-overlay';
import { FloatingButton } from './floating-button';
import { ShowcaseCard } from './show-case-card';
const COMPONENT_DATA = [
  {
    id: 1,
    title: 'Auth Card',
    blocks: '8 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 2,
    title: 'Checkbox',
    blocks: '5 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 3,
    title: 'Command Menu',
    blocks: '3 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 4,
    title: 'Dropdown',
    blocks: '5 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 5,
    title: 'File Upload',
    blocks: '2 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 6,
    title: 'Modal',
    blocks: '7 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 7,
    title: 'Profile Card',
    blocks: '4 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 8,
    title: 'Radio',
    blocks: '4 Blocks',
    image: 'https://placehold.co/270x220',
  },
  // Extra items to simulate the overflow look at the bottom
  {
    id: 9,
    title: 'Table',
    blocks: '12 Blocks',
    image: 'https://placehold.co/270x220',
  },
  {
    id: 10,
    title: 'Input',
    blocks: '4 Blocks',
    image: 'https://placehold.co/270x220',
  },
];
const ComponentShowcase = () => {
  return (
    <div className=" lg:w-7xl min-h-screen mx-auto container md:bg-[#E8E8E8] flex justify-center py-10 md:py-20 overflow-hidden relative font-sans md:px-0 px-1">
      {/* Decorative Lines */}
      <div className="absolute top-[156px] left-0 w-64 border-t border-neutral-300 hidden xl:block" />
      <div className="absolute top-[156px] right-0 w-64 border-t border-neutral-300 hidden xl:block" />

      <div className="w-full lg:w-7xl md:max-w-7xl relative z-0 flex flex-col gap-10 md:gap-16">
        {/* --- HEADER --- */}
        <div className="flex flex-col items-start md:items-center gap-5 px-6 md:px-4 text-left md:text-center">
          <ComponentBadge />

          <div className="max-w-[768px] flex flex-col items-start md:items-center gap-4">
            <h1 className="text-zinc-800 text-2xl md:text-5xl font-semibold leading-9 md:leading-[56px] tracking-tight">
              Elevate your design with <br className="hidden md:block" />
              premium components <br className="md:hidden" /> & blocks
            </h1>

            <p className="text-base leading-6 md:leading-7 max-w-xl text-left md:text-center">
              <span className="text-neutral-700 font-medium">Customizable</span>
              <span className="text-neutral-500">
                {' '}
                components that seamlessly{' '}
              </span>
              <br className="md:hidden" />
              <span className="text-neutral-700 font-medium">adapt</span>
              <span className="text-neutral-500"> to your project needs</span>
            </p>

            <a
              href="#"
              className="text-zinc-900 text-base font-medium hover:underline mt-2 md:mt-1 flex items-center gap-1"
            >
              Browse all components <span className="text-lg">→</span>
            </a>
          </div>
        </div>

        {/* --- GRID SECTION --- */}
        <div className="relative w-full md:rounded-b-4xl md:border-x md:border-b md:border-[#D8D8D8] md:overflow-hidden">
          <div className="grid grid-cols-1 md:w-max-6xl lg:w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-y-10 px-6 md:px-4 pb-32 md:pb-20">
            {/* LOGIC SLICE MOBILE (0-2 Index) */}
            {COMPONENT_DATA.slice(0, 8).map((item, index) => (
              <div
                key={item.id}
                className={
                  index > 1
                    ? 'hidden md:block'
                    : index > 10
                    ? 'hidden md:block'
                    : 'block'
                }
              >
                <ShowcaseCard
                  title={item.title}
                  blocks={item.blocks}
                  image={item.image}
                />
              </div>
            ))}
          </div>

          <GradientBlurOverlay />

          <div className="absolute bottom-10 md:bottom-24 z-[20] left-0 right-0 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto">
              <FloatingButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;
