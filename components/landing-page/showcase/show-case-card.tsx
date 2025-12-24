import Image from 'next/image';

export const ShowcaseCard = ({
  title,
  blocks,
  image,
}: {
  title: string;
  blocks: string;
  image: string;
}) => (
  <div className="flex flex-col items-center md:items-center group cursor-pointer transition-transform duration-300 hover:-translate-y-1">
    {/* Aspect Ratio pada mobile bisa dibuat sedikit lebih tinggi jika perlu, tapi square/landscape standar oke */}
    <div className="w-full aspect-[4/3] md:aspect-[270/220] rounded-xl md:rounded-2xl overflow-hidden shadow-sm mb-3 md:mb-4 bg-gray-200 relative">
      {image ? (
        <Image
          width={300}
          height={300}
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
          <span className="text-sm">No image</span>
        </div>
      )}
    </div>
    {/* Text align center pada desktop, mobile bisa center atau left tergantung selera. Di sini saya buat center konsisten */}
    <div className="text-center w-full">
      <h3 className="text-[#3D3D3D] text-sm md:text-base font-medium font-sans leading-5 md:leading-6">
        {title}
      </h3>
      <p className="text-zinc-400 text-sm font-normal font-sans leading-5 mt-1">
        {blocks}
      </p>
    </div>
  </div>
);
