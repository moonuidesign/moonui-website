import { ComponentBadge } from './badge-component';
import { FloatingButton } from './floating-button';
import { ShowcaseCard } from './show-case-card';

// ... (DATA COMPONENT_DATA TETAP SAMA) ...
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

interface ShowcaseItem {
  id: string | number;
  title: string;
  blocks: string;
  image: string;
}

interface ComponentShowcaseProps {
  data?: ShowcaseItem[];
}

const ComponentShowcase = ({ data }: ComponentShowcaseProps) => {
  const items = data && data.length > 0 ? data : COMPONENT_DATA;

  return (
    <div className="relative container mx-auto flex h-fit justify-center px-1 py-10 font-sans md:bg-[#E8E8E8] md:px-0 md:py-20 lg:w-7xl">
      {/* Decorative Lines */}
      <div className="absolute top-[156px] left-0 hidden w-64 border-t border-neutral-300 xl:block">
        <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
      </div>
      <div className="absolute top-[156px] right-0 hidden w-64 border-t border-neutral-300 xl:block">
        <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#D3D3D3]" />
      </div>

      <div className="relative z-0 flex h-fit w-full flex-col gap-10 md:max-w-7xl md:gap-16 lg:w-7xl">
        {/* Header Section */}
        <div className="flex flex-col items-start gap-5 px-6 text-left md:items-center md:px-4 md:text-center">
          <ComponentBadge />
          <div className="flex max-w-[768px] flex-col items-start gap-4 md:items-center">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl leading-9 font-semibold tracking-tight text-[#3D3D3D] md:text-5xl md:leading-[56px]">
              Elevate your design with <br className="hidden md:block" />
              premium components <br className="md:hidden" /> & blocks
            </h1>
            <p className="text-ln-paragraph-md xl:text-ln-paragraph-lg mt-3 text-pretty text-[#707070] md:text-center xl:mt-5">
              <span className="font-medium text-[#3D3D3D]">Customizable</span> components that
              seamlessly <span className="font-medium text-[#3D3D3D]">adapt</span> to your project
              needs
            </p>
            <a
              href="#"
              className="mt-2 flex items-center gap-1 text-base font-medium text-zinc-900 hover:underline md:mt-1"
            >
              Browse all components <span className="text-lg">→</span>
            </a>
          </div>
        </div>

        {/* Container Grid & Gradient */}
        <div className="relative z-20 h-fit w-full md:rounded-b-4xl md:border-x md:border-b md:border-[#D8D8D8]">
          <div className="pointer-events-none absolute z-[10] hidden h-full w-full md:block">
            <span className="absolute top-0 -left-[3px] h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />
            <span className="absolute top-0 -right-[3.5px] h-1.5 w-1.5 rounded-full bg-[#D3D3D3]" />
          </div>

          <div className="md:w-max-2xl mx-auto grid w-full grid-cols-1 gap-x-6 gap-y-8 px-6 pb-10 sm:grid-cols-2 md:w-2xl lg:w-6xl lg:grid-cols-4 lg:gap-y-10 lg:px-4 lg:pb-20">
            {items.slice(0, 8).map((item, index) => (
              <div
                key={item.id}
                className={index > 1 ? 'hidden md:block' : index > 10 ? 'hidden md:block' : 'block'}
              >
                <ShowcaseCard title={item.title} blocks={item.blocks} image={item.image} />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute right-0 bottom-8 left-0 z-[20] h-[300px] w-full bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8]/90 via-30% to-transparent backdrop-blur-[1px] lg:h-[40%]"></div>

          <div className="pointer-events-none absolute right-0 bottom-10 left-0 z-[30] flex justify-center px-4 md:bottom-24">
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
