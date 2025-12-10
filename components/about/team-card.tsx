import { LinkedinIcon, TwitterIcon } from 'lucide-react';
import Image from 'next/image';

export interface TeamMemberProps {
  name: string;
  role: string;
  imageSrc: string;
}

export const TeamCard: React.FC<TeamMemberProps> = ({
  name,
  role,
  imageSrc,
}) => (
  <div className="flex-1 min-w-[240px] p-7 bg-white rounded-[20px] shadow-[inset_0px_0px_0px_1px_rgba(224,224,224,1.00)] flex flex-col gap-7 hover:shadow-lg transition-shadow duration-300">
    <div className="relative w-14 h-14 rounded-full overflow-hidden mix-blend-luminosity">
      <Image src={imageSrc} alt={name} fill className="object-cover" />
    </div>
    <div className="flex flex-col gap-1">
      <div className="text-zinc-800 text-lg font-medium leading-7">{name}</div>
      <div className="text-zinc-500 text-base font-medium leading-6">
        {role}
      </div>
    </div>
    <div className="flex gap-2">
      <button className="w-8 h-8 bg-white rounded-lg shadow-sm border border-zinc-100 flex justify-center items-center hover:bg-zinc-50 transition-colors">
        <TwitterIcon />
      </button>
      <button className="w-8 h-8 bg-white rounded-lg shadow-sm border border-zinc-100 flex justify-center items-center hover:bg-zinc-50 transition-colors">
        <LinkedinIcon />
      </button>
    </div>
  </div>
);
