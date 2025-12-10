import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';

// --- Types ---
export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

// --- Card Component ---
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`absolute top-1/2 left-1/2 rounded-xl border border-white/20 bg-black shadow-2xl [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] cursor-pointer transition-colors hover:border-white/60 ${
        customClass ?? ''
      } ${rest.className ?? ''}`.trim()}
    />
  ),
);
Card.displayName = 'Card';

// --- Logic Helper ---
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

// Menghitung posisi berdasarkan urutan (index 0 = paling depan)
const makeSlot = (
  i: number,
  distX: number,
  distY: number,
  total: number,
): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5, // Semakin belakang semakin jauh z-nya
  zIndex: total - i, // Index 0 punya z-index tertinggi
});

// Helper untuk set posisi instan (tanpa animasi)
const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

// --- Main Component ---
const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 4000,
  pauseOnHover = true,
  onCardClick,
  skewAmount = 0,
  children,
}) => {
  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children],
  );

  // Ref array untuk menyimpan elemen DOM
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Array urutan logika. index[0] adalah kartu yang tampil di depan.
  const order = useRef<number[]>(
    Array.from({ length: childArr.length }, (_, i) => i),
  );

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);

  // Pastikan ref array sesuai panjang children
  useEffect(() => {
    elementsRef.current = elementsRef.current.slice(0, childArr.length);
  }, [childArr.length]);

  // Fungsi: Animasikan semua kartu ke posisi slot barunya
  const animateToSlots = (
    currentOrder: number[],
    duration: number = 0.5,
    ease: string = 'power3.out',
  ) => {
    currentOrder.forEach((originalIndex, slotIndex) => {
      const el = elementsRef.current[originalIndex];
      if (!el) return;

      const slot = makeSlot(
        slotIndex,
        cardDistance,
        verticalDistance,
        childArr.length,
      );

      gsap.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        zIndex: slot.zIndex,
        duration: duration,
        ease: ease,
        overwrite: true, // Hentikan animasi sebelumnya pada elemen ini
      });
    });
  };

  // Fungsi: Auto Swap (looping biasa)
  const swap = () => {
    if (order.current.length < 2) return;

    const [front, ...rest] = order.current;
    const elFront = elementsRef.current[front];

    if (!elFront) return;

    const tl = gsap.timeline();
    tlRef.current = tl;

    // 1. Jatuhkan kartu depan
    tl.to(elFront, {
      y: '+=300',
      z: -100,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    });

    // 2. Majukan kartu lainnya
    tl.addLabel('move', '-=0.2');
    rest.forEach((idx, i) => {
      const el = elementsRef.current[idx];
      if (!el) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, childArr.length);

      // Update Z-Index segera agar tumpukan benar
      tl.set(el, { zIndex: slot.zIndex }, 'move');
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: 0.6,
          ease: 'elastic.out(0.8, 0.8)',
        },
        `move+=${i * 0.05}`,
      );
    });

    // 3. Kembalikan kartu depan ke posisi paling belakang
    const backSlot = makeSlot(
      childArr.length - 1,
      cardDistance,
      verticalDistance,
      childArr.length,
    );

    tl.call(() => {
      gsap.set(elFront, { zIndex: backSlot.zIndex });
    });

    tl.to(elFront, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });

    // Update urutan state internal
    tl.call(() => {
      order.current = [...rest, front];
    });
  };

  // Fungsi: Click Handler (Bawa ke Depan)
  const bringToFront = (clickedOriginalIndex: number) => {
    // Cari posisi kartu ini sekarang ada di urutan ke berapa
    const currentPos = order.current.indexOf(clickedOriginalIndex);

    // Jika sudah paling depan (index 0), tidak perlu apa-apa
    if (currentPos === 0) return;

    // 1. Hentikan animasi berjalan
    if (tlRef.current) tlRef.current.kill();
    clearInterval(intervalRef.current);

    // 2. Susun ulang array: Ambil item yg diklik, taruh di depan (unshift)
    const newOrder = [...order.current];
    const [item] = newOrder.splice(currentPos, 1);
    newOrder.unshift(item);
    order.current = newOrder;

    // 3. Animasikan perpindahan posisi secara visual
    animateToSlots(newOrder, 0.6, 'power4.out');

    // 4. Restart timer auto-swap
    intervalRef.current = window.setInterval(swap, delay);
  };

  useEffect(() => {
    // Initial Placement (Tanpa animasi saat mount)
    order.current.forEach((idx, i) => {
      const el = elementsRef.current[idx];
      if (el) {
        placeNow(
          el,
          makeSlot(i, cardDistance, verticalDistance, childArr.length),
          skewAmount,
        );
      }
    });

    // Start Loop
    intervalRef.current = window.setInterval(swap, delay);

    // Hover Pause Logic
    if (pauseOnHover) {
      const node = container.current;
      if (node) {
        const pause = () => clearInterval(intervalRef.current);
        const resume = () => {
          clearInterval(intervalRef.current); // Clear dulu biar aman
          intervalRef.current = window.setInterval(swap, delay);
        };
        node.addEventListener('mouseenter', pause);
        node.addEventListener('mouseleave', resume);
        return () => {
          node.removeEventListener('mouseenter', pause);
          node.removeEventListener('mouseleave', resume);
          clearInterval(intervalRef.current);
        };
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [
    childArr.length,
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
  ]);

  // Render Children
  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          // Menggunakan callback ref untuk menghindari error access ref during render
          ref: (el: HTMLDivElement | null) => {
            elementsRef.current[i] = el;
          },
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            // Panggil fungsi bringToFront
            bringToFront(i);
            // Panggil prop onCardClick original jika ada
            onCardClick?.(i);
            child.props.onClick?.(e);
          },
        } as any)
      : child,
  );

  return (
    <div
      ref={container}
      className="relative w-full h-full perspective-[1000px] flex items-center justify-center transform-style-3d"
      // Style ini untuk memastikan container tidak overflow aneh saat animasi
      style={{ minHeight: Number(height) + 100 }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ width, height }}
      >
        {rendered}
      </div>
    </div>
  );
};

export default CardSwap;
