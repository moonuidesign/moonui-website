import Image from 'next/image';

export const AvatarGroup = () => (
  // Gunakan '-space-x-2' untuk membuat avatar saling menumpuk secara otomatis
  <div className="flex -space-x-2 justify-start items-center">
    {[1, 2, 3, 4].map((_, i) => (
      <Image
        key={i}
        // Class sesuai request: size, rounded, dan ring
        className="size-7 md:size-6 rounded-full object-cover bg-[#A7CDAE]"
        width={24}
        height={24}
        src={`/user-${i + 1}.webp.png`} // Pastikan path gambar sesuai
        alt="User avatar"
      />
    ))}
  </div>
);
