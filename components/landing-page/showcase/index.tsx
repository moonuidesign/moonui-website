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
    <div className="lg:w-7xl h-fit mx-auto container md:bg-[#E8E8E8] flex justify-center py-10 md:py-20 relative font-sans md:px-0 px-1">
      {/* Decorative Lines */}
      <div className="absolute top-[156px] left-0 w-64 border-t border-neutral-300 hidden xl:block">
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 left-0 rounded-full bg-[#D3D3D3]" />
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 right-0 rounded-full bg-[#D3D3D3]" />
      </div>
      <div className="absolute top-[156px] right-0 w-64 border-t border-neutral-300 hidden xl:block">
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 left-0 rounded-full bg-[#D3D3D3]" />
        <span className="h-1.5 w-1.5 absolute top-1/2 -translate-y-1/2 right-0 rounded-full bg-[#D3D3D3]" />
      </div>

      <div className="w-full h-fit lg:w-7xl md:max-w-7xl relative z-0 flex flex-col gap-10 md:gap-16">
        {/* Header Section */}
        <div className="flex flex-col items-start md:items-center gap-5 px-6 md:px-4 text-left md:text-center">
          <ComponentBadge />
          <div className="max-w-[768px] flex flex-col items-start md:items-center gap-4">
            <h1 className="text-[#3D3D3D] font-['Plus_Jakarta_Sans'] text-2xl md:text-5xl font-semibold leading-9 md:leading-[56px] tracking-tight">
              Elevate your design with <br className="hidden md:block" />
              premium components <br className="md:hidden" /> & blocks
            </h1>
            <p className="mt-3 text-pretty text-ln-paragraph-md text-[#707070] md:text-center xl:mt-5 xl:text-ln-paragraph-lg">
              <span className="font-medium text-[#3D3D3D]">Customizable</span>{' '}
              components that seamlessly{' '}
              <span className="font-medium text-[#3D3D3D]">adapt</span> to your
              project needs
            </p>
            <a
              href="#"
              className="text-zinc-900 text-base font-medium hover:underline mt-2 md:mt-1 flex items-center gap-1"
            >
              Browse all components <span className="text-lg">→</span>
            </a>
          </div>
        </div>

        {/* Container Grid & Gradient */}
        <div className="relative w-full h-fit md:rounded-b-4xl z-20  md:border-x md:border-b md:border-[#D8D8D8] ">
          <div className=" hidden md:block w-full z-[10] h-full absolute pointer-events-none">
            <span className="h-1.5 w-1.5 absolute top-0  -left-[3px] rounded-full bg-[#D3D3D3]" />
            <span className="h-1.5 w-1.5 absolute top-0  -right-[3px] rounded-full bg-[#D3D3D3]" />
          </div>

          <div className="grid grid-cols-1 md:w-max-2xl w-full md:w-2xl lg:w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:gap-y-10 px-6 lg:px-4 pb-10 lg:pb-20">
            {items.slice(0, 8).map((item, index) => (
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

          <div className="absolute bottom-8 left-0 right-0 w-full z-[20] pointer-events-none h-[300px] lg:h-[40%] bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8]/90 via-30% to-transparent backdrop-blur-[1px]"></div>

          <div className="absolute bottom-10 md:bottom-24 z-[30] left-0 right-0 flex justify-center px-4 pointer-events-none">
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
