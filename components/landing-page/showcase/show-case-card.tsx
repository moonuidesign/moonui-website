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
  <div className="group flex cursor-pointer flex-col items-center transition-transform duration-300 hover:-translate-y-1 md:items-center">
    {/* Aspect Ratio pada mobile bisa dibuat sedikit lebih tinggi jika perlu, tapi square/landscape standar oke */}
    <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm md:mb-4 md:aspect-[270/220] md:rounded-2xl">
      {image && typeof image === 'string' && image.length > 0 ? (
        <Image
          width={300}
          height={300}
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
          <span className="text-sm">No image</span>
        </div>
      )}
    </div>
    {/* Text align center pada desktop, mobile bisa center atau left tergantung selera. Di sini saya buat center konsisten */}
    <div className="w-full text-center">
      <h3 className="font-sans text-sm leading-5 font-medium text-[#3D3D3D] md:text-base md:leading-6">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm leading-5 font-normal text-zinc-400">{blocks}</p>
    </div>
  </div>
);
